'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import SistemaNav from '@/components/SistemaNav'
import { createClient } from '@/lib/supabase-client'

const CAT_LABELS: { [key: string]: string } = {
  software_ia: 'Software / IA', marketing: 'Marketing', impostos: 'Impostos',
  infra: 'Infra', alimentacao: 'Alimentação', transporte: 'Transporte',
  saude: 'Saúde', pets: 'Pets', pessoal: 'Pessoal', emprestimo: 'Empréstimo', outros: 'Outros',
}

type RelatorioTipo = 'historico_cliente' | 'a_pagar' | 'pagas' | 'a_receber' | 'recebidas'

const RELATORIOS: { id: RelatorioTipo; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'historico_cliente',
    label: 'Histórico do cliente',
    desc: 'Todas as faturas de um cliente por período',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'a_receber',
    label: 'Contas a receber',
    desc: 'Faturas pendentes no período',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    id: 'recebidas',
    label: 'Contas recebidas',
    desc: 'Faturas pagas no período',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    id: 'a_pagar',
    label: 'Contas a pagar',
    desc: 'Despesas pendentes no período',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
      </svg>
    ),
  },
  {
    id: 'pagas',
    label: 'Contas pagas',
    desc: 'Despesas pagas no período',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
]

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtData(iso: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const hoje = new Date()
const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

function Atalhos({ setInicio, setFim }: { setInicio: (s: string) => void; setFim: (s: string) => void }) {
  const h = new Date()
  const atalhos = [
    { label: 'Este mês', fn: () => { setInicio(toISODate(new Date(h.getFullYear(), h.getMonth(), 1))); setFim(toISODate(new Date(h.getFullYear(), h.getMonth() + 1, 0))) } },
    { label: 'Mês passado', fn: () => { const m = new Date(h.getFullYear(), h.getMonth() - 1, 1); setInicio(toISODate(m)); setFim(toISODate(new Date(h.getFullYear(), h.getMonth(), 0))) } },
    { label: 'Este ano', fn: () => { setInicio(`${h.getFullYear()}-01-01`); setFim(toISODate(new Date(h.getFullYear(), 11, 31))) } },
  ]
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {atalhos.map(({ label, fn }) => (
        <button key={label} type="button" onClick={fn} style={{
          padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--line)',
          background: 'transparent', fontSize: '12px', color: 'var(--ink-muted)',
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
        }}>{label}</button>
      ))}
    </div>
  )
}

function FiltroData({ inicio, fim, setInicio, setFim, onBuscar, loading }: {
  inicio: string; fim: string
  setInicio: (s: string) => void; setFim: (s: string) => void
  onBuscar: () => void; loading: boolean
}) {
  const inputStyle: React.CSSProperties = {
    padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '4px',
    fontSize: '14px', color: 'var(--ink)', background: 'var(--bg)', fontFamily: 'inherit',
  }
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '20px' }}>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '5px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>De</div>
        <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} style={inputStyle} />
      </div>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '5px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Até</div>
        <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} style={inputStyle} />
      </div>
      <Atalhos setInicio={setInicio} setFim={setFim} />
      <button onClick={onBuscar} disabled={loading} style={{
        padding: '9px 20px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
        border: 'none', fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', opacity: loading ? 0.5 : 1, marginLeft: 'auto',
      }}>
        {loading ? 'Buscando...' : 'Gerar'}
      </button>
    </div>
  )
}

// ─── HISTÓRICO DO CLIENTE ────────────────────────────────────────────────────
function RelHistoricoCliente() {
  const supabase = createClient()
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([])
  const [clienteId, setClienteId] = useState('')
  const [inicio, setInicio] = useState(toISODate(primeiroDiaMes))
  const [fim, setFim] = useState(toISODate(ultimoDiaMes))
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [buscou, setBuscou] = useState(false)

  useEffect(() => {
    supabase.from('clientes').select('id, nome').order('nome').then(({ data }) => {
      if (data) setClientes(data)
    })
  }, [])

  async function buscar() {
    if (!clienteId) return
    setLoading(true)
    const { data } = await supabase
      .from('pagamentos')
      .select('id, data_vencimento, data_pagamento, valor, valor_pago, status, metodo_pagamento, observacoes, contrato:contratos(descricao)')
      .eq('cliente_id', clienteId)
      .gte('data_vencimento', inicio)
      .lte('data_vencimento', fim)
      .order('data_vencimento', { ascending: true })
    setRows(data || [])
    setBuscou(true)
    setLoading(false)
  }

  const total = rows.reduce((s, r) => s + (r.valor_pago ?? r.valor), 0)
  const pagas = rows.filter(r => r.status === 'pago').length
  const pendentes = rows.filter(r => r.status !== 'pago').length

  const STATUS: { [k: string]: { label: string; bg: string; color: string } } = {
    pago: { label: 'Pago', bg: '#e0ebd9', color: '#2d6a4f' },
    pendente: { label: 'Pendente', bg: '#fff8e1', color: '#8a5a00' },
    atrasado: { label: 'Atrasado', bg: '#fce8e6', color: '#c44536' },
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '5px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Cliente</div>
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} style={{
            width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '4px',
            fontSize: '14px', color: 'var(--ink)', background: 'var(--bg)', fontFamily: 'inherit',
          }}>
            <option value="">Selecione um cliente...</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
      </div>
      <FiltroData inicio={inicio} fim={fim} setInicio={setInicio} setFim={setFim} onBuscar={buscar} loading={loading} />

      {buscou && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <SummaryCard label="Faturas" value={String(rows.length)} sub={`${pagas} pagas · ${pendentes} pendentes`} />
            <SummaryCard label="Total faturado" value={fmt(rows.reduce((s, r) => s + r.valor, 0))} color="var(--ink)" />
            <SummaryCard label="Total recebido" value={fmt(total)} color="#2d6a4f" />
          </div>

          {rows.length === 0 ? (
            <Empty texto="Nenhuma fatura encontrada para este cliente no período." />
          ) : (
            <Table
              headers={['Vencimento', 'Descrição', 'Valor', 'Pagamento', 'Método', 'Status']}
              rows={rows.map(r => {
                const st = STATUS[r.status] || STATUS['pendente']
                return [
                  fmtData(r.data_vencimento),
                  r.contrato?.descricao || r.observacoes || 'Honorários',
                  fmt(r.valor),
                  fmtData(r.data_pagamento),
                  r.metodo_pagamento || '—',
                  <StatusBadge key="s" label={st.label} bg={st.bg} color={st.color} />,
                ]
              })}
            />
          )}
        </>
      )}
    </div>
  )
}

// ─── CONTAS A RECEBER ────────────────────────────────────────────────────────
function RelAReceber() {
  const supabase = createClient()
  const [inicio, setInicio] = useState(toISODate(primeiroDiaMes))
  const [fim, setFim] = useState(toISODate(ultimoDiaMes))
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [buscou, setBuscou] = useState(false)

  async function buscar() {
    setLoading(true)
    const { data } = await supabase
      .from('pagamentos')
      .select('id, data_vencimento, valor, status, cliente:clientes(nome), contrato:contratos(descricao)')
      .in('status', ['pendente', 'atrasado'])
      .gte('data_vencimento', inicio)
      .lte('data_vencimento', fim)
      .order('data_vencimento', { ascending: true })
    setRows(data || [])
    setBuscou(true)
    setLoading(false)
  }

  const total = rows.reduce((s, r) => s + r.valor, 0)
  const atrasados = rows.filter(r => r.status === 'atrasado')
  const totalAtrasado = atrasados.reduce((s, r) => s + r.valor, 0)

  return (
    <div>
      <FiltroData inicio={inicio} fim={fim} setInicio={setInicio} setFim={setFim} onBuscar={buscar} loading={loading} />
      {buscou && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <SummaryCard label="A receber" value={fmt(total)} color="#2a9d8f" sub={`${rows.length} fatura${rows.length !== 1 ? 's' : ''}`} />
            <SummaryCard label="Em atraso" value={fmt(totalAtrasado)} color="#c44536" sub={`${atrasados.length} fatura${atrasados.length !== 1 ? 's' : ''}`} />
            <SummaryCard label="No prazo" value={fmt(total - totalAtrasado)} color="#8a5a00" sub={`${rows.length - atrasados.length} faturas`} />
          </div>
          {rows.length === 0 ? <Empty texto="Nenhuma conta a receber no período." /> : (
            <Table
              headers={['Vencimento', 'Cliente', 'Descrição', 'Valor', 'Status']}
              rows={rows.map(r => [
                fmtData(r.data_vencimento),
                r.cliente?.nome || '—',
                r.contrato?.descricao || '—',
                fmt(r.valor),
                <StatusBadge key="s"
                  label={r.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                  bg={r.status === 'atrasado' ? '#fce8e6' : '#fff8e1'}
                  color={r.status === 'atrasado' ? '#c44536' : '#8a5a00'}
                />,
              ])}
            />
          )}
        </>
      )}
    </div>
  )
}

// ─── CONTAS RECEBIDAS ────────────────────────────────────────────────────────
function RelRecebidas() {
  const supabase = createClient()
  const [inicio, setInicio] = useState(toISODate(primeiroDiaMes))
  const [fim, setFim] = useState(toISODate(ultimoDiaMes))
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [buscou, setBuscou] = useState(false)

  async function buscar() {
    setLoading(true)
    const { data } = await supabase
      .from('pagamentos')
      .select('id, data_vencimento, data_pagamento, valor, valor_pago, juros, metodo_pagamento, cliente:clientes(nome), contrato:contratos(descricao)')
      .eq('status', 'pago')
      .gte('data_pagamento', inicio)
      .lte('data_pagamento', fim)
      .order('data_pagamento', { ascending: true })
    setRows(data || [])
    setBuscou(true)
    setLoading(false)
  }

  const totalRecebido = rows.reduce((s, r) => s + (r.valor_pago ?? r.valor), 0)
  const totalJuros = rows.reduce((s, r) => s + (r.juros ?? 0), 0)

  return (
    <div>
      <FiltroData inicio={inicio} fim={fim} setInicio={setInicio} setFim={setFim} onBuscar={buscar} loading={loading} />
      {buscou && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <SummaryCard label="Total recebido" value={fmt(totalRecebido)} color="#2d6a4f" sub={`${rows.length} fatura${rows.length !== 1 ? 's' : ''}`} />
            <SummaryCard label="Juros recebidos" value={fmt(totalJuros)} color="#8a5a00" />
            <SummaryCard label="Ticket médio" value={rows.length ? fmt(totalRecebido / rows.length) : 'R$ 0' } />
          </div>
          {rows.length === 0 ? <Empty texto="Nenhum recebimento no período." /> : (
            <Table
              headers={['Data pag.', 'Cliente', 'Descrição', 'Vencimento', 'Valor', 'Recebido', 'Método']}
              rows={rows.map(r => [
                fmtData(r.data_pagamento),
                r.cliente?.nome || '—',
                r.contrato?.descricao || r.observacoes || 'Honorários',
                fmtData(r.data_vencimento),
                fmt(r.valor),
                <span key="vp" style={{ color: '#2d6a4f', fontWeight: 600 }}>
                  {fmt(r.valor_pago ?? r.valor)}
                  {r.juros > 0 && <span style={{ color: '#8a5a00', fontSize: '11px', display: 'block' }}>+{fmt(r.juros)} juros</span>}
                </span>,
                r.metodo_pagamento || '—',
              ])}
            />
          )}
        </>
      )}
    </div>
  )
}

// ─── CONTAS A PAGAR ──────────────────────────────────────────────────────────
function RelAPagar() {
  const supabase = createClient()
  const [inicio, setInicio] = useState(toISODate(primeiroDiaMes))
  const [fim, setFim] = useState(toISODate(ultimoDiaMes))
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [buscou, setBuscou] = useState(false)

  async function buscar() {
    setLoading(true)
    const { data } = await supabase
      .from('despesas')
      .select('id, data_vencimento, descricao, categoria, forma_pagamento, valor, status')
      .in('status', ['pendente', 'atrasado'])
      .gte('data_vencimento', inicio)
      .lte('data_vencimento', fim)
      .order('data_vencimento', { ascending: true })
    setRows(data || [])
    setBuscou(true)
    setLoading(false)
  }

  const total = rows.reduce((s, r) => s + r.valor, 0)
  const atrasadas = rows.filter(r => r.status === 'atrasado')

  return (
    <div>
      <FiltroData inicio={inicio} fim={fim} setInicio={setInicio} setFim={setFim} onBuscar={buscar} loading={loading} />
      {buscou && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <SummaryCard label="Total a pagar" value={fmt(total)} color="#c44536" sub={`${rows.length} despesa${rows.length !== 1 ? 's' : ''}`} />
            <SummaryCard label="Em atraso" value={fmt(atrasadas.reduce((s, r) => s + r.valor, 0))} color="#c44536" sub={`${atrasadas.length} itens`} />
            <SummaryCard label="No prazo" value={fmt(total - atrasadas.reduce((s, r) => s + r.valor, 0))} color="#8a5a00" />
          </div>
          {rows.length === 0 ? <Empty texto="Nenhuma conta a pagar no período." /> : (
            <Table
              headers={['Vencimento', 'Descrição', 'Categoria', 'Valor', 'Status']}
              rows={rows.map(r => [
                fmtData(r.data_vencimento),
                r.descricao,
                CAT_LABELS[r.categoria] || r.categoria,
                fmt(r.valor),
                <StatusBadge key="s"
                  label={r.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                  bg={r.status === 'atrasado' ? '#fce8e6' : '#fff8e1'}
                  color={r.status === 'atrasado' ? '#c44536' : '#8a5a00'}
                />,
              ])}
            />
          )}
        </>
      )}
    </div>
  )
}

// ─── CONTAS PAGAS ────────────────────────────────────────────────────────────
function RelPagas() {
  const supabase = createClient()
  const [inicio, setInicio] = useState(toISODate(primeiroDiaMes))
  const [fim, setFim] = useState(toISODate(ultimoDiaMes))
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [buscou, setBuscou] = useState(false)

  async function buscar() {
    setLoading(true)
    const { data } = await supabase
      .from('despesas')
      .select('id, data_vencimento, data_pagamento, descricao, categoria, forma_pagamento, valor, conta_corrente:contas_correntes(nome)')
      .eq('status', 'pago')
      .gte('data_vencimento', inicio)
      .lte('data_vencimento', fim)
      .order('data_vencimento', { ascending: true })
    setRows(data || [])
    setBuscou(true)
    setLoading(false)
  }

  const total = rows.reduce((s, r) => s + r.valor, 0)

  // Por categoria
  const porCat: { [k: string]: number } = {}
  rows.forEach(r => { porCat[r.categoria] = (porCat[r.categoria] || 0) + r.valor })
  const catOrdenadas = Object.entries(porCat).sort((a, b) => b[1] - a[1])

  return (
    <div>
      <FiltroData inicio={inicio} fim={fim} setInicio={setInicio} setFim={setFim} onBuscar={buscar} loading={loading} />
      {buscou && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <SummaryCard label="Total pago" value={fmt(total)} color="#c44536" sub={`${rows.length} despesa${rows.length !== 1 ? 's' : ''}`} />
            <SummaryCard label="Categorias" value={String(catOrdenadas.length)} />
            <SummaryCard label="Maior categoria" value={catOrdenadas[0] ? CAT_LABELS[catOrdenadas[0][0]] || catOrdenadas[0][0] : '—'} sub={catOrdenadas[0] ? fmt(catOrdenadas[0][1]) : ''} />
          </div>

          {catOrdenadas.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '12px' }}>Por categoria</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {catOrdenadas.map(([cat, val]) => (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>{CAT_LABELS[cat] || cat}</span>
                      <span style={{ fontSize: '13px', color: '#c44536', fontWeight: 600 }}>{fmt(val)}</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--line)', borderRadius: '2px' }}>
                      <div style={{ height: '4px', background: '#c44536', borderRadius: '2px', width: `${(val / total) * 100}%`, opacity: 0.55 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rows.length === 0 ? <Empty texto="Nenhuma despesa paga no período." /> : (
            <Table
              headers={['Vencimento', 'Pago em', 'Descrição', 'Categoria', 'Conta', 'Valor']}
              rows={rows.map(r => [
                fmtData(r.data_vencimento),
                fmtData(r.data_pagamento),
                r.descricao,
                CAT_LABELS[r.categoria] || r.categoria,
                r.conta_corrente?.nome || '—',
                <span key="v" style={{ color: '#c44536', fontWeight: 600 }}>{fmt(r.valor)}</span>,
              ])}
            />
          )}
        </>
      )}
    </div>
  )
}

// ─── COMPONENTES REUTILIZÁVEIS ───────────────────────────────────────────────
function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', padding: '16px 20px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: color || 'var(--ink)', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '3px' }}>{sub}</div>}
    </div>
  )
}

function StatusBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 8px', borderRadius: '3px',
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      background: bg, color,
    }}>{label}</span>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{
                  padding: '10px 16px', textAlign: 'left',
                  fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--ink-muted)', fontWeight: 600,
                  borderBottom: '1px solid var(--line)', background: 'var(--bg)',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--ink)', verticalAlign: 'middle' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Empty({ texto }: { texto: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px',
      padding: '48px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '14px',
    }}>{texto}</div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function RelatorioPage() {
  const supabase = createClient()
  const [ativo, setAtivo] = useState<RelatorioTipo>('historico_cliente')
  const [userEmail, setUserEmail] = useState<string | undefined>()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? undefined))
  }, [])

  const relAtivo = RELATORIOS.find(r => r.id === ativo)!

  const CONTEUDO: Record<RelatorioTipo, React.ReactNode> = {
    historico_cliente: <RelHistoricoCliente />,
    a_receber: <RelAReceber />,
    recebidas: <RelRecebidas />,
    a_pagar: <RelAPagar />,
    pagas: <RelPagas />,
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <Header userEmail={userEmail} />
      <SistemaNav />

      <div style={{ marginBottom: '24px' }}>
        <h1 className="font-serif" style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '2px' }}>
          Relatórios
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>Consulte e exporte dados financeiros por período.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Sidebar */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden', position: 'sticky', top: '20px' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 700 }}>
            Tipo de relatório
          </div>
          <nav style={{ padding: '8px' }}>
            {RELATORIOS.map((rel) => {
              const isAtivo = ativo === rel.id
              return (
                <button
                  key={rel.id}
                  onClick={() => setAtivo(rel.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '6px',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '2px',
                    background: isAtivo ? 'var(--ink)' : 'transparent',
                    color: isAtivo ? 'var(--bg)' : 'var(--ink)',
                    transition: 'background 0.1s',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}
                >
                  <span style={{ opacity: isAtivo ? 1 : 0.5, flexShrink: 0 }}>{rel.icon}</span>
                  <span>
                    <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>{rel.label}</div>
                    <div style={{ fontSize: '11px', opacity: 0.65, lineHeight: 1.3, marginTop: '2px' }}>{rel.desc}</div>
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Conteúdo */}
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px', marginBottom: '0' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                <span style={{ color: 'var(--ink-muted)' }}>{relAtivo.icon}</span>
                <h2 className="font-serif" style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em' }}>
                  {relAtivo.label}
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginLeft: '28px' }}>{relAtivo.desc}</p>
            </div>
            {CONTEUDO[ativo]}
          </div>
        </div>
      </div>
    </div>
  )
}
