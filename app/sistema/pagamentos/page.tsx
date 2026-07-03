'use client'

import { useState, useEffect, useMemo, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import SistemaNav from '@/components/SistemaNav'
import { createClient } from '@/lib/supabase-client'
import { gerarReciboPDF, carregarLogoBase64 } from '@/components/ReciboPDF'
import { gerarFaturaPDF } from '@/components/FaturaPDF'

type ContratoAtivo = {
  id: string
  cliente_id: string
  cliente_nome: string
  descricao: string | null
  valor_mensal: number
  dia_vencimento: number
}

type Pagamento = {
  id: string
  cliente_id: string
  mes_referencia: string
  valor: number
  data_vencimento: string
  data_pagamento: string | null
  valor_pago: number | null
  juros: number | null
  status: string
  metodo_pagamento: string | null
  nota_fiscal: string | null
  observacoes: string | null
  cliente: { nome: string; email: string | null; telefone: string | null } | null
  contrato_id: string | null
  contrato: { descricao: string | null } | null
}

const MESES_NOMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

const statusConfig: { [key: string]: { label: string; bg: string; color: string } } = {
  pago: { label: 'Pago', bg: '#e0ebd9', color: 'var(--green)' },
  pendente: { label: 'Pendente', bg: '#fff4e0', color: '#8a5a00' },
  atrasado: { label: 'Atrasado', bg: '#f5d6cd', color: 'var(--accent)' },
  cancelado: { label: 'Cancelado', bg: 'var(--line-soft)', color: 'var(--ink-muted)' },
}

function getFirstDayOfMonth(year: number, month: number): Date {
  const d = new Date(year, month, 1)
  d.setHours(0, 0, 0, 0)
  return d
}

function toISODate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export default function PagamentosPage() {
  const router = useRouter()
  const supabase = createClient()

  const [contratos, setContratos] = useState<ContratoAtivo[]>([])
  const [todosClientes, setTodosClientes] = useState<{ id: string; nome: string }[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [generating, setGenerating] = useState(false)
  const [gerandoRecibo, setGerandoRecibo] = useState<string | null>(null)
  const [gerandoFatura, setGerandoFatura] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Modal receita avulsa
  const [modalAvulsaOpen, setModalAvulsaOpen] = useState(false)
  const [savingAvulsa, setSavingAvulsa] = useState(false)
  const [avulsaTipo, setAvulsaTipo] = useState<'contrato' | 'livre'>('contrato')
  const [avulsaForm, setAvulsaForm] = useState({
    contrato_id: '',
    cliente_id_livre: '',
    descricao: '',
    valor: '',
    data_vencimento: toISODate(new Date()),
    ja_pago: true,
    data_pagamento: toISODate(new Date()),
    metodo_pagamento: 'PIX',
    observacoes: '',
  })

  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(() => getFirstDayOfMonth(hoje.getFullYear(), hoje.getMonth()))

  const [pagamentoForm, setPagamentoForm] = useState({
    data_pagamento: toISODate(new Date()),
    metodo_pagamento: 'PIX',
    valor_pago: '',
    nota_fiscal: '',
    observacoes: '',
  })

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/sistema/login')
      return
    }
    setUserEmail(user.email || '')

    const mesIni = toISODate(mesAtual)

    const [{ data: clientesData }, { data: pagamentosData }, { data: clientesAll }] = await Promise.all([
      supabase.from('contratos')
        .select('id, cliente_id, descricao, valor_mensal, dia_vencimento, clientes!inner(nome, status)')
        .eq('ativo', true)
        .eq('clientes.status', 'ativo')
        .order('dia_vencimento'),
      supabase.from('pagamentos')
        .select('*, cliente:clientes (nome, email, telefone), contrato:contratos (descricao)')
        .eq('mes_referencia', mesIni)
        .order('data_vencimento'),
      supabase.from('clientes').select('id, nome').order('nome'),
    ])

    if (clientesAll) setTodosClientes(clientesAll)

    if (clientesData) {
      setContratos(clientesData.map((c: any) => ({
        id: c.id,
        cliente_id: c.cliente_id,
        cliente_nome: c.clientes?.nome || 'Sem nome',
        descricao: c.descricao,
        valor_mensal: c.valor_mensal,
        dia_vencimento: c.dia_vencimento,
      })))
    }
    if (pagamentosData) {
      const hojeISO = toISODate(new Date())
      const atualizados = (pagamentosData as unknown as Pagamento[]).map((p) => {
        if (p.status === 'pendente' && p.data_vencimento < hojeISO) {
          return { ...p, status: 'atrasado' }
        }
        return p
      })
      setPagamentos(atualizados)

      const paraAtualizar = pagamentosData.filter((p: Pagamento) =>
        p.status === 'pendente' && p.data_vencimento < hojeISO
      )
      for (const p of paraAtualizar) {
        await supabase.from('pagamentos').update({ status: 'atrasado' }).eq('id', p.id)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [mesAtual])

  const stats = useMemo(() => {
    const previsto = pagamentos.reduce((s, p) => s + Number(p.valor || 0), 0)
    const recebido = pagamentos.filter((p) => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0)
    const pendente = pagamentos.filter((p) => p.status === 'pendente').reduce((s, p) => s + Number(p.valor), 0)
    const atrasado = pagamentos.filter((p) => p.status === 'atrasado').reduce((s, p) => s + Number(p.valor), 0)
    return { previsto, recebido, pendente, atrasado }
  }, [pagamentos])

  async function gerarFaturasDoMes() {
    setError('')
    setGenerating(true)

    const mesIni = toISODate(mesAtual)
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    const ultimoDia = getLastDayOfMonth(ano, mes)

    const { data: existentes } = await supabase
      .from('pagamentos')
      .select('contrato_id')
      .eq('mes_referencia', mesIni)

    const contratosJaCobrados = new Set((existentes || []).map((e) => e.contrato_id).filter(Boolean))
    const novasFaturas = contratos
      .filter((c) => !contratosJaCobrados.has(c.id))
      .map((c) => {
        const dia = Math.min(c.dia_vencimento, ultimoDia)
        const vencimento = new Date(ano, mes, dia)
        return {
          cliente_id: c.cliente_id,
          contrato_id: c.id,
          mes_referencia: mesIni,
          valor: c.valor_mensal,
          data_vencimento: toISODate(vencimento),
          status: 'pendente',
        }
      })

    if (novasFaturas.length === 0) {
      setError('Todas as faturas desse mês já foram geradas.')
      setGenerating(false)
      return
    }

    const { error: insertError } = await supabase.from('pagamentos').insert(novasFaturas)

    if (insertError) {
      setError('Erro: ' + insertError.message)
      setGenerating(false)
      return
    }

    setGenerating(false)
    await loadData()
  }

  async function gerarFaturaAvulsa(e: FormEvent) {
    e.preventDefault()
    if (!avulsaForm.valor) return
    if (avulsaTipo === 'contrato' && !avulsaForm.contrato_id) return
    if (avulsaTipo === 'livre' && (!avulsaForm.cliente_id_livre || !avulsaForm.descricao)) return
    setSavingAvulsa(true)
    setError('')

    let clienteId: string
    let contratoId: string | null = null

    if (avulsaTipo === 'contrato') {
      const contrato = contratos.find(c => c.id === avulsaForm.contrato_id)
      if (!contrato) { setSavingAvulsa(false); return }
      clienteId = contrato.cliente_id
      // contrato_id fica null: receita avulsa não é a mensalidade do contrato
    } else {
      clienteId = avulsaForm.cliente_id_livre
    }

    const mesIni = toISODate(mesAtual)

    const { error: insertError } = await supabase.from('pagamentos').insert({
      cliente_id: clienteId,
      contrato_id: null,
      mes_referencia: mesIni,
      valor: Number(avulsaForm.valor),
      data_vencimento: avulsaForm.data_vencimento,
      status: avulsaForm.ja_pago ? 'pago' : 'pendente',
      data_pagamento: avulsaForm.ja_pago ? avulsaForm.data_pagamento : null,
      metodo_pagamento: avulsaForm.ja_pago ? avulsaForm.metodo_pagamento : null,
      observacoes: [avulsaForm.descricao, avulsaForm.observacoes].filter(Boolean).join(' — ') || null,
    })

    if (insertError) { setError('Erro: ' + insertError.message); setSavingAvulsa(false); return }

    setModalAvulsaOpen(false)
    setAvulsaForm({ contrato_id: '', cliente_id_livre: '', descricao: '', valor: '', data_vencimento: toISODate(new Date()), ja_pago: true, data_pagamento: toISODate(new Date()), metodo_pagamento: 'PIX', observacoes: '' })
    setSavingAvulsa(false)
    await loadData()
  }

  function abrirModalPagamento(p: Pagamento) {
    setPagamentoSelecionado(p)
    setPagamentoForm({
      data_pagamento: p.data_pagamento || toISODate(new Date()),
      metodo_pagamento: p.metodo_pagamento || 'PIX',
      valor_pago: p.valor_pago ? String(p.valor_pago) : '',
      nota_fiscal: p.nota_fiscal || '',
      observacoes: p.observacoes || '',
    })
    setError('')
    setModalOpen(true)
  }

  async function marcarComoPago(e: FormEvent) {
    e.preventDefault()
    if (!pagamentoSelecionado) return
    setSaving(true)

    const valorOriginal = Number(pagamentoSelecionado.valor)
    const valorPago = pagamentoForm.valor_pago ? Number(pagamentoForm.valor_pago) : valorOriginal
    const juros = valorPago > valorOriginal ? valorPago - valorOriginal : 0

    const { error: updateError } = await supabase
      .from('pagamentos')
      .update({
        status: 'pago',
        data_pagamento: pagamentoForm.data_pagamento,
        metodo_pagamento: pagamentoForm.metodo_pagamento,
        valor_pago: valorPago,
        juros: juros > 0 ? juros : null,
        nota_fiscal: pagamentoForm.nota_fiscal || null,
        observacoes: pagamentoForm.observacoes || null,
      })
      .eq('id', pagamentoSelecionado.id)

    if (updateError) {
      setError('Erro: ' + updateError.message)
      setSaving(false)
      return
    }

    setModalOpen(false)
    setPagamentoSelecionado(null)
    setSaving(false)
    await loadData()
  }

  async function reverterParaPendente(id: string) {
    if (!confirm('Desmarcar essa fatura como paga? Ela voltará pro status pendente.')) return
    await supabase
      .from('pagamentos')
      .update({
        status: 'pendente',
        data_pagamento: null,
        metodo_pagamento: null,
      })
      .eq('id', id)
    await loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir essa fatura? Essa ação não pode ser desfeita.')) return
    await supabase.from('pagamentos').delete().eq('id', id)
    await loadData()
  }


  async function handleGerarFatura(p: Pagamento) {
    setGerandoFatura(p.id)
    try {
      const logoBase64 = await carregarLogoBase64()
      const { data: configData } = await supabase
        .from('configuracoes')
        .select('*')
        .single()
      if (!configData) { setError('Configure os dados da agência primeiro.'); return }
      const ultimoNumero = configData.ultimo_numero_fatura || 549
      const novoNumero = ultimoNumero + 1
      await supabase.from('configuracoes').update({ ultimo_numero_fatura: novoNumero }).eq('id', configData.id)
      await gerarFaturaPDF(p, configData, novoNumero, logoBase64 || undefined)
    } catch (err) {
      setError('Erro ao gerar fatura: ' + (err as Error).message)
    } finally {
      setGerandoFatura(null)
    }
  }
  async function handleGerarRecibo(p: Pagamento) {
    setGerandoRecibo(p.id)
    setError('')

    try {
      // Buscar configurações da agência
      const { data: config } = await supabase
        .from('configuracoes')
        .select('*')
        .limit(1)
        .single()

      if (!config) {
        setError('Configurações da agência não encontradas. Acesse Configurações no header.')
        setGerandoRecibo(null)
        return
      }

      // Carregar logo
      const logoBase64 = await carregarLogoBase64()

      // Gerar PDF
      await gerarReciboPDF(p, config, logoBase64 || undefined)
    } catch (err) {
      setError('Erro ao gerar recibo: ' + (err as Error).message)
    } finally {
      setGerandoRecibo(null)
    }
  }

  function mesAnterior() {
    const novo = new Date(mesAtual)
    novo.setMonth(novo.getMonth() - 1)
    setMesAtual(novo)
  }

  function mesSeguinte() {
    const novo = new Date(mesAtual)
    novo.setMonth(novo.getMonth() + 1)
    setMesAtual(novo)
  }

  function mesHoje() {
    setMesAtual(getFirstDayOfMonth(new Date().getFullYear(), new Date().getMonth()))
  }

  const mesNome = MESES_NOMES[mesAtual.getMonth()]
  const anoAtual = mesAtual.getFullYear()
  const ehMesAtual = mesAtual.getMonth() === new Date().getMonth() && mesAtual.getFullYear() === new Date().getFullYear()
  const mesLabel = `${mesNome.charAt(0).toUpperCase() + mesNome.slice(1)} de ${anoAtual}`

  const formatMoeda = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const formatDataBR = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString('pt-BR')

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--line)',
    borderRadius: '4px',
    fontSize: '14px',
    color: 'var(--ink)',
    background: 'var(--bg-card)',
    fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    color: 'var(--ink-soft)',
    marginBottom: '6px',
    fontWeight: 500,
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <Header userEmail={userEmail} />
      <SistemaNav />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Contas a Receber
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '6px' }}>
            Faturas mensais, recebimentos e emissão de documentos
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setModalAvulsaOpen(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'transparent', color: 'var(--ink)', padding: '12px 18px', borderRadius: '6px',
            fontSize: '14px', fontWeight: 500, border: '1px solid var(--line)', cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            + Receita avulsa
          </button>
          <button onClick={gerarFaturasDoMes} disabled={generating} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'var(--ink)', color: 'var(--bg)', padding: '12px 20px', borderRadius: '6px',
            fontSize: '14px', fontWeight: 500, border: 'none', cursor: generating ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', opacity: generating ? 0.6 : 1,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {generating ? 'Gerando faturas...' : 'Gerar faturas do mês'}
          </button>
        </div>
      </div>

      {/* Navegador de mês */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px',
        padding: '14px 18px', marginBottom: '20px', gap: '12px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={mesAnterior} style={{
            background: 'transparent', border: '1px solid var(--line)', borderRadius: '4px',
            padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
          }}>‹</button>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600 }}>
              {ehMesAtual ? 'Mês atual' : 'Mês'}
            </div>
            <div className="font-serif" style={{ fontSize: '20px', fontWeight: 600 }}>
              {mesLabel}
            </div>
          </div>
          <button onClick={mesSeguinte} style={{
            background: 'transparent', border: '1px solid var(--line)', borderRadius: '4px',
            padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
          }}>›</button>
        </div>
        {!ehMesAtual && (
          <button onClick={mesHoje} style={{
            background: 'transparent', border: 'none', color: 'var(--accent)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            textDecoration: 'underline', textUnderlineOffset: '2px',
          }}>Voltar pro mês atual</button>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1px',
        background: 'var(--line)', border: '1px solid var(--line)',
        marginBottom: '28px', borderRadius: '4px', overflow: 'hidden',
      }}>
        <StatCard label="Previsto" value={formatMoeda(stats.previsto)} />
        <StatCard label="Recebido" value={formatMoeda(stats.recebido)} color="var(--green)" />
        <StatCard label="Pendente" value={formatMoeda(stats.pendente)} color="#8a5a00" />
        <StatCard label="Atrasado" value={formatMoeda(stats.atrasado)} color={stats.atrasado > 0 ? 'var(--accent)' : undefined} />
      </div>

      {error && (
        <div style={{
          background: 'var(--accent-soft)', color: 'var(--accent)',
          padding: '12px 16px', borderRadius: '4px', fontSize: '13px',
          marginBottom: '20px',
        }}>
          {error}
        </div>
      )}

      {/* Lista de pagamentos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-muted)' }}>Carregando...</div>
      ) : pagamentos.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px dashed var(--line)', borderRadius: '8px',
          padding: '48px 24px', textAlign: 'center',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className="font-serif" style={{ fontSize: '22px', color: 'var(--ink)', marginBottom: '8px', fontWeight: 600 }}>
            Nenhuma fatura em {mesLabel}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '24px', maxWidth: '380px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Gere as faturas do mês para criar uma cobrança para cada cliente ativo, com o dia de vencimento de cada contrato.
          </p>
          <button onClick={gerarFaturasDoMes} disabled={generating} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'var(--ink)', color: 'var(--bg)', padding: '12px 24px', borderRadius: '6px',
            fontSize: '14px', fontWeight: 500, border: 'none', cursor: generating ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', opacity: generating ? 0.6 : 1,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {generating ? 'Gerando...' : `Gerar faturas de ${mesLabel}`}
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px', overflow: 'hidden' }}>
          {pagamentos.map((p, i) => {
            const cfg = statusConfig[p.status] || statusConfig.pendente
            return (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
                borderBottom: i < pagamentos.length - 1 ? '1px solid var(--line-soft)' : 'none',
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div className="font-serif" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>
                    {p.cliente?.nome || '—'}
                  </div>
                  {p.contrato?.descricao && (
                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 500, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {p.contrato.descricao}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                    Vence em {formatDataBR(p.data_vencimento)}
                    {p.data_pagamento && <> · Pago em {formatDataBR(p.data_pagamento)}</>}
                  </div>
                </div>

                <div style={{ minWidth: '110px', textAlign: 'right' }}>
                  <div className="font-serif" style={{ fontSize: '18px', fontWeight: 600 }}>
                    {formatMoeda(p.valor_pago != null ? p.valor_pago : Number(p.valor))}
                  </div>
                  {p.juros != null && p.juros > 0 && (
                    <div style={{ fontSize: '11px', color: '#8a5a00', fontWeight: 600 }}>
                      +{formatMoeda(p.juros)} juros
                    </div>
                  )}
                  {p.metodo_pagamento && (
                    <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                      via {p.metodo_pagamento}
                    </div>
                  )}
                </div>

                <span style={{
                  fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: '3px', fontWeight: 600,
                  background: cfg.bg, color: cfg.color, minWidth: '80px', textAlign: 'center',
                }}>
                  {cfg.label}
                </span>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {p.status === 'pago' ? (
                    <>
                      <button onClick={() => handleGerarRecibo(p)} disabled={gerandoRecibo === p.id} title="Gerar recibo em PDF" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '6px 12px', borderRadius: '4px', background: 'var(--green)', color: 'var(--bg)',
                        border: 'none', fontSize: '12px', fontWeight: 500,
                        cursor: gerandoRecibo === p.id ? 'not-allowed' : 'pointer',
                        opacity: gerandoRecibo === p.id ? 0.6 : 1, fontFamily: 'inherit',
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                        </svg>
                        {gerandoRecibo === p.id ? 'Gerando...' : 'Recibo'}
                      </button>
                      <button onClick={() => handleGerarFatura(p)} disabled={gerandoFatura === p.id} title="Gerar fatura em PDF" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '6px 12px', borderRadius: '4px', background: 'transparent', color: 'var(--ink-soft)',
                        border: '1px solid var(--line)', fontSize: '12px', fontWeight: 500,
                        cursor: gerandoFatura === p.id ? 'not-allowed' : 'pointer',
                        opacity: gerandoFatura === p.id ? 0.6 : 1, fontFamily: 'inherit',
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        {gerandoFatura === p.id ? 'Gerando...' : 'Fatura'}
                      </button>
                      <button onClick={() => reverterParaPendente(p.id)} title="Desfazer pagamento" style={{
                        padding: '6px 10px', borderRadius: '4px', background: 'transparent', color: 'var(--ink-muted)',
                        border: '1px solid var(--line)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        Reverter
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => abrirModalPagamento(p)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '6px 12px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                        border: 'none', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Marcar como pago
                      </button>
                      <button onClick={() => handleGerarFatura(p)} disabled={gerandoFatura === p.id} title="Gerar fatura em PDF" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '6px 12px', borderRadius: '4px', background: 'transparent', color: 'var(--ink-soft)',
                        border: '1px solid var(--line)', fontSize: '12px', fontWeight: 500,
                        cursor: gerandoFatura === p.id ? 'not-allowed' : 'pointer',
                        opacity: gerandoFatura === p.id ? 0.6 : 1, fontFamily: 'inherit',
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        {gerandoFatura === p.id ? 'Gerando...' : 'Fatura'}
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(p.id)} title="Excluir fatura" style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '30px', height: '30px', borderRadius: '4px', background: 'transparent',
                    color: 'var(--ink-muted)', border: '1px solid var(--line)', cursor: 'pointer',
                    fontFamily: 'inherit', flexShrink: 0,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Fatura Avulsa */}
      {modalAvulsaOpen && (
        <div onClick={() => setModalAvulsaOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.5)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          zIndex: 100, padding: '40px 20px', overflowY: 'auto',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--bg-card)', borderRadius: '8px', width: '100%', maxWidth: '540px',
            padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative',
          }}>
            <button onClick={() => setModalAvulsaOpen(false)} style={{
              position: 'absolute', top: '14px', right: '14px',
              background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer',
              color: 'var(--ink-muted)', lineHeight: 1,
            }}>×</button>

            <h3 className="font-serif" style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '4px' }}>
              Receita avulsa
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '20px' }}>
              Serviço pontual, consultoria ou qualquer receita fora da mensalidade.
            </p>

            {/* Toggle tipo */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {([['contrato', 'Cliente com contrato'], ['livre', 'Serviço avulso']] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => { setAvulsaTipo(val); setAvulsaForm(f => ({ ...f, contrato_id: '', cliente_id_livre: '', descricao: '', valor: '' })) }}
                  style={{
                    flex: 1, padding: '9px 14px', borderRadius: '4px', cursor: 'pointer',
                    border: avulsaTipo === val ? '2px solid var(--ink)' : '1px solid var(--line)',
                    background: avulsaTipo === val ? 'var(--ink)' : 'transparent',
                    color: avulsaTipo === val ? 'var(--bg)' : 'var(--ink-muted)',
                    fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
                  }}
                >{label}</button>
              ))}
            </div>

            <form onSubmit={gerarFaturaAvulsa}>
              {/* Modo contrato */}
              {avulsaTipo === 'contrato' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Cliente (contrato ativo) *</label>
                  <select
                    value={avulsaForm.contrato_id}
                    onChange={(e) => {
                      const contrato = contratos.find(c => c.id === e.target.value)
                      setAvulsaForm({ ...avulsaForm, contrato_id: e.target.value, cliente_id_livre: '', valor: contrato ? String(contrato.valor_mensal) : avulsaForm.valor })
                    }}
                    style={inputStyle}
                  >
                    <option value="">Selecione o cliente...</option>
                    {contratos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cliente_nome}{c.descricao ? ` — ${c.descricao}` : ''} ({formatMoeda(c.valor_mensal)}/mês)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Modo livre */}
              {avulsaTipo === 'livre' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Cliente *</label>
                    <select
                      value={avulsaForm.cliente_id_livre}
                      onChange={(e) => setAvulsaForm({ ...avulsaForm, cliente_id_livre: e.target.value, contrato_id: '' })}
                      style={inputStyle}
                    >
                      <option value="">Selecione...</option>
                      {todosClientes.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Descrição do serviço *</label>
                    <input
                      type="text"
                      value={avulsaForm.descricao}
                      onChange={(e) => setAvulsaForm({ ...avulsaForm, descricao: e.target.value })}
                      style={inputStyle}
                      placeholder="Ex: Criação de landing page"
                    />
                  </div>
                </div>
              )}


              {/* Valor e vencimento */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Valor (R$) *</label>
                  <input
                    type="number" step="0.01" required
                    value={avulsaForm.valor}
                    onChange={(e) => setAvulsaForm({ ...avulsaForm, valor: e.target.value })}
                    style={inputStyle} placeholder="0,00"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Data de vencimento *</label>
                  <input
                    type="date" required
                    value={avulsaForm.data_vencimento}
                    onChange={(e) => setAvulsaForm({ ...avulsaForm, data_vencimento: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Já pago? */}
              <div style={{ padding: '14px 16px', background: avulsaForm.ja_pago ? '#e0ebd9' : 'var(--line-soft)', borderRadius: '6px', marginBottom: avulsaForm.ja_pago ? '16px' : '20px', transition: 'background 0.15s' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={avulsaForm.ja_pago}
                    onChange={(e) => setAvulsaForm({ ...avulsaForm, ja_pago: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--green)' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>
                    Já foi pago — dar baixa imediatamente
                  </span>
                </label>
              </div>

              {/* Detalhes do pagamento (condicional) */}
              {avulsaForm.ja_pago && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Data do pagamento *</label>
                    <input
                      type="date" required={avulsaForm.ja_pago}
                      value={avulsaForm.data_pagamento}
                      onChange={(e) => setAvulsaForm({ ...avulsaForm, data_pagamento: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Método *</label>
                    <select
                      value={avulsaForm.metodo_pagamento}
                      onChange={(e) => setAvulsaForm({ ...avulsaForm, metodo_pagamento: e.target.value })}
                      style={inputStyle}
                    >
                      {['PIX', 'Boleto', 'Transferência', 'Cartão', 'Dinheiro', 'Outro'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Observações</label>
                <input
                  type="text"
                  value={avulsaForm.observacoes}
                  onChange={(e) => setAvulsaForm({ ...avulsaForm, observacoes: e.target.value })}
                  style={inputStyle} placeholder="Opcional"
                />
              </div>

              {error && (
                <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalAvulsaOpen(false)} style={{
                  padding: '10px 18px', borderRadius: '4px', fontSize: '14px', fontWeight: 500,
                  color: 'var(--ink-soft)', border: '1px solid var(--line)', background: 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Cancelar</button>
                <button type="submit" disabled={savingAvulsa} style={{
                  padding: '10px 20px', borderRadius: '4px',
                  background: avulsaForm.ja_pago ? 'var(--green)' : 'var(--ink)',
                  color: 'var(--bg)', border: 'none', fontSize: '14px', fontWeight: 500,
                  cursor: savingAvulsa ? 'not-allowed' : 'pointer',
                  opacity: savingAvulsa ? 0.6 : 1, fontFamily: 'inherit',
                }}>
                  {savingAvulsa ? 'Salvando...' : avulsaForm.ja_pago ? 'Gerar e dar baixa' : 'Gerar fatura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && pagamentoSelecionado && (
        <div onClick={() => setModalOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.5)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          zIndex: 100, padding: '40px 20px', overflowY: 'auto',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--bg-card)', borderRadius: '8px', width: '100%', maxWidth: '520px',
            padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative',
          }}>
            <button onClick={() => setModalOpen(false)} style={{
              position: 'absolute', top: '14px', right: '14px',
              background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer',
              color: 'var(--ink-muted)', lineHeight: 1,
            }}>×</button>

            <h3 className="font-serif" style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '6px' }}>
              Marcar como pago
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '20px' }}>
              {pagamentoSelecionado.cliente?.nome}
            </p>

            <form onSubmit={marcarComoPago}>
              {/* Valores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Valor original</label>
                  <div style={{ ...inputStyle, background: 'var(--line-soft)', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center' }}>
                    {formatMoeda(Number(pagamentoSelecionado.valor))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Valor recebido</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={pagamentoForm.valor_pago}
                    onChange={(e) => setPagamentoForm({ ...pagamentoForm, valor_pago: e.target.value })}
                    style={inputStyle}
                    placeholder={String(pagamentoSelecionado.valor)}
                  />
                </div>
              </div>

              {/* Destaque de juros */}
              {pagamentoForm.valor_pago && Number(pagamentoForm.valor_pago) > Number(pagamentoSelecionado.valor) && (
                <div style={{
                  background: '#fff4e0', border: '1px solid #f0c060', borderRadius: '6px',
                  padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a5a00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ fontSize: '13px', color: '#8a5a00' }}>
                    <strong>{formatMoeda(Number(pagamentoForm.valor_pago) - Number(pagamentoSelecionado.valor))}</strong> de juros / mora
                  </span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Data do pagamento *</label>
                  <input type="date" required value={pagamentoForm.data_pagamento}
                    onChange={(e) => setPagamentoForm({ ...pagamentoForm, data_pagamento: e.target.value })}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Método *</label>
                  <select value={pagamentoForm.metodo_pagamento}
                    onChange={(e) => setPagamentoForm({ ...pagamentoForm, metodo_pagamento: e.target.value })}
                    style={inputStyle}>
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Transferência">Transferência</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Nota fiscal (número)</label>
                <input type="text" value={pagamentoForm.nota_fiscal}
                  onChange={(e) => setPagamentoForm({ ...pagamentoForm, nota_fiscal: e.target.value })}
                  style={inputStyle} placeholder="Opcional" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Observações</label>
                <textarea value={pagamentoForm.observacoes}
                  onChange={(e) => setPagamentoForm({ ...pagamentoForm, observacoes: e.target.value })}
                  style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                  placeholder="Opcional" />
              </div>

              {error && (
                <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{
                  padding: '10px 18px', borderRadius: '4px', fontSize: '14px', fontWeight: 500,
                  color: 'var(--ink-soft)', border: '1px solid var(--line)', background: 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{
                  padding: '10px 20px', borderRadius: '4px', background: 'var(--green)', color: 'var(--bg)',
                  border: 'none', fontSize: '14px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1, fontFamily: 'inherit',
                }}>{saving ? 'Salvando...' : 'Confirmar pagamento'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', padding: '20px 22px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '8px', fontWeight: 600 }}>
        {label}
      </div>
      <div className="font-serif" style={{ fontSize: '28px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em', color: color || 'var(--ink)' }}>
        {value}
      </div>
    </div>
  )
}