'use client'

import { useState, useEffect, useMemo, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase-client'
import { gerarReciboPDF, carregarLogoBase64 } from '@/components/ReciboPDF'

type Cliente = {
  id: string
  nome: string
  valor_mensal: number
  dia_vencimento: number | null
  status: string
}

type Pagamento = {
  id: string
  cliente_id: string
  mes_referencia: string
  valor: number
  data_vencimento: string
  data_pagamento: string | null
  status: string
  metodo_pagamento: string | null
  nota_fiscal: string | null
  observacoes: string | null
  cliente: { nome: string; email: string | null; telefone: string | null } | null
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

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [generating, setGenerating] = useState(false)
  const [gerandoRecibo, setGerandoRecibo] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(() => getFirstDayOfMonth(hoje.getFullYear(), hoje.getMonth()))

  const [pagamentoForm, setPagamentoForm] = useState({
    data_pagamento: toISODate(new Date()),
    metodo_pagamento: 'PIX',
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

    const [{ data: clientesData }, { data: pagamentosData }] = await Promise.all([
      supabase.from('clientes_completo')
        .select('id, nome, valor_mensal, dia_vencimento, status')
        .eq('status', 'ativo')
        .order('nome'),
      supabase.from('pagamentos')
        .select('*, cliente:clientes (nome, email, telefone)')
        .eq('mes_referencia', mesIni)
        .order('data_vencimento'),
    ])

    if (clientesData) setClientes(clientesData)
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
      .select('cliente_id')
      .eq('mes_referencia', mesIni)

    const clientesJaCobrados = new Set((existentes || []).map((e) => e.cliente_id))

    const clientesSemDia = clientes.filter((c) => !c.dia_vencimento)
    if (clientesSemDia.length > 0) {
      setError(`Esses clientes estão sem dia de vencimento configurado: ${clientesSemDia.map((c) => c.nome).join(', ')}. Edite cada um pra adicionar o dia.`)
      setGenerating(false)
      return
    }

    const novasFaturas = clientes
      .filter((c) => !clientesJaCobrados.has(c.id) && c.dia_vencimento)
      .map((c) => {
        const dia = Math.min(c.dia_vencimento!, ultimoDia)
        const vencimento = new Date(ano, mes, dia)
        return {
          cliente_id: c.id,
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

  function abrirModalPagamento(p: Pagamento) {
    setPagamentoSelecionado(p)
    setPagamentoForm({
      data_pagamento: p.data_pagamento || toISODate(new Date()),
      metodo_pagamento: p.metodo_pagamento || 'PIX',
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

    const { error: updateError } = await supabase
      .from('pagamentos')
      .update({
        status: 'pago',
        data_pagamento: pagamentoForm.data_pagamento,
        metodo_pagamento: pagamentoForm.metodo_pagamento,
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Link href="/sistema" style={{ fontSize: '12px', color: 'var(--ink-muted)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
            ← Dashboard
          </Link>
          <h2 className="font-serif" style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '8px', lineHeight: 1 }}>
            Pagamentos
          </h2>
        </div>

        <button onClick={gerarFaturasDoMes} disabled={generating} style={{
          background: 'var(--ink)', color: 'var(--bg)', padding: '12px 20px', borderRadius: '4px',
          fontSize: '14px', fontWeight: 500, border: 'none', cursor: generating ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', opacity: generating ? 0.6 : 1,
        }}>
          {generating ? 'Gerando...' : '+ Gerar faturas do mês'}
        </button>
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
          background: 'var(--bg-card)', border: '1px dashed var(--line)', borderRadius: '6px',
          padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)',
        }}>
          <div className="font-serif" style={{ fontSize: '48px', fontStyle: 'italic', color: 'var(--line)', marginBottom: '8px' }}>*</div>
          <h3 className="font-serif" style={{ fontSize: '22px', color: 'var(--ink)', marginBottom: '8px', fontWeight: 600 }}>
            Nenhuma fatura nesse mês
          </h3>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            Clique em "+ Gerar faturas do mês" para criar uma fatura pra cada cliente ativo, usando o dia de vencimento de cada um.
          </p>
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
                  <div className="font-serif" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                    {p.cliente?.nome || '—'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                    Vence em {formatDataBR(p.data_vencimento)}
                    {p.data_pagamento && <> · Pago em {formatDataBR(p.data_pagamento)}</>}
                  </div>
                </div>

                <div style={{ minWidth: '110px', textAlign: 'right' }}>
                  <div className="font-serif" style={{ fontSize: '18px', fontWeight: 600 }}>
                    {formatMoeda(Number(p.valor))}
                  </div>
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

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {p.status === 'pago' ? (
                    <>
                      <button onClick={() => handleGerarRecibo(p)} disabled={gerandoRecibo === p.id} style={{
                        padding: '6px 14px', borderRadius: '4px', background: 'var(--green)', color: 'var(--bg)',
                        border: 'none', fontSize: '12px', fontWeight: 500,
                        cursor: gerandoRecibo === p.id ? 'not-allowed' : 'pointer',
                        opacity: gerandoRecibo === p.id ? 0.6 : 1, fontFamily: 'inherit',
                      }}>
                        {gerandoRecibo === p.id ? 'Gerando...' : '📄 Recibo'}
                      </button>
                      <button onClick={() => reverterParaPendente(p.id)} style={{
                        padding: '6px 14px', borderRadius: '4px', background: 'transparent', color: 'var(--ink-soft)',
                        border: '1px solid var(--line)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        Reverter
                      </button>
                    </>
                  ) : (
                    <button onClick={() => abrirModalPagamento(p)} style={{
                      padding: '6px 14px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                      border: 'none', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      Marcar como pago
                    </button>
                  )}
                  <button onClick={() => handleDelete(p.id)} title="Excluir" style={{
                    padding: '6px 10px', borderRadius: '4px', background: 'transparent', color: 'var(--ink-muted)',
                    border: '1px solid var(--line)', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                  }}>×</button>
                </div>
              </div>
            )
          })}
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
              {pagamentoSelecionado.cliente?.nome} · {formatMoeda(Number(pagamentoSelecionado.valor))}
            </p>

            <form onSubmit={marcarComoPago}>
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