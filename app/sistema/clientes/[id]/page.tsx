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

type Contrato = {
  id: string
  descricao: string | null
  plano_id: string | null
  plano_nome?: string | null
  valor_mensal: number
  dia_vencimento: number
  responsavel_pagamento: string | null
  forma_pagamento: string | null
  data_inicio: string
  ativo: boolean
}

type Cliente = {
  id: string
  nome: string
  segmento: string
  email: string | null
  telefone: string | null
  responsavel_contato: string | null
  verba_midia: number | null
  plataformas: string[] | null
  data_entrada: string
  status: string
  data_saida: string | null
  motivo_saida: string | null
  observacoes: string | null
  meta_cpl_padrao: number | null
  created_at: string
  valor_mensal: number | null
}

const PLATAFORMAS_DISPONIVEIS = ['Meta', 'Google', 'LinkedIn', 'YouTube', 'TikTok']
const SEGMENTOS_SUGERIDOS = ['Odontologia', 'Estética', 'Advocacia', 'Medicina', 'Imobiliária', 'E-commerce', 'Educação', 'Outro']
const FORMAS_PAGAMENTO = ['PIX', 'Boleto', 'Transferência', 'Cartão de crédito', 'Dinheiro']

const statusConfig: { [key: string]: { label: string; bg: string; color: string } } = {
  ativo: { label: 'Ativo', bg: '#e0ebd9', color: 'var(--green)' },
  pausado: { label: 'Pausado', bg: '#e3eef7', color: 'var(--blue)' },
  cancelado: { label: 'Cancelado', bg: '#f5d6cd', color: 'var(--accent)' },
}

export default function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('dados')
  const [faturamentoTotal, setFaturamentoTotal] = useState(0)
  const [showNovoContrato, setShowNovoContrato] = useState(false)
  const [savingContrato, setSavingContrato] = useState(false)
  const [editandoContrato, setEditandoContrato] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ descricao: '', responsavel_pagamento: '', forma_pagamento: 'PIX' })

  const [form, setForm] = useState({
    nome: '',
    segmento: 'Odontologia',
    email: '',
    telefone: '',
    responsavel_contato: '',
    verba_midia: '',
    plataformas: [] as string[],
    data_entrada: '',
    status: 'ativo',
    data_saida: '',
    motivo_saida: '',
    observacoes: '',
    cpf_cnpj: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  })

  const [novoContrato, setNovoContrato] = useState({
    descricao: '',
    plano_id: '',
    valor_mensal: '',
    dia_vencimento: '5',
    responsavel_pagamento: '',
    forma_pagamento: 'PIX',
  })

  async function loadContratos() {
    const { data } = await supabase
      .from('contratos')
      .select('*, planos(nome)')
      .eq('cliente_id', id)
      .eq('ativo', true)
      .order('data_inicio')
    if (data) setContratos(data.map((c: any) => ({ ...c, plano_nome: c.planos?.nome || null })))
  }

  useEffect(() => {
    async function loadData() {
      const [{ data: clienteData }, { data: planosData }] = await Promise.all([
        supabase.from('clientes_completo').select('*').eq('id', id).single(),
        supabase.from('planos').select('id, nome, valor_padrao, permite_valor_customizado'),
      ])
      if (clienteData) {
        setCliente(clienteData as Cliente)
        setForm({
          nome: clienteData.nome,
          segmento: clienteData.segmento,
          email: clienteData.email || '',
          telefone: clienteData.telefone || '',
          responsavel_contato: clienteData.responsavel_contato || '',
          verba_midia: clienteData.verba_midia ? String(clienteData.verba_midia) : '',
          plataformas: clienteData.plataformas || [],
          data_entrada: clienteData.data_entrada,
          status: clienteData.status,
          data_saida: clienteData.data_saida || '',
          motivo_saida: clienteData.motivo_saida || '',
          observacoes: clienteData.observacoes || '',
          cpf_cnpj: clienteData.cpf_cnpj || '',
          cep: clienteData.cep || '',
          endereco: clienteData.endereco || '',
          numero: clienteData.numero || '',
          complemento: clienteData.complemento || '',
          bairro: clienteData.bairro || '',
          cidade: clienteData.cidade || '',
          estado: clienteData.estado || '',
        })
      }
      if (planosData) setPlanos(planosData)
      setLoading(false)
    }
    loadData()
    loadContratos()
  }, [id])

  useEffect(() => {
    if (!id) return
    async function loadFaturamento() {
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

    const { error: clienteError } = await supabase
      .from('clientes')
      .update({
        nome: form.nome,
        segmento: form.segmento,
        email: form.email || null,
        telefone: form.telefone || null,
        responsavel_contato: form.responsavel_contato || null,
        verba_midia: form.verba_midia ? Number(form.verba_midia) : null,
        plataformas: form.plataformas.length > 0 ? form.plataformas : null,
        data_entrada: form.data_entrada,
        status: form.status,
        data_saida: form.status === 'cancelado' ? form.data_saida || null : null,
        motivo_saida: form.status === 'cancelado' ? form.motivo_saida || null : null,
        observacoes: form.observacoes || null,
      })
      .eq('id', id)

    if (clienteError) {
      setError('Erro ao salvar: ' + clienteError.message)
      setSaving(false)
      return
    }

    const { data: refreshed } = await supabase.from('clientes_completo').select('*').eq('id', id).single()
    if (refreshed) setCliente(refreshed as Cliente)
    setEditMode(false)
    setSaving(false)
  }

  async function handleAddContrato() {
    if (!novoContrato.valor_mensal) return
    setSavingContrato(true)

    const { error: contratoError } = await supabase.from('contratos').insert({
      cliente_id: id,
      plano_id: novoContrato.plano_id || null,
      descricao: novoContrato.descricao || null,
      valor_mensal: Number(novoContrato.valor_mensal),
      dia_vencimento: Number(novoContrato.dia_vencimento),
      responsavel_pagamento: novoContrato.responsavel_pagamento || null,
      forma_pagamento: novoContrato.forma_pagamento || null,
      data_inicio: new Date().toISOString().split('T')[0],
      ativo: true,
    })

    if (contratoError) {
      setError('Erro ao adicionar contrato: ' + contratoError.message)
      setSavingContrato(false)
      return
    }

    setNovoContrato({ descricao: '', plano_id: '', valor_mensal: '', dia_vencimento: '5', responsavel_pagamento: '', forma_pagamento: 'PIX' })
    setShowNovoContrato(false)
    setSavingContrato(false)

    const [{ data: clienteRefresh }] = await Promise.all([
      supabase.from('clientes_completo').select('*').eq('id', id).single(),
    ])
    if (clienteRefresh) setCliente(clienteRefresh as Cliente)
    await loadContratos()
  }

  async function handleDesativarContrato(contratoId: string) {
    if (!confirm('Desativar esse contrato? Ele não gerará mais faturas, e as faturas em aberto do mês atual em diante serão canceladas.')) return
    await supabase.from('contratos').update({ ativo: false }).eq('id', contratoId)

    // Faturas já materializadas antes da desativação (mês atual em diante, ainda não pagas)
    // não somem sozinhas só porque o contrato ficou inativo — cancela pra não ficarem
    // cobrando algo que não vai mais existir
    const hoje = new Date()
    const mesAtualISO = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`
    await supabase.from('pagamentos')
      .update({ status: 'cancelado' })
      .eq('contrato_id', contratoId)
      .in('status', ['pendente', 'atrasado'])
      .gte('mes_referencia', mesAtualISO)

    // Se esse era o último contrato ativo do cliente, o cliente vira cancelado também —
    // sem isso ele ficava com R$0/mês mas ainda marcado ATIVO na listagem
    const { count: restantes } = await supabase
      .from('contratos')
      .select('id', { count: 'exact', head: true })
      .eq('cliente_id', id)
      .eq('ativo', true)

    if (!restantes && cliente?.status !== 'cancelado') {
      const motivo = window.prompt('Esse era o último contrato ativo — o cliente vai ser marcado como cancelado. Motivo da saída (opcional):') || null
      await supabase.from('clientes').update({
        status: 'cancelado',
        data_saida: hoje.toISOString().split('T')[0],
        motivo_saida: motivo,
      }).eq('id', id)
    }

    const { data: clienteRefresh } = await supabase.from('clientes_completo').select('*').eq('id', id).single()
    if (clienteRefresh) setCliente(clienteRefresh as Cliente)
    await loadContratos()
  }

  async function handleSalvarEdicaoContrato(contratoId: string) {
    setSavingContrato(true)
    await supabase.from('contratos').update({
      descricao: editForm.descricao || null,
      responsavel_pagamento: editForm.responsavel_pagamento || null,
      forma_pagamento: editForm.forma_pagamento || null,
    }).eq('id', contratoId)
    setEditandoContrato(null)
    setSavingContrato(false)
    await loadContratos()
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que quer excluir esse cliente? Essa ação não pode ser desfeita.')) return
    const { error: delError } = await supabase.from('clientes').delete().eq('id', id)
    if (delError) { alert('Erro ao excluir: ' + delError.message); return }
    router.push('/sistema/clientes')
    router.refresh()
  }

  if (loading) {
    return <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>Carregando...</div>
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

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--line)',
    borderRadius: '4px', fontSize: '14px', color: 'var(--ink)',
    background: 'var(--bg-card)', fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', color: 'var(--ink-soft)',
    marginBottom: '6px', fontWeight: 500,
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
            <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{cliente.segmento}</span>
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
            }}>Editar</button>
            <button onClick={handleDelete} style={{
              padding: '10px 18px', borderRadius: '4px', background: 'transparent', color: 'var(--accent)',
              border: '1px solid var(--line)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}>Excluir</button>
          </div>
        )}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px',
        background: 'var(--line)', border: '1px solid var(--line)',
        marginBottom: '28px', borderRadius: '4px', overflow: 'hidden',
      }}>
        <MiniStat label="Tempo na agência" value={`${mesesNaAgencia} ${mesesNaAgencia === 1 ? 'mês' : 'meses'}`} />
        <MiniStat label="Valor mensal" value={formatMoeda(Number(cliente.valor_mensal ?? 0))} />
        <MiniStat label="Faturamento total" value={formatMoeda(faturamentoTotal)} color="var(--green)" />
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
        <TabBtn label="Dados" active={activeTab === 'dados'} onClick={() => setActiveTab('dados')} />
        <TabBtn label="Pagamentos" active={activeTab === 'pagamentos'} onClick={() => setActiveTab('pagamentos')} />
        <TabBtn label="Campanhas" active={activeTab === 'campanhas'} onClick={() => setActiveTab('campanhas')} />
        <TabBtn label="Histórico" active={activeTab === 'historico'} onClick={() => setActiveTab('historico')} />
      </div>

      {activeTab === 'dados' && (
        <div>
          {!editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Dados gerais */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px', padding: '28px' }}>
                <DadosView cliente={cliente} formatMoeda={formatMoeda} />
              </div>

              {/* Contratos */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 600 }}>Contratos ativos</h3>
                  <button onClick={() => setShowNovoContrato(!showNovoContrato)} style={{
                    padding: '8px 16px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                    border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    {showNovoContrato ? 'Cancelar' : '+ Novo contrato'}
                  </button>
                </div>

                {showNovoContrato && (
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={labelStyle}>Descrição do serviço *</label>
                        <input type="text" value={novoContrato.descricao} onChange={(e) => setNovoContrato({ ...novoContrato, descricao: e.target.value })} style={inputStyle} placeholder="Ex: Tráfego pago, Landing Page..." />
                      </div>
                      <div>
                        <label style={labelStyle}>Plano</label>
                        <select value={novoContrato.plano_id} onChange={(e) => setNovoContrato({ ...novoContrato, plano_id: e.target.value })} style={inputStyle}>
                          <option value="">Selecione...</option>
                          {planos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={labelStyle}>Valor mensal (R$) *</label>
                        <input type="number" step="0.01" value={novoContrato.valor_mensal} onChange={(e) => setNovoContrato({ ...novoContrato, valor_mensal: e.target.value })} style={inputStyle} placeholder="0.00" />
                      </div>
                      <div>
                        <label style={labelStyle}>Dia de vencimento *</label>
                        <select value={novoContrato.dia_vencimento} onChange={(e) => setNovoContrato({ ...novoContrato, dia_vencimento: e.target.value })} style={inputStyle}>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>Dia {d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Forma de pagamento</label>
                        <select value={novoContrato.forma_pagamento} onChange={(e) => setNovoContrato({ ...novoContrato, forma_pagamento: e.target.value })} style={inputStyle}>
                          {FORMAS_PAGAMENTO.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Responsável pelo pagamento</label>
                      <input type="text" value={novoContrato.responsavel_pagamento} onChange={(e) => setNovoContrato({ ...novoContrato, responsavel_pagamento: e.target.value })} style={inputStyle} placeholder="Ex: João Silva (Parceiro), Próprio cliente..." />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={handleAddContrato} disabled={savingContrato || !novoContrato.valor_mensal} style={{
                        padding: '10px 20px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                        border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                        opacity: savingContrato || !novoContrato.valor_mensal ? 0.4 : 1,
                      }}>
                        {savingContrato ? 'Salvando...' : 'Adicionar contrato'}
                      </button>
                    </div>
                  </div>
                )}

                {contratos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-muted)', fontSize: '14px', fontStyle: 'italic' }}>
                    Nenhum contrato ativo.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {contratos.map((c) => (
                      <div key={c.id} style={{
                        border: '1px solid var(--line)', borderRadius: '6px', padding: '16px 20px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap',
                      }}>
                        <div style={{ flex: 1 }}>
                          {editandoContrato === c.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <input
                                type="text"
                                value={editForm.descricao}
                                onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                                placeholder="Descrição do serviço"
                                style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', color: 'var(--ink)', background: 'var(--bg-card)' }}
                              />
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <input
                                  type="text"
                                  value={editForm.responsavel_pagamento}
                                  onChange={(e) => setEditForm({ ...editForm, responsavel_pagamento: e.target.value })}
                                  placeholder="Responsável pelo pagamento"
                                  style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '13px', fontFamily: 'inherit', color: 'var(--ink)', background: 'var(--bg-card)' }}
                                />
                                <select
                                  value={editForm.forma_pagamento}
                                  onChange={(e) => setEditForm({ ...editForm, forma_pagamento: e.target.value })}
                                  style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '13px', fontFamily: 'inherit', color: 'var(--ink)', background: 'var(--bg-card)' }}
                                >
                                  {FORMAS_PAGAMENTO.map((f) => <option key={f} value={f}>{f}</option>)}
                                </select>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleSalvarEdicaoContrato(c.id)} disabled={savingContrato} style={{
                                  padding: '7px 14px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                                  border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                                }}>Salvar</button>
                                <button onClick={() => setEditandoContrato(null)} style={{
                                  padding: '7px 14px', borderRadius: '4px', background: 'transparent', color: 'var(--ink-muted)',
                                  border: '1px solid var(--line)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                                }}>Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px', color: 'var(--ink)' }}>
                                {c.descricao || 'Sem descrição'}
                                {c.plano_nome && <span style={{ fontWeight: 400, color: 'var(--ink-muted)', fontSize: '13px' }}> · {c.plano_nome}</span>}
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--ink-soft)' }}>
                                <span><strong style={{ color: 'var(--ink)' }}>{formatMoeda(c.valor_mensal)}</strong>/mês</span>
                                <span>Vence dia {c.dia_vencimento}</span>
                                {c.responsavel_pagamento && <span>Paga: {c.responsavel_pagamento}</span>}
                                {c.forma_pagamento && <span>via {c.forma_pagamento}</span>}
                              </div>
                            </>
                          )}
                        </div>
                        {editandoContrato !== c.id && (
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <button onClick={() => { setEditandoContrato(c.id); setEditForm({ descricao: c.descricao || '', responsavel_pagamento: c.responsavel_pagamento || '', forma_pagamento: c.forma_pagamento || 'PIX' }) }} style={{
                              background: 'transparent', border: '1px solid var(--line)', borderRadius: '4px',
                              padding: '6px 12px', fontSize: '12px', color: 'var(--ink-muted)',
                              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                            }}>Editar</button>
                            <button onClick={() => handleDesativarContrato(c.id)} style={{
                              background: 'transparent', border: '1px solid var(--line)', borderRadius: '4px',
                              padding: '6px 12px', fontSize: '12px', color: 'var(--ink-muted)',
                              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                            }}>Desativar</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px', padding: '28px' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Data de entrada *</label>
                    <input type="date" required value={form.data_entrada} onChange={(e) => setForm({ ...form, data_entrada: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Status *</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                      <option value="ativo">Ativo</option>
                      <option value="pausado">Pausado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
                {form.status === 'cancelado' && (
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
                  <label style={labelStyle}>CPF / CNPJ</label>
                  <input type="text" value={form.cpf_cnpj} onChange={(e) => setForm({ ...form, cpf_cnpj: e.target.value })} placeholder="000.000.000-00 ou 00.000.000/0001-00" style={inputStyle} />
                </div>
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '24px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Endereço</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>CEP</label>
                      <input type="text" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} placeholder="00000-000" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Número</label>
                      <input type="text" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="123" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Endereço</label>
                    <input type="text" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, Avenida..." style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Complemento</label>
                      <input type="text" value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} placeholder="Sala, Apto..." style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Bairro</label>
                      <input type="text" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} placeholder="Bairro" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Cidade</label>
                      <input type="text" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Cidade" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Estado</label>
                      <input type="text" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} placeholder="SP" maxLength={2} style={inputStyle} />
                    </div>
                  </div>
                </div>
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
            </div>
          )}
        </div>
      )}

      {activeTab === 'historico' && <ClienteHistorico clienteId={cliente.id} />}

      {activeTab === 'pagamentos' && (
        <ClientePagamentos cliente={{
          id: cliente.id, nome: cliente.nome,
          email: cliente.email, telefone: cliente.telefone,
          data_entrada: cliente.data_entrada,
        }} />
      )}

      {activeTab === 'campanhas' && (
        <ClienteCampanhas cliente={{
          id: cliente.id, nome: cliente.nome,
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

function DadosView({ cliente, formatMoeda }: { cliente: Cliente; formatMoeda: (v: number) => string }) {
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
      <Item label="Verba de mídia" value={cliente.verba_midia ? formatMoeda(Number(cliente.verba_midia)) : null} />
      <Item label="Plataformas" value={cliente.plataformas?.join(', ') || null} />
      <Item label="Data de entrada" value={dataEntradaStr} />
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
