'use client'

import { useState, useEffect, useMemo, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase-client'

type Cliente = {
  id: string
  nome: string
  segmento: string
  status: string
  plataformas: string[] | null
  meta_cpl_padrao: number | null
}

type Campanha = {
  id: string
  cliente_id: string
  plataforma: string
  mes_referencia: string
  investimento: number
  leads: number
  leads_qualificados: number
  agendamentos: number
  comparecimentos: number
  fechamentos: number
  ticket_medio: number | null
  faturamento_atribuido: number | null
  cpl: number | null
  meta_cpl: number | null
  observacoes: string | null
  cliente: { nome: string; segmento: string } | null
}

const MESES_NOMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

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

const formInicial = {
  cliente_id: '',
  plataforma: 'Meta',
  investimento: '',
  leads: '',
  leads_qualificados: '',
  agendamentos: '',
  comparecimentos: '',
  fechamentos: '',
  ticket_medio: '',
  faturamento_atribuido: '',
  meta_cpl: '',
  observacoes: '',
}

export default function CampanhasPage() {
  const router = useRouter()
  const supabase = createClient()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(() => getFirstDayOfMonth(hoje.getFullYear(), hoje.getMonth()))

  const [form, setForm] = useState(formInicial)

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/sistema/login')
      return
    }
    setUserEmail(user.email || '')

    const mesIni = toISODate(mesAtual)

    const [{ data: clientesData }, { data: campanhasData }] = await Promise.all([
      supabase.from('clientes')
        .select('id, nome, segmento, status, plataformas, meta_cpl_padrao')
        .neq('status', 'encerrado')
        .order('nome'),
      supabase.from('campanhas')
        .select('*, cliente:clientes (nome, segmento)')
        .eq('mes_referencia', mesIni)
        .order('created_at', { ascending: false }),
    ])

    if (clientesData) setClientes(clientesData)
    if (campanhasData) setCampanhas(campanhasData as unknown as Campanha[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [mesAtual])

  const stats = useMemo(() => {
    const totalInvestimento = campanhas.reduce((s, c) => s + Number(c.investimento || 0), 0)
    const totalLeads = campanhas.reduce((s, c) => s + (c.leads || 0), 0)
    const totalFaturamento = campanhas.reduce((s, c) => s + Number(c.faturamento_atribuido || 0), 0)
    const cplMedio = totalLeads > 0 ? totalInvestimento / totalLeads : 0
    const roasMedio = totalInvestimento > 0 ? totalFaturamento / totalInvestimento : 0
    const emAlerta = campanhas.filter((c) => c.cpl && c.meta_cpl && Number(c.cpl) > Number(c.meta_cpl)).length
    return { totalInvestimento, totalLeads, totalFaturamento, cplMedio, roasMedio, emAlerta }
  }, [campanhas])

  function handleClienteChange(clienteId: string) {
    const cli = clientes.find((c) => c.id === clienteId)
    setForm((f) => ({
      ...f,
      cliente_id: clienteId,
      meta_cpl: cli?.meta_cpl_padrao ? String(cli.meta_cpl_padrao) : f.meta_cpl,
      plataforma: cli?.plataformas?.[0] || 'Meta',
    }))
  }

  function abrirNovo() {
    setEditandoId(null)
    setForm(formInicial)
    setError('')
    setModalOpen(true)
  }

  function abrirEdicao(c: Campanha) {
    setEditandoId(c.id)
    setForm({
      cliente_id: c.cliente_id,
      plataforma: c.plataforma,
      investimento: String(c.investimento || ''),
      leads: String(c.leads || ''),
      leads_qualificados: String(c.leads_qualificados || ''),
      agendamentos: String(c.agendamentos || ''),
      comparecimentos: String(c.comparecimentos || ''),
      fechamentos: String(c.fechamentos || ''),
      ticket_medio: c.ticket_medio ? String(c.ticket_medio) : '',
      faturamento_atribuido: c.faturamento_atribuido ? String(c.faturamento_atribuido) : '',
      meta_cpl: c.meta_cpl ? String(c.meta_cpl) : '',
      observacoes: c.observacoes || '',
    })
    setError('')
    setModalOpen(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const investimento = Number(form.investimento || 0)
    const leads = Number(form.leads || 0)
    const cplCalculado = leads > 0 ? investimento / leads : null

    const dados = {
      cliente_id: form.cliente_id,
      plataforma: form.plataforma,
      mes_referencia: toISODate(mesAtual),
      investimento,
      leads,
      leads_qualificados: Number(form.leads_qualificados || 0),
      agendamentos: Number(form.agendamentos || 0),
      comparecimentos: Number(form.comparecimentos || 0),
      fechamentos: Number(form.fechamentos || 0),
      ticket_medio: form.ticket_medio ? Number(form.ticket_medio) : null,
      faturamento_atribuido: form.faturamento_atribuido ? Number(form.faturamento_atribuido) : null,
      cpl: cplCalculado,
      meta_cpl: form.meta_cpl ? Number(form.meta_cpl) : null,
      observacoes: form.observacoes || null,
    }

    const resp = editandoId
      ? await supabase.from('campanhas').update(dados).eq('id', editandoId)
      : await supabase.from('campanhas').insert(dados)

    if (resp.error) {
      setError('Erro: ' + resp.error.message)
      setSaving(false)
      return
    }

    setForm(formInicial)
    setEditandoId(null)
    setModalOpen(false)
    setSaving(false)
    await loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esse lançamento?')) return
    await supabase.from('campanhas').delete().eq('id', id)
    await loadData()
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

  const formatRoas = (v: number) => `${v.toFixed(1).replace('.', ',')}x`

  function getRoasColor(roas: number): { color: string; bg: string } {
    if (roas >= 3) return { color: 'var(--green)', bg: '#e0ebd9' }
    if (roas >= 1.5) return { color: '#8a5a00', bg: '#fff4e0' }
    return { color: 'var(--accent)', bg: 'var(--accent-soft)' }
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

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <Header userEmail={userEmail} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Link href="/sistema" style={{ fontSize: '12px', color: 'var(--ink-muted)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
            ← Dashboard
          </Link>
          <h2 className="font-serif" style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '8px', lineHeight: 1 }}>
            Campanhas
          </h2>
        </div>

        <button onClick={abrirNovo} style={{
          background: 'var(--ink)', color: 'var(--bg)', padding: '12px 20px', borderRadius: '4px',
          fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          + Lançar KPIs do mês
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

      {/* Stats — 5 cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px',
        background: 'var(--line)', border: '1px solid var(--line)',
        marginBottom: '28px', borderRadius: '4px', overflow: 'hidden',
      }}>
        <StatCard label="Investimento" value={formatMoeda(stats.totalInvestimento)} />
        <StatCard label="Leads" value={String(stats.totalLeads)} />
        <StatCard label="CPL médio" value={stats.totalLeads > 0 ? formatMoeda(stats.cplMedio) : '—'} />
        <StatCard label="ROAS médio" value={stats.totalFaturamento > 0 ? formatRoas(stats.roasMedio) : '—'} color={stats.roasMedio >= 3 ? 'var(--green)' : stats.roasMedio >= 1.5 ? '#8a5a00' : stats.totalFaturamento > 0 ? 'var(--accent)' : undefined} />
        <StatCard label="Em alerta" value={String(stats.emAlerta)} sub="CPL acima da meta" color={stats.emAlerta > 0 ? 'var(--accent)' : undefined} />
        <StatCard label="Faturado" value={stats.totalFaturamento > 0 ? formatMoeda(stats.totalFaturamento) : '—'} color="var(--green)" />
      </div>

      {/* Lista de campanhas */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-muted)' }}>Carregando...</div>
      ) : campanhas.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px dashed var(--line)', borderRadius: '6px',
          padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)',
        }}>
          <div className="font-serif" style={{ fontSize: '48px', fontStyle: 'italic', color: 'var(--line)', marginBottom: '8px' }}>*</div>
          <h3 className="font-serif" style={{ fontSize: '22px', color: 'var(--ink)', marginBottom: '8px', fontWeight: 600 }}>
            Nenhum lançamento nesse mês
          </h3>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            Clique em "Lançar KPIs do mês" para registrar os números das campanhas.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {campanhas.map((c) => {
            const cplNum = c.cpl ? Number(c.cpl) : null
            const metaNum = c.meta_cpl ? Number(c.meta_cpl) : null
            const invest = Number(c.investimento || 0)
            const fatur = c.faturamento_atribuido ? Number(c.faturamento_atribuido) : null
            const roas = fatur && invest > 0 ? fatur / invest : null

            let cplColor = 'var(--ink-muted)'
            let cplBg = 'var(--line-soft)'
            if (cplNum && metaNum) {
              if (cplNum <= metaNum) { cplColor = 'var(--green)'; cplBg = '#e0ebd9' }
              else if (cplNum <= metaNum * 1.2) { cplColor = '#8a5a00'; cplBg = '#fff4e0' }
              else { cplColor = 'var(--accent)'; cplBg = 'var(--accent-soft)' }
            }

            const roasColors = roas !== null ? getRoasColor(roas) : null

            return (
              <div key={c.id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--line)',
                borderRadius: '6px', padding: '18px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '4px' }}>
                      {c.plataforma}
                    </div>
                    <h3 className="font-serif" style={{ fontSize: '17px', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                      {c.cliente?.nome || '—'}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => abrirEdicao(c)} title="Editar" style={{
                      background: 'transparent', border: '1px solid var(--line)', borderRadius: '4px',
                      cursor: 'pointer', fontSize: '11px', color: 'var(--ink-soft)',
                      padding: '4px 10px', fontFamily: 'inherit', fontWeight: 500,
                    }}>Editar</button>
                    <button onClick={() => handleDelete(c.id)} title="Excluir" style={{
                      background: 'transparent', border: '1px solid var(--line)', borderRadius: '4px',
                      cursor: 'pointer', fontSize: '16px', lineHeight: 1,
                      padding: '2px 9px', color: 'var(--ink-muted)',
                    }}>×</button>
                  </div>
                </div>

                {/* CPL e ROAS lado a lado */}
                <div style={{ display: 'grid', gridTemplateColumns: roas !== null ? '1fr 1fr' : '1fr', gap: '8px', marginBottom: '14px' }}>
                  <div style={{
                    background: cplBg, padding: '10px 14px', borderRadius: '4px',
                  }}>
                    <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: cplColor, fontWeight: 600 }}>
                      CPL
                    </div>
                    <div className="font-serif" style={{ fontSize: '22px', fontWeight: 600, color: cplColor, lineHeight: 1, marginTop: '2px' }}>
                      {cplNum ? formatMoeda(cplNum) : '—'}
                    </div>
                    {metaNum && (
                      <div style={{ fontSize: '10px', color: cplColor, marginTop: '4px' }}>
                        Meta: {formatMoeda(metaNum)}
                      </div>
                    )}
                  </div>

                  {roas !== null && roasColors && (
                    <div style={{
                      background: roasColors.bg, padding: '10px 14px', borderRadius: '4px',
                    }}>
                      <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: roasColors.color, fontWeight: 600 }}>
                        ROAS
                      </div>
                      <div className="font-serif" style={{ fontSize: '22px', fontWeight: 600, color: roasColors.color, lineHeight: 1, marginTop: '2px' }}>
                        {formatRoas(roas)}
                      </div>
                      <div style={{ fontSize: '10px', color: roasColors.color, marginTop: '4px' }}>
                        {formatMoeda(fatur!)} de retorno
                      </div>
                    </div>
                  )}
                </div>

                {/* Mini grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                  <MiniMetric label="Invest." value={formatMoeda(invest)} />
                  <MiniMetric label="Leads" value={String(c.leads)} />
                  <MiniMetric label="Qualif." value={String(c.leads_qualificados)} />
                  {c.agendamentos > 0 && <MiniMetric label="Agend." value={String(c.agendamentos)} />}
                  {c.comparecimentos > 0 && <MiniMetric label="Compar." value={String(c.comparecimentos)} />}
                  {c.fechamentos > 0 && <MiniMetric label="Fechou" value={String(c.fechamentos)} />}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de lançamento/edição */}
      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.5)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          zIndex: 100, padding: '40px 20px', overflowY: 'auto',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--bg-card)', borderRadius: '8px', width: '100%', maxWidth: '640px',
            padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative',
          }}>
            <button onClick={() => setModalOpen(false)} style={{
              position: 'absolute', top: '14px', right: '14px',
              background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer',
              color: 'var(--ink-muted)', lineHeight: 1,
            }}>×</button>

            <h3 className="font-serif" style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '6px' }}>
              {editandoId ? 'Editar lançamento' : 'Lançar KPIs do mês'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '20px' }}>
              Referência: {mesLabel}
            </p>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Cliente *</label>
                  <select required value={form.cliente_id} onChange={(e) => handleClienteChange(e.target.value)} style={inputStyle} disabled={!!editandoId}>
                    <option value="">Selecione...</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Plataforma *</label>
                  <select value={form.plataforma} onChange={(e) => setForm({ ...form, plataforma: e.target.value })} style={inputStyle} disabled={!!editandoId}>
                    <option value="Meta">Meta</option>
                    <option value="Google">Google</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Investimento (R$) *</label>
                  <input type="number" required step="0.01" value={form.investimento} onChange={(e) => setForm({ ...form, investimento: e.target.value })} style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Leads *</label>
                  <input type="number" required value={form.leads} onChange={(e) => setForm({ ...form, leads: e.target.value })} style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Meta CPL (R$)</label>
                  <input type="number" step="0.01" value={form.meta_cpl} onChange={(e) => setForm({ ...form, meta_cpl: e.target.value })} style={inputStyle} placeholder="0" />
                </div>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '20px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                Funil (opcional)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Qualif.</label>
                  <input type="number" value={form.leads_qualificados} onChange={(e) => setForm({ ...form, leads_qualificados: e.target.value })} style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Agendam.</label>
                  <input type="number" value={form.agendamentos} onChange={(e) => setForm({ ...form, agendamentos: e.target.value })} style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Compar.</label>
                  <input type="number" value={form.comparecimentos} onChange={(e) => setForm({ ...form, comparecimentos: e.target.value })} style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Fechou</label>
                  <input type="number" value={form.fechamentos} onChange={(e) => setForm({ ...form, fechamentos: e.target.value })} style={inputStyle} placeholder="0" />
                </div>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '20px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                Faturamento (pra calcular ROAS)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Ticket médio (R$)</label>
                  <input type="number" step="0.01" value={form.ticket_medio} onChange={(e) => setForm({ ...form, ticket_medio: e.target.value })} style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Faturamento atribuído (R$)</label>
                  <input type="number" step="0.01" value={form.faturamento_atribuido} onChange={(e) => setForm({ ...form, faturamento_atribuido: e.target.value })} style={inputStyle} placeholder="0" />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Observações</label>
                <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="Notas sobre o mês..." />
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
                  padding: '10px 20px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                  border: 'none', fontSize: '14px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1, fontFamily: 'inherit',
                }}>
                  {saving ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Lançar'}
                </button>
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
    <div style={{ background: 'var(--bg-card)', padding: '20px 22px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '8px', fontWeight: 600 }}>
        {label}
      </div>
      <div className="font-serif" style={{ fontSize: '26px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em', color: color || 'var(--ink)' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '6px' }}>{sub}</div>}
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', fontWeight: 600 }}>
        {value}
      </div>
    </div>
  )
}