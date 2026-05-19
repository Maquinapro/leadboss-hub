'use client'

import { useState, useEffect, FormEvent, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import ClienteHistorico from '@/components/ClienteHistorico'
import ClientePagamentos from '@/components/ClientePagamentos'
import ClienteCampanhas from '@/components/ClienteCampanhas'

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
  contrato_id: string | null
  plano_nome: string | null
  valor_mensal: number
  verba_midia: number | null
  plataformas: string[] | null
  data_entrada: string
  dia_vencimento: number | null
  status: string
  data_saida: string | null
  motivo_saida: string | null
  observacoes: string | null
  meta_cpl_padrao: number | null
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
  cancelado: { label: 'Cancelado', bg: '#f5d6cd', color: 'var(--accent)' },
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
  const [faturamentoTotal, setFaturamentoTotal] = useState(0)

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
      if (!id) return
      
      const [{ data: clienteData }, { data: planosData }] = await Promise.all([
        supabase.from('clientes_completo').select('*').eq('id', id).single(),
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
  }, [id, supabase])

  useEffect(() => {
    async function loadFaturamento() {
      if (!id) return
      const { data } = await supabase
        .from('pagamentos')
        .select('valor')
        .eq('cliente_id', id)
        .eq('status', 'pago')
      if (data) {
        const total = data.reduce((s, p) => s + Number(p.valor), 0)
        setFaturamentoTotal(total)
      }
    }
    loadFaturamento()
  }, [id, supabase])

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

    const isCancelado = form.status === 'cancelado' || form.status === 'encerrado'

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
        data_saida: isCancelado ? form.data_saida || null : null,
        motivo_saida: isCancelado ? form.motivo_saida || null : null,
        observacoes: form.observacoes || null,
      })
      .eq('id', id)

    if (updateError) {
      setError('Erro ao salvar: ' + updateError.message)
      setSaving(false)
      return
    }

    const { data: refreshed } = await supabase.from('clientes_completo').select('*').eq('id', id).single()
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
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-muted)' }}>
        Carregando dados do cliente...
      </div>
    )
  }

  if (!cliente) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--ink-muted)', marginBottom: '20px' }}>Cliente não encontrado.</p>
        <Link href="/sistema/clientes" className="btn-primary">Voltar para lista</Link>
      </div>
    )
  }

  const formatMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const status = statusConfig[cliente.status] || { label: cliente.status, bg: '#eee', color: '#666' }

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Link href="/sistema/clientes" style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '14px' }}>
              ← Clientes
            </Link>
          </div>
          <h1 className="font-serif" style={{ fontSize: '32px', marginBottom: '12px' }}>{cliente.nome}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
              background: status.bg, color: status.color, textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              {status.label}
            </span>
            <span style={{ color: 'var(--ink-muted)', fontSize: '14px' }}>{cliente.segmento}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setEditMode(!editMode)} className="btn-secondary">
            {editMode ? 'Cancelar' : 'Editar cliente'}
          </button>
          <button onClick={handleDelete} style={{
            background: 'none', border: '1px solid #ff4d4d', color: '#ff4d4d',
            padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer'
          }}>
            Excluir
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', marginBottom: '40px' }}>
        <MiniStat label="Faturamento Total" value={formatMoeda(faturamentoTotal)} color="var(--green)" />
        <MiniStat label="Valor Mensal" value={formatMoeda(Number(cliente.valor_mensal))} />
        <MiniStat label="Verba de Mídia" value={cliente.verba_midia ? formatMoeda(Number(cliente.verba_midia)) : '—'} />
        <MiniStat label="Desde" value={new Date(cliente.data_entrada).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} />
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
        <TabBtn label="Dados Gerais" active={activeTab === 'dados'} onClick={() => setActiveTab('dados')} />
        <TabBtn label="Histórico / Notas" active={activeTab === 'historico'} onClick={() => setActiveTab('historico')} />
        <TabBtn label="Pagamentos" active={activeTab === 'pagamentos'} onClick={() => setActiveTab('pagamentos')} />
        <TabBtn label="Campanhas" active={activeTab === 'campanhas'} onClick={() => setActiveTab('campanhas')} />
      </div>

      {activeTab === 'dados' && (
        <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          {error && <div style={{ color: 'var(--accent)', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
          
          {!editMode ? (
            <DadosView cliente={cliente} planos={planos} formatMoeda={formatMoeda} />
          ) : (
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="form-group">
                  <label>Nome da empresa / cliente</label>
                  <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Segmento</label>
                  <select value={form.segmento} onChange={(e) => setForm({ ...form, segmento: e.target.value })}>
                    {SEGMENTOS_SUGERIDOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input type="text" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Responsável de contato</label>
                  <input type="text" value={form.responsavel_contato} onChange={(e) => setForm({ ...form, responsavel_contato: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Plano</label>
                  <select value={form.plano_id} onChange={(e) => setForm({ ...form, plano_id: e.target.value })}>
                    <option value="">Selecione um plano</option>
                    {planos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Valor mensal (Fee)</label>
                  <input type="number" value={form.valor_mensal} onChange={(e) => setForm({ ...form, valor_mensal: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Verba de mídia</label>
                  <input type="number" value={form.verba_midia} onChange={(e) => setForm({ ...form, verba_midia: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Data de entrada</label>
                  <input type="date" value={form.data_entrada} onChange={(e) => setForm({ ...form, data_entrada: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Dia de vencimento</label>
                  <input type="number" value={form.dia_vencimento} onChange={(e) => setForm({ ...form, dia_vencimento: e.target.value })} min="1" max="31" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="ativo">Ativo</option>
                    <option value="prospeccao">Prospecção</option>
                    <option value="pausado">Pausado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                {form.status === 'cancelado' && (
                  <>
                    <div className="form-group">
                      <label>Data de saída</label>
                      <input type="date" value={form.data_saida} onChange={(e) => setForm({ ...form, data_saida: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Motivo da saída</label>
                      <input type="text" value={form.motivo_saida} onChange={(e) => setForm({ ...form, motivo_saida: e.target.value })} placeholder="Ex: Corte de custos" />
                    </div>
                  </>
                )}

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Plataformas</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {PLATAFORMAS_DISPONIVEIS.map(p => (
                      <button key={p} type="button" onClick={() => togglePlataforma(p)} style={{
                        padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                        border: '1px solid',
                        background: form.plataformas.includes(p) ? 'var(--ink)' : 'none',
                        color: form.plataformas.includes(p) ? 'white' : 'var(--ink)',
                        borderColor: form.plataformas.includes(p) ? 'var(--ink)' : 'var(--border)',
                      }}>{p}</button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Observações</label>
                  <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={4} />
                </div>
              </div>

              <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                <button type="submit" disabled={saving} className="btn-primary" style={{
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

      {activeTab === 'pagamentos' && (
        <ClientePagamentos cliente={{
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
          data_entrada: cliente.data_entrada,
        }} />
      )}

      {activeTab === 'campanhas' && (
        <ClienteCampanhas cliente={{
          id: cliente.id,
          nome: cliente.nome,
          plataformas: cliente.plataformas,
          meta_cpl_padrao: cliente.meta_cpl_padrao,
        }} />
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
      <Item label="Plano" value={cliente.plano_nome || '—'} />
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