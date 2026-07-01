'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

type Atividade = {
  id: string
  cliente_id: string
  tipo: string
  titulo: string
  descricao: string | null
  data_evento: string | null
  concluida: boolean
  cliente_nome?: string
}

type EventoFinanceiro = {
  id: string
  tipo: 'receber' | 'pagar'
  titulo: string
  valor: number
  status: string
  data_vencimento: string
}

type ClienteSimples = {
  id: string
  nome: string
}

const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const DIAS_SEMANA_FULL = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const tipoCores: { [key: string]: string } = {
  tarefa: '#5a7d5a',
  reuniao: '#8a5a00',
  ligacao: '#2d6a8f',
  relatorio: '#6a4c93',
  cobranca: '#c44536',
  nova_campanha: '#2a9d8f',
  alt_campanha: '#e76f51',
  observacao: '#888',
}

const tipoLabels: { [key: string]: string } = {
  tarefa: 'Tarefa',
  reuniao: 'Reunião',
  ligacao: 'Ligação',
  relatorio: 'Relatório',
  cobranca: 'Cobrança',
  nova_campanha: 'Nova campanha',
  alt_campanha: 'Alt. campanha',
  observacao: 'Obs',
}

export default function DashboardToDo() {
  const supabase = createClient()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [clientes, setClientes] = useState<ClienteSimples[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mesAtual, setMesAtual] = useState(new Date())
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Atividade | null>(null)
  const [eventoFinanceiro, setEventoFinanceiro] = useState<EventoFinanceiro | null>(null)
  const [eventosFinanceiros, setEventosFinanceiros] = useState<EventoFinanceiro[]>([])
  const [isMobile, setIsMobile] = useState(false)

  const [form, setForm] = useState({
    cliente_id: '',
    tipo: 'tarefa',
    titulo: '',
    descricao: '',
    data_evento: '',
  })

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => { loadData() }, [])
  useEffect(() => { loadFinanceiro() }, [mesAtual])

  async function loadData() {
    try {
      const [{ data: atividadesData }, { data: clientesData }] = await Promise.all([
        supabase
          .from('atividades')
          .select('*, clientes (nome)')
          .eq('concluida', false)
          .order('data_evento', { ascending: true, nullsFirst: false }),
        supabase
          .from('clientes')
          .select('id, nome')
          .eq('status', 'ativo')
          .order('nome'),
      ])
      if (atividadesData) {
        setAtividades(atividadesData.map((a: any) => ({
          ...a,
          cliente_nome: a.clientes?.nome || 'Sem cliente',
        })))
      }
      if (clientesData) setClientes(clientesData)
    } catch (e) {
      console.error('loadData error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function loadFinanceiro() {
    try {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    const inicioMes = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
    const fimMes = `${ano}-${String(mes + 1).padStart(2, '0')}-${new Date(ano, mes + 1, 0).getDate()}`

    const [{ data: pagamentos }, { data: despesas }] = await Promise.all([
      supabase
        .from('pagamentos')
        .select('id, data_vencimento, valor, status, cliente:clientes(nome)')
        .gte('data_vencimento', inicioMes)
        .lte('data_vencimento', fimMes),
      supabase
        .from('despesas')
        .select('id, data_vencimento, valor, status, descricao')
        .gte('data_vencimento', inicioMes)
        .lte('data_vencimento', fimMes)
        .not('data_vencimento', 'is', null),
    ])

    const eventos: EventoFinanceiro[] = []

    if (pagamentos) {
      pagamentos.forEach((p: any) => {
        eventos.push({
          id: p.id,
          tipo: 'receber',
          titulo: p.cliente?.nome || 'Cliente',
          valor: p.valor,
          status: p.status,
          data_vencimento: p.data_vencimento,
        })
      })
    }

    if (despesas) {
      despesas.forEach((d: any) => {
        eventos.push({
          id: d.id,
          tipo: 'pagar',
          titulo: d.descricao || 'Despesa',
          valor: d.valor,
          status: d.status,
          data_vencimento: d.data_vencimento,
        })
      })
    }

    setEventosFinanceiros(eventos)
    } catch (e) {
      console.error('loadFinanceiro error:', e)
    }
  }

  async function handleToggle(id: string) {
    await supabase.from('atividades').update({ concluida: true }).eq('id', id)
    setAtividades((prev) => prev.filter((a) => a.id !== id))
  }

  async function handleSubmit() {
    if (!form.titulo.trim() || !form.cliente_id) return
    setSaving(true)
    await supabase.from('atividades').insert({
      cliente_id: form.cliente_id,
      tipo: form.tipo,
      titulo: form.titulo,
      descricao: form.descricao || null,
      data_evento: form.data_evento || null,
      concluida: false,
    })
    setForm({ cliente_id: '', tipo: 'tarefa', titulo: '', descricao: '', data_evento: '' })
    setShowForm(false)
    setSaving(false)
    loadData()
  }

  // Calendário
  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()
  const primeiroDiaDoMes = new Date(ano, mes, 1).getDay()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const diasMesAnterior = new Date(ano, mes, 0).getDate()
  const hoje = new Date()
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
  const totalCelulas = Math.ceil((primeiroDiaDoMes + diasNoMes) / 7) * 7

  // Agrupar atividades por dia
  const atividadesPorDia: { [key: string]: Atividade[] } = {}
  atividades.forEach((a) => {
    if (a.data_evento) {
      const diaKey = a.data_evento.split('T')[0]
      if (!atividadesPorDia[diaKey]) atividadesPorDia[diaKey] = []
      atividadesPorDia[diaKey].push(a)
    }
  })

  // Agrupar eventos financeiros por dia
  const financeiroPorDia: { [key: string]: EventoFinanceiro[] } = {}
  eventosFinanceiros.forEach((e) => {
    const diaKey = e.data_vencimento
    if (!financeiroPorDia[diaKey]) financeiroPorDia[diaKey] = []
    financeiroPorDia[diaKey].push(e)
  })

  function navMes(delta: number) {
    const novo = new Date(mesAtual)
    novo.setMonth(novo.getMonth() + delta)
    setMesAtual(novo)
  }

  function voltaHoje() {
    setMesAtual(new Date())
  }

  // Dias do mês atual que têm tarefas ou eventos financeiros (para agenda mobile)
  const diasComTarefas = Array.from({ length: diasNoMes }, (_, i) => {
    const dia = i + 1
    const diaStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    const tarefas = atividadesPorDia[diaStr] || []
    const financeiros = financeiroPorDia[diaStr] || []
    if (tarefas.length === 0 && financeiros.length === 0) return null
    const date = new Date(ano, mes, dia)
    return { dia, diaStr, diaSemana: DIAS_SEMANA_FULL[date.getDay()], tarefas, financeiros }
  }).filter(Boolean)

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

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    color: 'var(--ink-soft)',
    marginBottom: '6px',
    fontWeight: 500,
  }

  function corFinanceiro(e: EventoFinanceiro) {
    if (e.tipo === 'receber') {
      if (e.status === 'pago') return '#2d6a4f'
      if (e.status === 'atrasado') return '#c44536'
      return '#2a9d8f'
    }
    // pagar
    if (e.status === 'pago') return '#555'
    if (e.status === 'atrasado') return '#c44536'
    return '#8a5a00'
  }

  function renderEventoFinanceiro(e: EventoFinanceiro, size: 'small' | 'large') {
    const cor = corFinanceiro(e)
    const prefixo = e.tipo === 'receber' ? '▲' : '▼'
    const valorFmt = e.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })

    if (size === 'large') {
      return (
        <div
          key={e.id + e.tipo}
          onClick={() => setEventoFinanceiro(e)}
          style={{
            padding: '10px 14px', borderRadius: '6px', cursor: 'pointer',
            background: cor + '15', display: 'flex', alignItems: 'center', gap: '10px',
          }}
        >
          <span style={{ color: cor, fontSize: '12px', flexShrink: 0 }}>{prefixo}</span>
          <span style={{ color: 'var(--ink)', fontSize: '14px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {e.titulo}
          </span>
          <span style={{ color: cor, fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>{valorFmt}</span>
        </div>
      )
    }

    return (
      <div
        key={e.id + e.tipo}
        onClick={() => setEventoFinanceiro(e)}
        title={`${e.tipo === 'receber' ? 'Receber' : 'Pagar'}: ${e.titulo} — ${valorFmt}`}
        style={{
          fontSize: '11px', lineHeight: 1.3, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '2px 4px', borderRadius: '3px',
          background: cor + '15',
        }}
      >
        <span style={{ color: cor, flexShrink: 0, fontSize: '10px' }}>{prefixo}</span>
        <span style={{ color: cor, fontWeight: 600, flexShrink: 0 }}>{valorFmt}</span>
        <span style={{ color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.titulo}</span>
      </div>
    )
  }

  function renderTarefaItem(a: Atividade, size: 'small' | 'large') {
    const hora = a.data_evento
      ? new Date(a.data_evento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : ''
    const cor = tipoCores[a.tipo] || '#888'

    if (size === 'large') {
      return (
        <div
          key={a.id}
          onClick={() => setTarefaSelecionada(a)}
          title={`${a.titulo} — clique pra ver detalhes`}
          style={{
            padding: '10px 14px', borderRadius: '6px', cursor: 'pointer',
            background: cor + '15', display: 'flex', alignItems: 'flex-start', gap: '10px',
          }}
        >
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%', marginTop: '5px',
            background: cor, flexShrink: 0,
          }} />
          <span style={{ color: cor, fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', minWidth: '42px' }}>
            {hora}
          </span>
          <span style={{ color: 'var(--ink)', fontSize: '14px', lineHeight: 1.4 }}>
            {a.titulo}
          </span>
        </div>
      )
    }

    return (
      <div
        key={a.id}
        onClick={() => setTarefaSelecionada(a)}
        title={`${a.titulo} — clique pra ver detalhes`}
        style={{
          fontSize: '11px', lineHeight: 1.3, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '2px 4px', borderRadius: '3px',
          background: cor + '18',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cor, flexShrink: 0 }} />
        <span style={{ color: cor, fontWeight: 500, whiteSpace: 'nowrap' }}>{hora}</span>
        <span style={{ color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titulo}</span>
      </div>
    )
  }


  // Modal de detalhes da tarefa
  const Modal = () => {
    if (!tarefaSelecionada) return null
    const a = tarefaSelecionada
    const cor = tipoCores[a.tipo] || '#888'
    const dataStr = a.data_evento
      ? new Date(a.data_evento).toLocaleString('pt-BR', {
          day: '2-digit', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
        })
      : null

    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px',
      }} onClick={() => setTarefaSelecionada(null)}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: '8px', padding: '0',
          maxWidth: '540px', width: '100%', position: 'relative',
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)', overflow: 'hidden',
        }} onClick={(e) => e.stopPropagation()}>

          {/* Header colorido */}
          <div style={{
            background: cor + '15', borderBottom: '1px solid ' + cor + '30',
            padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <span style={{
                fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
                fontWeight: 700, color: cor,
              }}>
                {tipoLabels[a.tipo] || a.tipo}
              </span>
              <h2 className="font-serif" style={{
                fontSize: '22px', fontWeight: 600, letterSpacing: '-0.01em',
                lineHeight: 1.25, marginTop: '6px', color: 'var(--ink)',
              }}>
                {a.titulo}
              </h2>
            </div>
            <button
              onClick={() => setTarefaSelecionada(null)}
              style={{
                background: 'none', border: 'none', fontSize: '22px',
                cursor: 'pointer', color: 'var(--ink-muted)', fontFamily: 'inherit',
                lineHeight: 1, padding: '0 0 0 16px', flexShrink: 0,
              }}
            >×</button>
          </div>

          {/* Corpo */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: a.descricao ? '16px' : '0' }}>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '4px' }}>
                  Cliente
                </div>
                <div style={{ fontSize: '15px', color: 'var(--ink)', fontWeight: 500 }}>
                  {a.cliente_nome}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '4px' }}>
                  Data e hora
                </div>
                <div style={{ fontSize: '15px', color: 'var(--ink)' }}>
                  {dataStr || '—'}
                </div>
              </div>
            </div>

            {a.descricao && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '6px' }}>
                  Descrição
                </div>
                <div style={{ fontSize: '15px', color: 'var(--ink)', lineHeight: 1.5 }}>
                  {a.descricao}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px', borderTop: '1px solid var(--line)',
            display: 'flex', gap: '10px', justifyContent: 'flex-end',
          }}>
            <button
              onClick={() => setTarefaSelecionada(null)}
              style={{
                padding: '10px 20px', borderRadius: '4px',
                background: 'transparent', color: 'var(--ink-soft)',
                border: '1px solid var(--line)', fontSize: '14px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Fechar
            </button>
            <button
              onClick={() => { handleToggle(a.id); setTarefaSelecionada(null) }}
              style={{
                padding: '10px 20px', borderRadius: '4px',
                background: 'var(--ink)', color: 'var(--bg)',
                border: 'none', fontSize: '14px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              ✓ Concluída
            </button>
          </div>
        </div>
      </div>
    )
  }

  function ModalFinanceiro() {
    if (!eventoFinanceiro) return null
    const e = eventoFinanceiro
    const cor = corFinanceiro(e)
    const tipo = e.tipo === 'receber' ? 'Conta a Receber' : 'Conta a Pagar'
    const statusLabel: { [k: string]: string } = { pago: 'Pago', pendente: 'Pendente', atrasado: 'Atrasado' }
    const valorFmt = e.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const dataFmt = new Date(e.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    const href = e.tipo === 'receber' ? '/sistema/pagamentos' : '/sistema/despesas'

    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px',
      }} onClick={() => setEventoFinanceiro(null)}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: '8px',
          maxWidth: '480px', width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)', overflow: 'hidden',
        }} onClick={(ev) => ev.stopPropagation()}>
          <div style={{
            background: cor + '15', borderBottom: '1px solid ' + cor + '30',
            padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <span style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: cor }}>
                {tipo}
              </span>
              <h2 className="font-serif" style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.25, marginTop: '6px', color: 'var(--ink)' }}>
                {e.titulo}
              </h2>
            </div>
            <button onClick={() => setEventoFinanceiro(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--ink-muted)', fontFamily: 'inherit', lineHeight: 1, padding: '0 0 0 16px', flexShrink: 0 }}>×</button>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '4px' }}>Valor</div>
                <div style={{ fontSize: '18px', color: cor, fontWeight: 700 }}>{valorFmt}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '4px' }}>Vencimento</div>
                <div style={{ fontSize: '14px', color: 'var(--ink)' }}>{dataFmt}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '4px' }}>Status</div>
                <div style={{ fontSize: '14px', color: cor, fontWeight: 600 }}>{statusLabel[e.status] || e.status}</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setEventoFinanceiro(null)} style={{ padding: '10px 20px', borderRadius: '4px', background: 'transparent', color: 'var(--ink-soft)', border: '1px solid var(--line)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              Fechar
            </button>
            <a href={href} style={{ padding: '10px 20px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Ver detalhes →
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '28px' }}>
      <Modal />
      <ModalFinanceiro />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="font-serif" style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.01em' }}>
          To Do
        </h2>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '8px 16px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
          border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {showForm ? 'Cancelar' : '+ Nova tarefa'}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px',
          padding: '20px', marginBottom: '16px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Cliente *</label>
              <select required value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })} style={inputStyle}>
                <option value="">Selecione...</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} style={inputStyle}>
                <option value="tarefa">Tarefa</option>
                <option value="reuniao">Reunião</option>
                <option value="ligacao">Ligação</option>
                <option value="relatorio">Relatório</option>
                <option value="cobranca">Cobrança</option>
                <option value="nova_campanha">Criação de campanha</option>
                <option value="alt_campanha">Alteração de campanha</option>
                <option value="observacao">Observação</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Título *</label>
            <input type="text" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} style={inputStyle} placeholder="Ex: Enviar relatório mensal" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Data/hora</label>
              <input type="datetime-local" value={form.data_evento} onChange={(e) => setForm({ ...form, data_evento: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Descrição</label>
              <input type="text" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} style={inputStyle} placeholder="Detalhes opcionais..." />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSubmit} disabled={saving || !form.titulo.trim() || !form.cliente_id} style={{
              padding: '10px 20px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
              border: 'none', fontSize: '14px', fontWeight: 500, fontFamily: 'inherit',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: (saving || !form.titulo.trim() || !form.cliente_id) ? 0.4 : 1,
            }}>
              {saving ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-muted)' }}>Carregando...</div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px' }}>
            <h3 className="font-serif" style={{ fontSize: '20px', fontWeight: 600 }}>
              {MESES[mes]} {ano}
            </h3>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => navMes(-1)} style={{
                width: '32px', height: '32px', borderRadius: '4px', border: '1px solid var(--line)',
                background: 'transparent', cursor: 'pointer', fontSize: '14px', color: 'var(--ink-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>‹</button>
              <button onClick={voltaHoje} style={{
                width: '32px', height: '32px', borderRadius: '4px', border: '1px solid var(--line)',
                background: 'transparent', cursor: 'pointer', fontSize: '10px', color: 'var(--ink-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>●</button>
              <button onClick={() => navMes(1)} style={{
                width: '32px', height: '32px', borderRadius: '4px', border: '1px solid var(--line)',
                background: 'transparent', cursor: 'pointer', fontSize: '14px', color: 'var(--ink-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>›</button>
            </div>
          </div>

          {/* MOBILE: Agenda view */}
          {isMobile ? (
            <div>
              {diasComTarefas.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '14px' }}>
                  Nenhuma tarefa neste mês.
                </div>
              ) : (
                diasComTarefas.map((item) => {
                  if (!item) return null
                  const ehHoje = item.diaStr === hojeStr
                  return (
                    <div key={item.diaStr} style={{ borderTop: '1px solid var(--line)', padding: '16px 18px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ textAlign: 'center', minWidth: '60px', flexShrink: 0 }}>
                          <div style={{
                            fontSize: '28px', fontWeight: 700, lineHeight: 1,
                            color: ehHoje ? 'var(--accent)' : 'var(--ink)',
                          }}>
                            {item.dia}
                          </div>
                          <div style={{
                            fontSize: '10px', letterSpacing: '0.08em', fontWeight: 600, marginTop: '4px',
                            color: ehHoje ? 'var(--accent)' : 'var(--ink-muted)',
                          }}>
                            {item.diaSemana}
                          </div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {item.tarefas.map((a) => renderTarefaItem(a, 'large'))}
                          {(item as any).financeiros?.map((e: EventoFinanceiro) => renderEventoFinanceiro(e, 'large'))}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          ) : (
            /* DESKTOP: Grid calendar */
            <div style={{ overflowX: 'auto' as any }}>
              {/* Dias da semana */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: '1px solid var(--line)', minWidth: '700px' }}>
                {DIAS_SEMANA.map((d) => (
                  <div key={d} style={{
                    padding: '10px 12px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
                    color: 'var(--ink-muted)', textAlign: 'center', borderBottom: '1px solid var(--line)',
                  }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid dos dias */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minWidth: '700px' }}>
                {Array.from({ length: totalCelulas }, (_, i) => {
                  const diaDoMes = i - primeiroDiaDoMes + 1
                  const foraDoMes = diaDoMes < 1 || diaDoMes > diasNoMes

                  let diaNum: number
                  let diaStr: string
                  if (diaDoMes < 1) {
                    diaNum = diasMesAnterior + diaDoMes
                    const mAnterior = mes === 0 ? 12 : mes
                    const aAnterior = mes === 0 ? ano - 1 : ano
                    diaStr = `${aAnterior}-${String(mAnterior).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`
                  } else if (diaDoMes > diasNoMes) {
                    diaNum = diaDoMes - diasNoMes
                    const mProximo = mes === 11 ? 1 : mes + 2
                    const aProximo = mes === 11 ? ano + 1 : ano
                    diaStr = `${aProximo}-${String(mProximo).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`
                  } else {
                    diaNum = diaDoMes
                    diaStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`
                  }

                  const ehHoje = diaStr === hojeStr
                  const tarefasDoDia = atividadesPorDia[diaStr] || []
                  const financeirosDoDia = financeiroPorDia[diaStr] || []
                  const totalItens = tarefasDoDia.length + financeirosDoDia.length
                  const limite = 4
                  const excesso = totalItens > limite ? totalItens - limite : 0

                  return (
                    <div key={i} style={{
                      minHeight: '100px', padding: '8px',
                      borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--line)' : 'none',
                      borderBottom: '1px solid var(--line)',
                      background: foraDoMes ? 'var(--bg)' : 'var(--bg-card)',
                      opacity: foraDoMes ? 0.4 : 1,
                    }}>
                      <div style={{
                        fontSize: '13px', fontWeight: ehHoje ? 700 : 400,
                        color: ehHoje ? 'var(--bg)' : 'var(--ink)',
                        marginBottom: '6px',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: ehHoje ? '26px' : 'auto', height: ehHoje ? '26px' : 'auto',
                        borderRadius: '50%', background: ehHoje ? 'var(--ink)' : 'transparent',
                      }}>
                        {diaNum}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {tarefasDoDia.slice(0, limite).map((a) => renderTarefaItem(a, 'small'))}
                        {financeirosDoDia.slice(0, Math.max(0, limite - tarefasDoDia.length)).map((e) => renderEventoFinanceiro(e, 'small'))}
                        {excesso > 0 && (
                          <div style={{ fontSize: '10px', color: 'var(--ink-muted)', paddingLeft: '4px' }}>
                            +{excesso} mais
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
