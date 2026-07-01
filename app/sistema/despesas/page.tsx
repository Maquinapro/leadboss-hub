'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import SistemaNav from '@/components/SistemaNav'
import { createClient } from '@/lib/supabase-client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'

// ─── Types ──────────────────────────────────────────────────

type Cartao = {
  id: string
  nome: string
  bandeira: string | null
  ultimos_digitos: string | null
  cor: string
  ativo: boolean
}

type ContaCorrente = {
  id: string
  nome: string
  banco: string
  agencia: string | null
  conta: string | null
  digito: string | null
  pix: string | null
  tipo: 'empresa' | 'fisica'
  ativo: boolean
}

type Despesa = {
  id: string
  descricao: string
  categoria: string
  origem: string
  forma_pagamento: string
  cartao_id: string | null
  valor_total: number
  parcelas: number
  mes_inicio: string
  status: string
  observacoes: string | null
  data_vencimento: string | null
  data_pagamento: string | null
  recorrente: boolean
  conta_corrente_id: string | null
  cartao?: { nome: string; cor: string } | null
  conta_corrente?: { nome: string; banco: string; tipo: string } | null
}

type PagamentoMes = {
  mes_referencia: string
  valor: number
  status: string
}

// ─── Constants ──────────────────────────────────────────────

const CATEGORIAS: { value: string; label: string }[] = [
  { value: 'software_ia', label: 'Software / IA' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'impostos', label: 'Impostos' },
  { value: 'emprestimo', label: 'Empréstimo' },
  { value: 'moradia', label: 'Moradia' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'saude', label: 'Saúde' },
  { value: 'pets', label: 'Pets' },
  { value: 'pessoal', label: 'Pessoal' },
  { value: 'outros', label: 'Outros' },
]

const FORMAS: { value: string; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'cartao', label: 'Cartão de crédito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'debito', label: 'Débito automático' },
  { value: 'dinheiro', label: 'Dinheiro' },
]

const MESES_NOMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const MESES_FULL = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const BANCOS_BR = [
  'Nubank', 'Itaú', 'Bradesco', 'Santander', 'Banco do Brasil',
  'Caixa Econômica', 'Inter', 'C6 Bank', 'BTG', 'Sicredi',
  'Sicoob', 'XP', 'Mercado Pago', 'PicPay', 'Neon', 'Outro',
]

const CAT_LABELS: { [key: string]: string } = {
  software_ia: 'Software / IA', marketing: 'Marketing', impostos: 'Impostos',
  emprestimo: 'Empréstimo', moradia: 'Moradia', alimentacao: 'Alimentação',
  saude: 'Saúde', pets: 'Pets', pessoal: 'Pessoal', outros: 'Outros',
}

const ORIGEM_LABELS: { [key: string]: string } = {
  agencia: 'Agência', gustavo: 'Pessoal — Gustavo',
  esposa: 'Pessoal — Esposa', casa: 'Casa',
}

// ─── Helpers ────────────────────────────────────────────────

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Page ───────────────────────────────────────────────────

export default function DespesasPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userEmail, setUserEmail] = useState('')
  const [cartoes, setCartoes] = useState<Cartao[]>([])
  const [contasCorrentes, setContasCorrentes] = useState<ContaCorrente[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [todasDespesas, setTodasDespesas] = useState<Despesa[]>([]) // para gráfico 6 meses
  const [pagamentos6m, setPagamentos6m] = useState<PagamentoMes[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'despesas' | 'cartoes' | 'contas'>('despesas')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1))

  // ── Despesa form
  const [form, setForm] = useState({
    descricao: '',
    categoria: 'software_ia',
    forma_pagamento: 'pix',
    cartao_id: '',
    valor_total: '',
    parcelas: '1',
    mes_inicio: toISODate(new Date()),
    data_vencimento: '',
    data_pagamento: '',
    recorrente: false,
    observacoes: '',
  })

  // ── Cartão form
  const [cartaoForm, setCartaoForm] = useState({ nome: '', bandeira: '', ultimos_digitos: '', cor: '#2d6a8f' })
  const [savingCartao, setSavingCartao] = useState(false)
  const [showCartaoForm, setShowCartaoForm] = useState(false)
  const [editingCartao, setEditingCartao] = useState<Cartao | null>(null)

  // ── Conta corrente form
  const [contaForm, setContaForm] = useState({
    nome: '', banco: '', agencia: '', conta: '', digito: '', pix: '', tipo: 'empresa' as 'empresa' | 'fisica',
  })
  const [savingConta, setSavingConta] = useState(false)
  const [showContaForm, setShowContaForm] = useState(false)
  const [errorConta, setErrorConta] = useState('')
  const [editingConta, setEditingConta] = useState<ContaCorrente | null>(null)

  // ── Modal de baixa
  const [modalBaixa, setModalBaixa] = useState<{ id: string; data: string; conta_corrente_id: string } | null>(null)
  const [savingBaixa, setSavingBaixa] = useState(false)

  // ── Load ────────────────────────────────────────────────

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sistema/login'); return }
      setUserEmail(user.email || '')
      await loadAll()
    }
    init()
  }, [mesAtual])

  async function loadAll() {
    setLoading(true)
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()

    // 6 meses atrás para o gráfico
    const seisAtras = new Date(ano, mes - 5, 1)
    const seisAtrasISO = toISODate(seisAtras)

    const [
      { data: cartoesData },
      { data: contasData },
      { data: despesasData },
      { data: todasData },
      { data: pagamentosData },
    ] = await Promise.all([
      supabase.from('cartoes').select('*').eq('ativo', true).order('nome'),
      supabase.from('contas_correntes').select('*').eq('ativo', true).order('nome'),
      supabase.from('despesas')
        .select('*, cartao:cartoes(nome, cor), conta_corrente:contas_correntes(nome, banco, tipo)')
        .order('mes_inicio'),
      supabase.from('despesas').select('id, valor_total, parcelas, mes_inicio, status').order('mes_inicio'),
      supabase.from('pagamentos')
        .select('mes_referencia, valor, status')
        .eq('status', 'pago')
        .gte('mes_referencia', seisAtrasISO),
    ])

    if (cartoesData) setCartoes(cartoesData)
    if (contasData) setContasCorrentes(contasData as ContaCorrente[])
    if (pagamentosData) setPagamentos6m(pagamentosData as PagamentoMes[])
    if (todasData) setTodasDespesas(todasData as Despesa[])

    if (despesasData) {
      const doMes = (despesasData as Despesa[]).filter((d) => {
        const inicio = new Date(d.mes_inicio)
        const fim = new Date(inicio.getFullYear(), inicio.getMonth() + (d.parcelas - 1), 1)
        const atual = new Date(ano, mes, 1)
        return inicio <= atual && atual <= fim
      })
      setDespesas(doMes)
    }
    setLoading(false)
  }

  // ── Stats ────────────────────────────────────────────────

  const statsMes = useMemo(() => {
    const total = despesas.reduce((s, d) => s + Number(d.valor_total) / d.parcelas, 0)
    const pago = despesas.filter(d => d.status === 'pago').reduce((s, d) => s + Number(d.valor_total) / d.parcelas, 0)
    const pendente = despesas.filter(d => d.status === 'pendente').reduce((s, d) => s + Number(d.valor_total) / d.parcelas, 0)
    return { total, pago, pendente }
  }, [despesas])

  // ── Dados do gráfico (6 meses) ──────────────────────────

  const dadosGrafico = useMemo(() => {
    const meses: { ano: number; mes: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(mesAtual.getFullYear(), mesAtual.getMonth() - i, 1)
      meses.push({ ano: d.getFullYear(), mes: d.getMonth() })
    }

    return meses.map(({ ano, mes }) => {
      const mesISO = `${ano}-${String(mes + 1).padStart(2, '0')}-01`

      // Receita: pagamentos pagos nesse mês
      const receita = pagamentos6m
        .filter(p => p.mes_referencia === mesISO && p.status === 'pago')
        .reduce((s, p) => s + Number(p.valor), 0)

      // Despesa: fatia de cada despesa que cai nesse mês
      const despesaMes = todasDespesas.reduce((s, d) => {
        const inicio = new Date(d.mes_inicio)
        const fim = new Date(inicio.getFullYear(), inicio.getMonth() + (d.parcelas - 1), 1)
        const atual = new Date(ano, mes, 1)
        if (inicio <= atual && atual <= fim) {
          return s + Number(d.valor_total) / d.parcelas
        }
        return s
      }, 0)

      const resultado = receita - despesaMes
      return {
        label: `${MESES_NOMES[mes]}/${String(ano).slice(2)}`,
        receita: Math.round(receita),
        despesa: Math.round(despesaMes),
        resultado: Math.round(resultado),
        isAtual: ano === mesAtual.getFullYear() && mes === mesAtual.getMonth(),
      }
    })
  }, [mesAtual, pagamentos6m, todasDespesas])

  const mesAtualData = dadosGrafico.find(d => d.isAtual) || { receita: 0, despesa: 0, resultado: 0 }

  // ── Handlers ────────────────────────────────────────────

  async function handleAddDespesa() {
    if (!form.descricao || !form.valor_total) return
    setSaving(true); setError('')
    const { error: err } = await supabase.from('despesas').insert({
      descricao: form.descricao,
      categoria: form.categoria,
      origem: 'agencia',
      forma_pagamento: form.forma_pagamento,
      cartao_id: form.forma_pagamento === 'cartao' && form.cartao_id ? form.cartao_id : null,
      valor_total: Number(form.valor_total),
      parcelas: Number(form.parcelas),
      mes_inicio: form.mes_inicio,
      data_vencimento: form.data_vencimento || null,
      data_pagamento: form.data_pagamento || null,
      recorrente: form.recorrente,
      observacoes: form.observacoes || null,
      status: 'pendente',
    })
    if (err) { setError('Erro: ' + err.message); setSaving(false); return }
    setForm({ descricao: '', categoria: 'software_ia', forma_pagamento: 'pix', cartao_id: '', valor_total: '', parcelas: '1', mes_inicio: toISODate(new Date()), data_vencimento: '', data_pagamento: '', recorrente: false, observacoes: '' })
    setShowForm(false); setSaving(false)
    await loadAll()
  }

  async function handleToggleStatus(id: string, status: string) {
    if (status !== 'pago') {
      // abrir modal de baixa
      setModalBaixa({ id, data: todayISO(), conta_corrente_id: '' })
      return
    }
    // desfazer baixa
    await supabase.from('despesas').update({ status: 'pendente', data_pagamento: null, conta_corrente_id: null }).eq('id', id)
    await loadAll()
  }

  async function handleConfirmarBaixa() {
    if (!modalBaixa) return
    setSavingBaixa(true)
    await supabase.from('despesas').update({
      status: 'pago',
      data_pagamento: modalBaixa.data || todayISO(),
      conta_corrente_id: modalBaixa.conta_corrente_id || null,
    }).eq('id', modalBaixa.id)
    setModalBaixa(null)
    setSavingBaixa(false)
    await loadAll()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir essa despesa?')) return
    await supabase.from('despesas').delete().eq('id', id)
    await loadAll()
  }

  async function handleAddCartao() {
    if (!cartaoForm.nome) return
    setSavingCartao(true)

    if (editingCartao) {
      await supabase.from('cartoes').update({
        nome: cartaoForm.nome, bandeira: cartaoForm.bandeira || null,
        ultimos_digitos: cartaoForm.ultimos_digitos || null, cor: cartaoForm.cor,
      }).eq('id', editingCartao.id)
      setEditingCartao(null)
    } else {
      await supabase.from('cartoes').insert({
        nome: cartaoForm.nome, bandeira: cartaoForm.bandeira || null,
        ultimos_digitos: cartaoForm.ultimos_digitos || null, cor: cartaoForm.cor,
      })
    }

    setCartaoForm({ nome: '', bandeira: '', ultimos_digitos: '', cor: '#2d6a8f' })
    setShowCartaoForm(false); setSavingCartao(false)
    const { data } = await supabase.from('cartoes').select('*').eq('ativo', true).order('nome')
    if (data) setCartoes(data)
  }

  function abrirEdicaoCartao(c: Cartao) {
    setEditingCartao(c)
    setCartaoForm({ nome: c.nome, bandeira: c.bandeira || '', ultimos_digitos: c.ultimos_digitos || '', cor: c.cor })
    setShowCartaoForm(true)
  }

  async function handleDesativarCartao(id: string) {
    if (!confirm('Remover esse cartão?')) return
    await supabase.from('cartoes').update({ ativo: false }).eq('id', id)
    const { data } = await supabase.from('cartoes').select('*').eq('ativo', true).order('nome')
    if (data) setCartoes(data)
  }

  async function handleAddConta() {
    if (!contaForm.nome || !contaForm.banco) return
    setSavingConta(true)
    setErrorConta('')

    const payload = {
      nome: contaForm.nome, banco: contaForm.banco,
      agencia: contaForm.agencia || null, conta: contaForm.conta || null,
      digito: contaForm.digito || null, pix: contaForm.pix || null,
      tipo: contaForm.tipo,
    }

    const { error: err } = editingConta
      ? await supabase.from('contas_correntes').update(payload).eq('id', editingConta.id)
      : await supabase.from('contas_correntes').insert(payload)

    if (err) {
      setErrorConta('Erro ao salvar: ' + err.message)
      setSavingConta(false)
      return
    }

    setContaForm({ nome: '', banco: '', agencia: '', conta: '', digito: '', pix: '', tipo: 'empresa' })
    setEditingConta(null)
    setShowContaForm(false)
    setSavingConta(false)
    const { data } = await supabase.from('contas_correntes').select('*').eq('ativo', true).order('nome')
    if (data) setContasCorrentes(data as ContaCorrente[])
  }

  function abrirEdicaoConta(c: ContaCorrente) {
    setEditingConta(c)
    setContaForm({ nome: c.nome, banco: c.banco, agencia: c.agencia || '', conta: c.conta || '', digito: c.digito || '', pix: c.pix || '', tipo: c.tipo })
    setShowContaForm(true)
    setErrorConta('')
  }

  async function handleDesativarConta(id: string) {
    if (!confirm('Remover essa conta?')) return
    await supabase.from('contas_correntes').update({ ativo: false }).eq('id', id)
    const { data } = await supabase.from('contas_correntes').select('*').eq('ativo', true).order('nome')
    if (data) setContasCorrentes(data as ContaCorrente[])
  }

  // ── Format ───────────────────────────────────────────────

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
  const fmtDec = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

  const parcelaValor = form.valor_total && form.parcelas
    ? Number(form.valor_total) / Number(form.parcelas)
    : null

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--line)',
    borderRadius: '4px', fontSize: '14px', color: 'var(--ink)',
    background: 'var(--bg-card)', fontFamily: 'inherit',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '6px', fontWeight: 500,
  }

  const isLucro = mesAtualData.resultado >= 0

  // ── Tooltip do gráfico ───────────────────────────────────

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const data = payload[0]?.payload
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px', padding: '12px 16px', fontSize: '13px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>{label}</div>
        <div style={{ color: 'var(--green)', marginBottom: '4px' }}>Receita: {fmt(data.receita)}</div>
        <div style={{ color: 'var(--accent)', marginBottom: '4px' }}>Despesa: {fmt(data.despesa)}</div>
        <div style={{ color: data.resultado >= 0 ? 'var(--green)' : 'var(--accent)', fontWeight: 600, borderTop: '1px solid var(--line-soft)', paddingTop: '6px', marginTop: '4px' }}>
          {data.resultado >= 0 ? '+' : ''}{fmt(data.resultado)}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <Header userEmail={userEmail} />
      <SistemaNav />

      {/* Título */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Contas a Pagar
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '6px' }}>
            Saídas do mês: softwares, impostos, cartões e despesas parceladas
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['despesas', 'cartoes', 'contas'] as const).map((s) => (
            <button key={s} onClick={() => setActiveSection(s)} style={{
              padding: '10px 18px', borderRadius: '4px', fontSize: '13px', fontWeight: 500,
              fontFamily: 'inherit', cursor: 'pointer',
              background: activeSection === s ? 'var(--ink)' : 'transparent',
              color: activeSection === s ? 'var(--bg)' : 'var(--ink-soft)',
              border: '1px solid var(--line)',
            }}>
              {s === 'despesas' ? 'Despesas' : s === 'cartoes' ? 'Cartões' : 'Contas Correntes'}
            </button>
          ))}
        </div>
      </div>

      {/* ── DESPESAS ────────────────────────────────────── */}
      {activeSection === 'despesas' && (
        <>
          {/* Navegador de mês */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: '4px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <span style={{ fontWeight: 600, fontSize: '16px', minWidth: '180px', textAlign: 'center' }}>
              {MESES_FULL[mesAtual.getMonth()]} de {mesAtual.getFullYear()}
            </span>
            <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: '4px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            {(mesAtual.getMonth() !== hoje.getMonth() || mesAtual.getFullYear() !== hoje.getFullYear()) && (
              <button onClick={() => setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1))} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                Mês atual
              </button>
            )}
          </div>

          {/* Stats + Resultado */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', background: 'var(--line)', border: '1px solid var(--line)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
            <StatCard label="Total do mês" value={fmtDec(statsMes.total)} />
            <StatCard label="Pago" value={fmtDec(statsMes.pago)} color="var(--green)" />
            <StatCard label="Pendente" value={fmtDec(statsMes.pendente)} color="#8a5a00" />
            <div style={{ background: isLucro ? '#e0ebd9' : '#f5d6cd', padding: '18px 20px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: isLucro ? 'var(--green)' : 'var(--accent)', marginBottom: '6px', fontWeight: 700 }}>
                {isLucro ? '▲ Lucro' : '▼ Prejuízo'}
              </div>
              <div className="font-serif" style={{ fontSize: 'clamp(16px, 3vw, 26px)', fontWeight: 700, color: isLucro ? 'var(--green)' : 'var(--accent)' }}>
                {isLucro ? '+' : ''}{fmt(mesAtualData.resultado)}
              </div>
              <div style={{ fontSize: '11px', color: isLucro ? 'var(--green)' : 'var(--accent)', marginTop: '4px', opacity: 0.8 }}>
                Receita {fmt(mesAtualData.receita)} · Despesa {fmt(mesAtualData.despesa)}
              </div>
            </div>
          </div>

          {/* Gráfico 6 meses */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', padding: '20px 24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '4px' }}>Visão dos últimos 6 meses</div>
                <h3 className="font-serif" style={{ fontSize: '20px', fontWeight: 600 }}>Receita vs Despesa</h3>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--ink-muted)' }}>
                <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: 'var(--green)', marginRight: '5px' }} />Receita</span>
                <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent)', marginRight: '5px' }} />Despesa</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosGrafico} barGap={4} barSize={20}>
                <CartesianGrid vertical={false} stroke="var(--line-soft)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--ink-muted)', fontFamily: 'Inter Tight, sans-serif' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--ink-muted)', fontFamily: 'Inter Tight, sans-serif' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="var(--line)" />
                <Bar dataKey="receita" fill="var(--green)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="despesa" radius={[3, 3, 0, 0]}>
                  {dadosGrafico.map((entry, index) => (
                    <Cell key={index} fill={entry.isAtual ? '#c8472b' : '#e8a89e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Linha de resultado por mês */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '16px', flexWrap: 'wrap' }}>
              {dadosGrafico.map((d, i) => (
                <div key={i} style={{
                  flex: 1, minWidth: '60px', textAlign: 'center', padding: '8px 6px', borderRadius: '4px',
                  background: d.resultado >= 0 ? '#e0ebd9' : '#f5d6cd',
                  border: d.isAtual ? `1px solid ${d.resultado >= 0 ? 'var(--green)' : 'var(--accent)'}` : '1px solid transparent',
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--ink-muted)', marginBottom: '3px' }}>{d.label}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: d.resultado >= 0 ? 'var(--green)' : 'var(--accent)' }}>
                    {d.resultado >= 0 ? '+' : ''}{fmt(d.resultado)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botão nova despesa */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={() => setShowForm(!showForm)} style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '10px 20px', borderRadius: '6px', background: 'var(--ink)', color: 'var(--bg)',
              border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {showForm ? 'Cancelar' : 'Nova despesa'}
            </button>
          </div>

          {/* Formulário */}
          {showForm && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
              <h3 className="font-serif" style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Nova despesa</h3>

              {/* Linha 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Descrição *</label>
                  <input type="text" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} style={inputStyle} placeholder="Ex: Hotmart, Conta de luz, Parcela do empréstimo..." />
                </div>
                <div>
                  <label style={labelStyle}>Categoria *</label>
                  <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} style={inputStyle}>
                    {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Forma de pagamento</label>
                  <select value={form.forma_pagamento} onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value, cartao_id: '' })} style={inputStyle}>
                    {FORMAS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Cartão (condicional) */}
              {form.forma_pagamento === 'cartao' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Cartão *</label>
                  <select value={form.cartao_id} onChange={(e) => setForm({ ...form, cartao_id: e.target.value })} style={inputStyle}>
                    <option value="">Selecione o cartão...</option>
                    {cartoes.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.ultimos_digitos ? ` ···· ${c.ultimos_digitos}` : ''}</option>)}
                  </select>
                </div>
              )}

              {/* Linha 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Valor total (R$) *</label>
                  <input type="number" step="0.01" value={form.valor_total} onChange={(e) => setForm({ ...form, valor_total: e.target.value })} style={inputStyle} placeholder="0,00" />
                </div>
                <div>
                  <label style={labelStyle}>Parcelas</label>
                  <input type="number" min="1" max="120" value={form.parcelas} onChange={(e) => setForm({ ...form, parcelas: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Mês inicial</label>
                  <input type="month" value={form.mes_inicio.substring(0, 7)} onChange={(e) => setForm({ ...form, mes_inicio: e.target.value + '-01' })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Vencimento</label>
                  <input type="date" value={form.data_vencimento} onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })} style={inputStyle} placeholder="Dia de vencer" />
                </div>
              </div>

              {/* Preview parcelas */}
              {parcelaValor && Number(form.parcelas) > 1 && (
                <div style={{ background: 'var(--line-soft)', borderRadius: '4px', padding: '10px 14px', marginBottom: '12px', fontSize: '13px', color: 'var(--ink-soft)' }}>
                  {form.parcelas}x de <strong style={{ color: 'var(--ink)' }}>{fmtDec(parcelaValor)}</strong>
                  {' '}— de {MESES_FULL[new Date(form.mes_inicio).getMonth()]} até {(() => {
                    const fim = new Date(new Date(form.mes_inicio).getFullYear(), new Date(form.mes_inicio).getMonth() + Number(form.parcelas) - 1, 1)
                    return `${MESES_FULL[fim.getMonth()]} de ${fim.getFullYear()}`
                  })()}
                </div>
              )}

              {/* Recorrente + Observações */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Observações</label>
                  <input type="text" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} style={inputStyle} placeholder="Opcional..." />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0', cursor: 'pointer', fontSize: '14px', color: 'var(--ink)', whiteSpace: 'nowrap', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={form.recorrente}
                    onChange={(e) => setForm({ ...form, recorrente: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--ink)' }}
                  />
                  Despesa recorrente
                </label>
              </div>

              {error && <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleAddDespesa} disabled={saving || !form.descricao || !form.valor_total} style={{
                  padding: '10px 24px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                  border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  opacity: saving || !form.descricao || !form.valor_total ? 0.4 : 1,
                }}>
                  {saving ? 'Salvando...' : 'Adicionar despesa'}
                </button>
              </div>
            </div>
          )}

          {/* Lista */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-muted)' }}>Carregando...</div>
          ) : despesas.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--line)', borderRadius: '6px', padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
              <p style={{ fontSize: '14px' }}>Nenhuma despesa neste mês.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {despesas.map((d) => {
                const valorMes = Number(d.valor_total) / d.parcelas
                const isPago = d.status === 'pago'
                const hoje2 = todayISO()
                const vencido = !isPago && d.data_vencimento && d.data_vencimento < hoje2
                const venceHoje = !isPago && d.data_vencimento && d.data_vencimento === hoje2
                const conta = d.conta_corrente
                const origemLabel = conta
                  ? `${conta.nome} — ${conta.banco}`
                  : ORIGEM_LABELS[d.origem] || d.origem

                return (
                  <div key={d.id} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px',
                    padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
                    opacity: isPago ? 0.75 : 1,
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)', textDecoration: isPago ? 'line-through' : 'none' }}>
                          {d.descricao}
                        </span>
                        {d.parcelas > 1 && (
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '3px', background: 'var(--line-soft)', color: 'var(--ink-muted)', fontWeight: 600 }}>
                            {d.parcelas}x
                          </span>
                        )}
                        {d.recorrente && (
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '3px', background: '#e3eef7', color: 'var(--blue)', fontWeight: 600 }}>
                            Recorrente
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px', color: 'var(--ink-muted)' }}>
                        <span style={{ fontWeight: 600 }}>{CAT_LABELS[d.categoria] || d.categoria}</span>
                        {origemLabel && <><span>·</span><span>{origemLabel}</span></>}
                        {d.cartao && <><span>·</span><span style={{ color: d.cartao.cor, fontWeight: 500 }}>{d.cartao.nome}</span></>}
                        {d.data_vencimento && !isPago && (
                          <><span>·</span><span style={{ color: vencido ? 'var(--accent)' : venceHoje ? '#b8862c' : 'var(--ink-muted)', fontWeight: vencido || venceHoje ? 600 : 400 }}>
                            {vencido ? 'Venceu ' : venceHoje ? 'Vence hoje · ' : 'Vence '}{vencido || venceHoje ? '' : ''}{new Date(d.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span></>
                        )}
                        {d.data_pagamento && <><span>·</span><span style={{ color: 'var(--green)' }}>Pago em {new Date(d.data_pagamento + 'T00:00:00').toLocaleDateString('pt-BR')}</span></>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                      <div className="font-serif" style={{ fontSize: '16px', fontWeight: 600 }}>{fmtDec(valorMes)}</div>
                      {d.parcelas > 1 && <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>{fmtDec(Number(d.valor_total))} total</div>}
                    </div>
                    <button onClick={() => handleToggleStatus(d.id, d.status)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      background: isPago ? 'var(--line-soft)' : '#e0ebd9',
                      color: isPago ? 'var(--ink-muted)' : 'var(--green)',
                      border: 'none', whiteSpace: 'nowrap',
                    }}>
                      {isPago ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          Pago
                        </>
                      ) : 'Marcar pago'}
                    </button>
                    <button onClick={() => handleDelete(d.id)} title="Excluir" style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '30px', height: '30px', borderRadius: '4px', background: 'transparent',
                      color: 'var(--ink-muted)', border: '1px solid var(--line)', cursor: 'pointer',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── CARTÕES ─────────────────────────────────────── */}
      {activeSection === 'cartoes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={() => { setShowCartaoForm(!showCartaoForm); setEditingCartao(null); setCartaoForm({ nome: '', bandeira: '', ultimos_digitos: '', cor: '#2d6a8f' }) }} style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '10px 20px', borderRadius: '6px', background: 'var(--ink)', color: 'var(--bg)',
              border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              {showCartaoForm ? 'Cancelar' : 'Novo cartão'}
            </button>
          </div>
          {showCartaoForm && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px', gap: '12px', marginBottom: '16px' }}>
                <div><label style={labelStyle}>Nome *</label><input type="text" value={cartaoForm.nome} onChange={(e) => setCartaoForm({ ...cartaoForm, nome: e.target.value })} style={inputStyle} placeholder="Ex: Nubank, Inter, C6..." /></div>
                <div><label style={labelStyle}>Bandeira</label>
                  <select value={cartaoForm.bandeira} onChange={(e) => setCartaoForm({ ...cartaoForm, bandeira: e.target.value })} style={inputStyle}>
                    <option value="">Selecione</option>
                    {['Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Últimos 4 dígitos</label><input type="text" maxLength={4} value={cartaoForm.ultimos_digitos} onChange={(e) => setCartaoForm({ ...cartaoForm, ultimos_digitos: e.target.value })} style={inputStyle} placeholder="1234" /></div>
                <div><label style={labelStyle}>Cor</label><input type="color" value={cartaoForm.cor} onChange={(e) => setCartaoForm({ ...cartaoForm, cor: e.target.value })} style={{ ...inputStyle, padding: '6px', height: '42px', cursor: 'pointer' }} /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleAddCartao} disabled={savingCartao || !cartaoForm.nome} style={{ padding: '10px 24px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', opacity: !cartaoForm.nome ? 0.4 : 1 }}>
                  {savingCartao ? 'Salvando...' : editingCartao ? 'Salvar alterações' : 'Adicionar cartão'}
                </button>
              </div>
            </div>
          )}
          {cartoes.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--line)', borderRadius: '6px', padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
              <p>Nenhum cartão cadastrado ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {cartoes.map((c) => (
                <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '18px 20px', flex: 1 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: c.cor, marginBottom: '12px' }} />
                    <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '3px' }}>{c.nome}</div>
                    <div style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
                      {c.bandeira && <span>{c.bandeira}</span>}
                      {c.bandeira && c.ultimos_digitos && <span> · </span>}
                      {c.ultimos_digitos && <span>···· {c.ultimos_digitos}</span>}
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--line-soft)', display: 'flex' }}>
                    <button onClick={() => abrirEdicaoCartao(c)} style={{
                      flex: 1, padding: '10px', background: 'transparent', border: 'none',
                      borderRight: '1px solid var(--line-soft)', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 500, color: 'var(--ink-soft)', fontFamily: 'inherit',
                    }}>
                      Editar
                    </button>
                    <button onClick={() => handleDesativarCartao(c.id)} style={{
                      flex: 1, padding: '10px', background: 'transparent', border: 'none',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                      color: 'var(--accent)', fontFamily: 'inherit',
                    }}>
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CONTAS CORRENTES ────────────────────────────── */}
      {activeSection === 'contas' && (
        <div>
          <div style={{ background: 'var(--line-soft)', border: '1px solid var(--line)', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            Cadastre aqui as contas bancárias da sua agência e pessoais. Elas aparecem como origem nas despesas para você saber de qual conta saiu cada pagamento.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={() => { setShowContaForm(!showContaForm); setEditingConta(null); setContaForm({ nome: '', banco: '', agencia: '', conta: '', digito: '', pix: '', tipo: 'empresa' }); setErrorConta('') }} style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '10px 20px', borderRadius: '6px', background: 'var(--ink)', color: 'var(--bg)',
              border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              {showContaForm ? 'Cancelar' : 'Nova conta corrente'}
            </button>
          </div>

          {showContaForm && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
              <h3 className="font-serif" style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Cadastrar conta corrente</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Nome da conta *</label>
                  <input type="text" value={contaForm.nome} onChange={(e) => setContaForm({ ...contaForm, nome: e.target.value })} style={inputStyle} placeholder="Ex: Nubank PJ, Bradesco Pessoal..." />
                </div>
                <div>
                  <label style={labelStyle}>Banco *</label>
                  <select value={contaForm.banco} onChange={(e) => setContaForm({ ...contaForm, banco: e.target.value })} style={inputStyle}>
                    <option value="">Selecione o banco...</option>
                    {BANCOS_BR.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tipo *</label>
                  <select value={contaForm.tipo} onChange={(e) => setContaForm({ ...contaForm, tipo: e.target.value as 'empresa' | 'fisica' })} style={inputStyle}>
                    <option value="empresa">Empresa (PJ)</option>
                    <option value="fisica">Pessoal (PF)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 2fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Agência</label>
                  <input type="text" value={contaForm.agencia} onChange={(e) => setContaForm({ ...contaForm, agencia: e.target.value })} style={inputStyle} placeholder="0001" />
                </div>
                <div>
                  <label style={labelStyle}>Conta</label>
                  <input type="text" value={contaForm.conta} onChange={(e) => setContaForm({ ...contaForm, conta: e.target.value })} style={inputStyle} placeholder="12345-6" />
                </div>
                <div>
                  <label style={labelStyle}>Dígito</label>
                  <input type="text" maxLength={2} value={contaForm.digito} onChange={(e) => setContaForm({ ...contaForm, digito: e.target.value })} style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Chave PIX</label>
                  <input type="text" value={contaForm.pix} onChange={(e) => setContaForm({ ...contaForm, pix: e.target.value })} style={inputStyle} placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória" />
                </div>
              </div>

              {errorConta && (
                <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '12px' }}>
                  {errorConta}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleAddConta} disabled={savingConta || !contaForm.nome || !contaForm.banco} style={{
                  padding: '10px 24px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                  border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  opacity: savingConta || !contaForm.nome || !contaForm.banco ? 0.4 : 1,
                }}>
                  {savingConta ? 'Salvando...' : editingConta ? 'Salvar alterações' : 'Cadastrar conta'}
                </button>
              </div>
            </div>
          )}

          {contasCorrentes.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--line)', borderRadius: '6px', padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>Nenhuma conta cadastrada ainda.</p>
              <button onClick={() => setShowContaForm(true)} style={{
                padding: '10px 20px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Cadastrar primeira conta
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
              {contasCorrentes.map((c) => (
                <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '18px 20px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                        background: c.tipo === 'empresa' ? 'var(--green)' : '#2d6a8f',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ink)' }}>{c.nome}</div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                          {c.banco} · <span style={{ color: c.tipo === 'empresa' ? 'var(--green)' : '#2d6a8f', fontWeight: 500 }}>
                            {c.tipo === 'empresa' ? 'PJ' : 'PF'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                      {c.agencia && (
                        <div>
                          <div style={{ color: 'var(--ink-muted)', marginBottom: '2px' }}>Agência</div>
                          <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{c.agencia}</div>
                        </div>
                      )}
                      {c.conta && (
                        <div>
                          <div style={{ color: 'var(--ink-muted)', marginBottom: '2px' }}>Conta{c.digito ? '/Dígito' : ''}</div>
                          <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{c.conta}{c.digito ? `-${c.digito}` : ''}</div>
                        </div>
                      )}
                      {c.pix && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ color: 'var(--ink-muted)', marginBottom: '2px' }}>Chave PIX</div>
                          <div style={{ fontWeight: 500, color: 'var(--ink)', wordBreak: 'break-all' }}>{c.pix}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--line-soft)', display: 'flex' }}>
                    <button onClick={() => abrirEdicaoConta(c)} style={{
                      flex: 1, padding: '10px', background: 'transparent', border: 'none',
                      borderRight: '1px solid var(--line-soft)', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 500, color: 'var(--ink-soft)', fontFamily: 'inherit',
                    }}>
                      Editar
                    </button>
                    <button onClick={() => handleDesativarConta(c.id)} style={{
                      flex: 1, padding: '10px', background: 'transparent', border: 'none',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                      color: 'var(--accent)', fontFamily: 'inherit',
                    }}>
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modal de baixa ── */}
      {modalBaixa && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>Confirmar pagamento</h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '20px' }}>Informe quando e de onde saiu o dinheiro.</p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Data do pagamento *
              </label>
              <input
                type="date"
                value={modalBaixa.data}
                onChange={(e) => setModalBaixa({ ...modalBaixa, data: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '14px', fontFamily: 'inherit', color: 'var(--ink)' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Saiu de qual conta?
              </label>
              <select
                value={modalBaixa.conta_corrente_id}
                onChange={(e) => setModalBaixa({ ...modalBaixa, conta_corrente_id: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '14px', fontFamily: 'inherit', color: 'var(--ink)' }}
              >
                <option value="">Não informar</option>
                {contasCorrentes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} — {c.banco} ({c.tipo === 'empresa' ? 'Empresa' : 'Pessoal'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalBaixa(null)} style={{ padding: '10px 20px', borderRadius: '4px', background: 'transparent', border: '1px solid var(--line)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)' }}>
                Cancelar
              </button>
              <button onClick={handleConfirmarBaixa} disabled={savingBaixa || !modalBaixa.data} style={{ padding: '10px 24px', borderRadius: '4px', background: 'var(--green)', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: savingBaixa || !modalBaixa.data ? 0.5 : 1 }}>
                {savingBaixa ? 'Confirmando...' : 'Confirmar pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', padding: '18px 20px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '6px', fontWeight: 600 }}>{label}</div>
      <div className="font-serif" style={{ fontSize: 'clamp(16px, 3vw, 26px)', fontWeight: 600, color: color || 'var(--ink)' }}>{value}</div>
    </div>
  )
}
