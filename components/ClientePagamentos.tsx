'use client'

import { useState, useEffect, FormEvent } from 'react'
import { createClient } from '@/lib/supabase-client'
import { gerarReciboPDF, carregarLogoBase64 } from '@/components/ReciboPDF'

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
}

type Cliente = {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  data_entrada: string
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const statusConfig: { [key: string]: { label: string; bg: string; color: string } } = {
  pago: { label: 'Pago', bg: '#e0ebd9', color: 'var(--green)' },
  pendente: { label: 'Pendente', bg: '#fff4e0', color: '#8a5a00' },
  atrasado: { label: 'Atrasado', bg: '#f5d6cd', color: 'var(--accent)' },
  cancelado: { label: 'Cancelado', bg: 'var(--line-soft)', color: 'var(--ink-muted)' },
}

function toISODate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function ClientePagamentos({ cliente }: { cliente: Cliente }) {
  const supabase = createClient()

  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null)
  const [saving, setSaving] = useState(false)
  const [gerandoRecibo, setGerandoRecibo] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    data_pagamento: toISODate(new Date()),
    metodo_pagamento: 'PIX',
    nota_fiscal: '',
    observacoes: '',
  })

  async function loadData() {
    const hojeISO = toISODate(new Date())

    const { data } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('cliente_id', cliente.id)
      .order('mes_referencia', { ascending: false })

    if (data) {
      // Atualizar status "atrasado" automaticamente
      const atualizados = data.map((p) => {
        if (p.status === 'pendente' && p.data_vencimento < hojeISO) {
          return { ...p, status: 'atrasado' }
        }
        return p
      })
      setPagamentos(atualizados)

      const paraAtualizar = data.filter((p) =>
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
  }, [cliente.id])

  // Estatísticas
  const totalRecebido = pagamentos
    .filter((p) => p.status === 'pago')
    .reduce((s, p) => s + Number(p.valor), 0)
  const totalPendente = pagamentos
    .filter((p) => p.status === 'pendente')
    .reduce((s, p) => s + Number(p.valor), 0)
  const totalAtrasado = pagamentos
    .filter((p) => p.status === 'atrasado')
    .reduce((s, p) => s + Number(p.valor), 0)
  const qtdAtrasadas = pagamentos.filter((p) => p.status === 'atrasado').length

  // Tempo como cliente
  const dataEntrada = new Date(cliente.data_entrada)
  const hoje = new Date()
  const meses = Math.max(
    0,
    (hoje.getFullYear() - dataEntrada.getFullYear()) * 12 + (hoje.getMonth() - dataEntrada.getMonth())
  )

  function abrirModal(p: Pagamento) {
    setPagamentoSelecionado(p)
    setForm({
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
        data_pagamento: form.data_pagamento,
        metodo_pagamento: form.metodo_pagamento,
        nota_fiscal: form.nota_fiscal || null,
        observacoes: form.observacoes || null,
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

  async function reverter(id: string) {
    if (!confirm('Desmarcar essa fatura como paga?')) return
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

  async function handleGerarRecibo(p: Pagamento) {
    setGerandoRecibo(p.id)
    setError('')
    try {
      const { data: config } = await supabase
        .from('configuracoes')
        .select('*')
        .limit(1)
        .single()

      if (!config) {
        setError('Configurações da agência não encontradas.')
        setGerandoRecibo(null)
        return
      }

      const logoBase64 = await carregarLogoBase64()

      // Adapta o pagamento pro formato do gerador
      const pagamentoComCliente = {
        ...p,
        cliente: {
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
        },
      }

      await gerarReciboPDF(pagamentoComCliente, config, logoBase64 || undefined)
    } catch (err) {
      setError('Erro ao gerar recibo: ' + (err as Error).message)
    } finally {
      setGerandoRecibo(null)
    }
  }

  const formatMoeda = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const formatDataBR = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString('pt-BR')

  function mesReferenciaLabel(s: string) {
    const d = new Date(s + 'T00:00:00')
    return `${MESES[d.getMonth()]} de ${d.getFullYear()}`
  }

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-muted)' }}>
        Carregando...
      </div>
    )
  }

  return (
    <div>
      {/* Stats financeiros */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px',
        background: 'var(--line)', border: '1px solid var(--line)',
        marginBottom: '28px', borderRadius: '4px', overflow: 'hidden',
      }}>
        <StatCard label="Total recebido" value={formatMoeda(totalRecebido)} color="var(--green)" />
        <StatCard label="Pendente" value={formatMoeda(totalPendente)} color={totalPendente > 0 ? '#8a5a00' : undefined} />
        <StatCard label="Atrasado" value={formatMoeda(totalAtrasado)} sub={qtdAtrasadas > 0 ? `${qtdAtrasadas} fatura${qtdAtrasadas > 1 ? 's' : ''}` : ''} color={totalAtrasado > 0 ? 'var(--accent)' : undefined} />
        <StatCard label="Tempo como cliente" value={`${meses} ${meses === 1 ? 'mês' : 'meses'}`} />
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
      {pagamentos.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px dashed var(--line)', borderRadius: '6px',
          padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)',
        }}>
          <div className="font-serif" style={{ fontSize: '48px', fontStyle: 'italic', color: 'var(--line)', marginBottom: '8px' }}>*</div>
          <h3 className="font-serif" style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '8px', fontWeight: 600 }}>
            Nenhuma fatura ainda
          </h3>
          <p style={{ fontSize: '14px' }}>
            As faturas aparecerão aqui quando forem geradas no módulo de Pagamentos.
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
                    {mesReferenciaLabel(p.mes_referencia)}
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
                      <button onClick={() => reverter(p.id)} style={{
                        padding: '6px 14px', borderRadius: '4px', background: 'transparent', color: 'var(--ink-soft)',
                        border: '1px solid var(--line)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        Reverter
                      </button>
                    </>
                  ) : (
                    <button onClick={() => abrirModal(p)} style={{
                      padding: '6px 14px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                      border: 'none', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      Marcar como pago
                    </button>
                  )}
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
              {mesReferenciaLabel(pagamentoSelecionado.mes_referencia)} · {formatMoeda(Number(pagamentoSelecionado.valor))}
            </p>

            <form onSubmit={marcarComoPago}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Data do pagamento *</label>
                  <input type="date" required value={form.data_pagamento}
                    onChange={(e) => setForm({ ...form, data_pagamento: e.target.value })}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Método *</label>
                  <select value={form.metodo_pagamento}
                    onChange={(e) => setForm({ ...form, metodo_pagamento: e.target.value })}
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
                <input type="text" value={form.nota_fiscal}
                  onChange={(e) => setForm({ ...form, nota_fiscal: e.target.value })}
                  style={inputStyle} placeholder="Opcional" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Observações</label>
                <textarea value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                  placeholder="Opcional" />
              </div>

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

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', padding: '18px 20px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '8px', fontWeight: 600 }}>
        {label}
      </div>
      <div className="font-serif" style={{ fontSize: '22px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em', color: color || 'var(--ink)' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '6px' }}>{sub}</div>}
    </div>
  )
}