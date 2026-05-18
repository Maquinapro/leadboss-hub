'use client'

import { useState, useEffect, FormEvent, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import ClienteHistorico from '@/components/ClienteHistorico'

type Plano = {
  id: string
  nome: string
  valor_padrao: number | null
  permite_valor_customizado: boolean
}

type Cliente = {
  id: string
  nome: string
  segmento: string
  email: string | null
  telefone: string | null
  responsavel_contato: string | null
  plano_id: string | null
  valor_mensal: number
  verba_midia: number | null
  plataformas: string[] | null
  data_entrada: string
  dia_vencimento: number | null
  status: string
  data_saida: string | null
  motivo_saida: string | null
  observacoes: string | null
  created_at: string
}

const PLATAFORMAS_DISPONIVEIS = ['Meta', 'Google', 'LinkedIn', 'YouTube', 'TikTok']
const SEGMENTOS_SUGERIDOS = [
  'Odontologia',
  'Estética',
  'Advocacia',
  'Medicina',
  'Imobiliária',
  'E-commerce',
  'Educação',
  'Outro',
]

const statusConfig: { [key: string]: { label: string; bg: string; color: string } } = {
  ativo: { label: 'Ativo', bg: '#e0ebd9', color: 'var(--green)' },
  prospeccao: { label: 'Prospecção', bg: '#fff4e0', color: '#8a5a00' },
  pausado: { label: 'Pausado', bg: '#e3eef7', color: 'var(--blue)' },
  encerrado: { label: 'Encerrado', bg: '#f5d6cd', color: 'var(--accent)' },
}

export default function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('dados')

  const [form, setForm] = useState({
    nome: '',
    segmento: 'Odontologia',
    email: '',
    telefone: '',
    responsavel_contato: '',
    plano_id: '',
    valor_mensal: '',
    verba_midia: '',
    plataformas: [] as string[],
    data_entrada: '',
    dia_vencimento: '5',
    status: 'ativo',
    data_saida: '',
    motivo_saida: '',
    observacoes: '',
  })

  useEffect(() => {
    async function loadData() {
      const [{ data: clienteData }, { data: planosData }] = await Promise.all([
        supabase.from('clientes').select('*').eq('id', id).single(),
        supabase.from('planos').select('id, nome, valor_padrao, permite_valor_customizado'),
      ])

      if (clienteData) {
        setCliente(clienteData)
        setForm({
          nome: clienteData.nome,
          segmento: clienteData.segmento,
          email: clienteData.email || '',
          telefone: clienteData.telefone || '',
          responsavel_contato: clienteData.responsavel_contato || '',
          plano_id: clienteData.plano_id || '',
          valor_mensal: String(clienteData.valor_mensal),
          verba_midia: clienteData.verba_midia ? String(clienteData.verba_midia) : '',
          plataformas: clienteData.plataformas || [],
          data_entrada: clienteData.data_entrada,
          dia_vencimento: clienteData.dia_vencimento ? String(clienteData.dia_vencimento) : '5',
          status: clienteData.status,
          data_saida: clienteData.data_saida || '',
          motivo_saida: clienteData.motivo_saida || '',
          observacoes: clienteData.observacoes || '',
        })
      }
      if (planosData) setPlanos(planosData)
      setLoading(false)
    }
    loadData()
  }, [id])

  function togglePlataforma(plat: string) {
    setForm((f) => ({
      ...f,
      plataformas: f.plataformas.includes(plat)
        ? f.plataformas.filter((p) => p !== plat)
        : [...f.plataformas, plat],
    }))
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const { error: updateError } = await supabase
      .from('clientes')
      .update({
        nome: form.nome,
        segmento: form.segmento,
        email: form.email || null,
        telefone: form.telefone || null,
        responsavel_contato: form.responsavel_contato || null,
        plano_id: form.plano_id || null,
        valor_mensal: Number(form.valor_mensal),
        verba_midia: form.verba_midia ? Number(form.verba_midia) : null,
        plataformas: form.plataformas.length > 0 ? form.plataformas : null,
        data_entrada: form.data_entrada,
        dia_vencimento: Number(form.dia_vencimento),
        status: form.status,
        data_saida: form.status === 'encerrado' ? form.data_saida || null : null,
        motivo_saida: form.status === 'encerrado' ? form.motivo_saida || null : null,
        observacoes: form.observacoes || null,
      })
      .eq('id', id)

    if (updateError) {
      setError('Erro ao salvar: ' + updateError.message)
      setSaving(false)
      return
    }

    const { data: refreshed } = await supabase.from('clientes').select('*').eq('id', id).single()
    if (refreshed) setCliente(refreshed)
    setEditMode(false)
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que quer excluir esse cliente? Essa ação não pode ser desfeita.')) {
      return
    }
    const { error: delError } = await supabase.from('clientes').delete().eq('id', id)
    if (delError) {
      alert('Erro ao excluir: ' + delError.message)
      return
    }
    router.push('/sistema/clientes')
    router.refresh()
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
        Carregando...
      </div>
    )
  }

  if (!cliente) {
    return (
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--ink-muted)', marginBottom: '16px' }}>Cliente não encontrado.</p>
        <Link href="/sistema/clientes" style={{ textDecoration: 'underline' }}>← Voltar para clientes</Link>
      </div>
    )
  }

  const cfg = statusConfig[cliente.status] || statusConfig.ativo
  const formatMoeda = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const dataEntrada = new Date(cliente.data_entrada)
  const hoje = new Date()
  const mesesNaAgencia = Math.max(
    0,
    (hoje.getFullYear() - dataEntrada.getFullYear()) * 12 + (hoje.getMonth() - dataEntrada.getMonth())
  )
  const faturamentoTotal = mesesNaAgencia * Number(cliente.valor_mensal)

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
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <Link href="/sistema/clientes" style={{ fontSize: '12px', color: 'var(--ink-muted)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
        ← Clientes
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginTop: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: '3px', fontWeight: 600, background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
              {cliente.segmento}
            </span>
          </div>
          <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {cliente.nome}
          </h1>
        </div>

        {!editMode && activeTab === 'dados' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setEditMode(true)} style={{
              padding: '10px 18px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
              border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Editar
            </button>
            <button onClick={handleDelete} style={{
              padding: '10px 18px', borderRadius: '4px', background: 'transparent', color: 'var(--accent)',
              border: '1px solid var(--line)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Excluir
            </button>
          </div>
        )}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
        background: 'var(--line)', border: '1px solid var(--line)',
        marginBottom: '28px', borderRadius: '4px', overflow: 'hidden',
      }}>
        <MiniStat label="Tempo na agência" value={`${mesesNaAgencia} ${mesesNaAgencia === 1 ? 'mês' : 'meses'}`} />
        <MiniStat label="Valor mensal" value={formatMoeda(Number(cliente.valor_mensal))} />
        <MiniStat label="Faturamento total" value={formatMoeda(faturamentoTotal)} color="var(--green)" />
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
        <TabBtn label="Dados" active={activeTab === 'dados'} onClick={() => setActiveTab('dados')} />
        <TabBtn label="Pagamentos" active={activeTab === 'pagamentos'} onClick={() => setActiveTab('pagamentos')} />
        <TabBtn label="Campanhas" active={activeTab === 'campanhas'} onClick={() => setActiveTab('campanhas')} />
        <TabBtn label="Histórico" active={activeTab === 'historico'} onClick={() => setActiveTab('historico')} />
      </div>

      {activeTab === 'dados' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px', padding: '28px' }}>
          {!editMode ? (
            <DadosView cliente={cliente} planos={planos} formatMoeda={formatMoeda} />
          ) : (
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Nome *</label>
                <input type="text" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Segmento *</label>
                <select value={form.segmento} onChange={(e) => setForm({ ...form, segmento: e.target.value })} style={inputStyle}>
                  {SEGMENTOS_SUGERIDOS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>E-mail</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Telefone</label>
                  <input type="text" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Responsável de contato</label>
                <input type="text" value={form.responsavel_contato} onChange={(e) => setForm({ ...form, responsavel_contato: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Plano *</label>
                  <select required value={form.plano_id} onChange={(e) => setForm({ ...form, plano_id: e.target.value })} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {planos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Valor mensal (R$) *</label>
                  <input type="number" required step="0.01" value={form.valor_mensal} onChange={(e) => setForm({ ...form, valor_mensal: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Verba de mídia (R$)</label>
                <input type="number" step="0.01" value={form.verba_midia} onChange={(e) => setForm({ ...form, verba_midia: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Plataformas</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {PLATAFORMAS_DISPONIVEIS.map((p) => {
                    const ativo = form.plataformas.includes(p)
                    return (
                      <button type="button" key={p} onClick={() => togglePlataforma(p)} style={{
                        padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                        border: '1.5px solid', borderColor: ativo ? 'var(--ink)' : 'var(--line)',
                        background: ativo ? 'var(--ink)' : 'transparent', color: ativo ? 'var(--bg)' : 'var(--ink-soft)',
                        fontFamily: 'inherit',
                      }}>{p}</button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Data de entrada *</label>
                  <input type="date" required value={form.data_entrada} onChange={(e) => setForm({ ...form, data_entrada: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Dia de vencimento *</label>
                  <select required value={form.dia_vencimento} onChange={(e) => setForm({ ...form, dia_vencimento: e.target.value })} style={inputStyle}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>Dia {d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status *</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                    <option value="prospeccao">Prospecção</option>
                    <option value="ativo">Ativo</option>
                    <option value="pausado">Pausado</option>
                    <option value="encerrado">Encerrado</option>
                  </select>
                </div>
              </div>

              {form.status === 'encerrado' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Data de saída</label>
                    <input type="date" value={form.data_saida} onChange={(e) => setForm({ ...form, data_saida: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Motivo da saída</label>
                    <input type="text" value={form.motivo_saida} onChange={(e) => setForm({ ...form, motivo_saida: e.target.value })} style={inputStyle} placeholder="Ex: preço, sem resultado, mudou de agência..." />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Observações</label>
                <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
              </div>

              {error && (
                <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '12px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditMode(false)} style={{
                  padding: '12px 20px', borderRadius: '4px', fontSize: '14px', fontWeight: 500,
                  color: 'var(--ink-soft)', border: '1px solid var(--line)', background: 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{
                  padding: '12px 24px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                  border: 'none', fontSize: '14px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1, fontFamily: 'inherit',
                }}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'historico' && (
        <ClienteHistorico clienteId={cliente.id} />
      )}

      {(activeTab === 'pagamentos' || activeTab === 'campanhas') && (
        <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--line)', borderRadius: '6px', padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
          <div className="font-serif" style={{ fontSize: '48px', fontStyle: 'italic', color: 'var(--line)', marginBottom: '8px' }}>*</div>
          <h3 className="font-serif" style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '8px', fontWeight: 600 }}>
            Em breve
          </h3>
          <p style={{ fontSize: '14px' }}>
            Essa seção vai ser construída na próxima etapa.
          </p>
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', padding: '18px 22px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '6px', fontWeight: 600 }}>
        {label}
      </div>
      <div className="font-serif" style={{ fontSize: '24px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em', color: color || 'var(--ink)' }}>
        {value}
      </div>
    </div>
  )
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', padding: '12px 18px', fontSize: '14px', fontWeight: 500,
      color: active ? 'var(--ink)' : 'var(--ink-muted)', cursor: 'pointer',
      borderBottom: '2px solid', borderBottomColor: active ? 'var(--accent)' : 'transparent',
      marginBottom: '-1px', fontFamily: 'inherit',
    }}>
      {label}
    </button>
  )
}

function DadosView({ cliente, planos, formatMoeda }: { cliente: Cliente; planos: Plano[]; formatMoeda: (v: number) => string }) {
  const plano = planos.find((p) => p.id === cliente.plano_id)
  const dataEntradaStr = new Date(cliente.data_entrada).toLocaleDateString('pt-BR')

  const Item = ({ label, value }: { label: string; value: string | null }) => (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '4px', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: '15px', color: value ? 'var(--ink)' : 'var(--ink-muted)', fontStyle: value ? 'normal' : 'italic' }}>
        {value || '—'}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px 24px' }}>
      <Item label="E-mail" value={cliente.email} />
      <Item label="Telefone" value={cliente.telefone} />
      <Item label="Responsável de contato" value={cliente.responsavel_contato} />
      <Item label="Plano" value={plano?.nome || '—'} />
      <Item label="Valor mensal" value={formatMoeda(Number(cliente.valor_mensal))} />
      <Item label="Verba de mídia" value={cliente.verba_midia ? formatMoeda(Number(cliente.verba_midia)) : null} />
      <Item label="Plataformas" value={cliente.plataformas?.join(', ') || null} />
      <Item label="Data de entrada" value={dataEntradaStr} />
      <Item label="Dia de vencimento" value={cliente.dia_vencimento ? `Dia ${cliente.dia_vencimento}` : null} />
      {cliente.data_saida && <Item label="Data de saída" value={new Date(cliente.data_saida).toLocaleDateString('pt-BR')} />}
      {cliente.motivo_saida && <Item label="Motivo da saída" value={cliente.motivo_saida} />}
      {cliente.observacoes && (
        <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
          <Item label="Observações" value={cliente.observacoes} />
        </div>
      )}
    </div>
  )
}