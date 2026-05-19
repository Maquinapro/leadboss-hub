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

type ClienteSimples = {
  id: string
  nome: string
}

const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
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

  const [form, setForm] = useState({
    cliente_id: '',
    tipo: 'tarefa',
    titulo: '',
    descricao: '',
    data_evento: '',
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
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
    setLoading(false)
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

  function navMes(delta: number) {
    const novo = new Date(mesAtual)
    novo.setMonth(novo.getMonth() + delta)
    setMesAtual(novo)
  }

  function voltaHoje() {
    setMesAtual(new Date())
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

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    color: 'var(--ink-soft)',
    marginBottom: '6px',
    fontWeight: 500,
  }

  return (
    <div style={{ marginTop: '28px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '16px' }}>
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
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px', overflow: 'hidden', overflowX: 'auto' as any }}>
          {/* Header do calendário */}
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

          {/* Dias da semana */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: '1px solid var(--line)' }}>
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

              return (
                <div key={i} style={{
                  minHeight: '100px',
                  padding: '8px',
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
                    width: ehHoje ? '26px' : 'auto',
                    height: ehHoje ? '26px' : 'auto',
                    borderRadius: '50%',
                    background: ehHoje ? 'var(--ink)' : 'transparent',
                  }}>
                    {diaNum}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {tarefasDoDia.slice(0, 4).map((a) => {
                      const hora = a.data_evento
                        ? new Date(a.data_evento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        : ''
                      const cor = tipoCores[a.tipo] || '#888'
                      return (
                        <div
                          key={a.id}
                          onClick={() => handleToggle(a.id)}
                          title={`${a.titulo} (${a.cliente_nome}) — clique pra concluir`}
                          style={{
                            fontSize: '11px', lineHeight: 1.3, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '2px 4px', borderRadius: '3px',
                            background: cor + '18',
                          }}
                        >
                          <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: cor, flexShrink: 0,
                          }} />
                          <span style={{ color: cor, fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {hora}
                          </span>
                          <span style={{
                            color: 'var(--ink)', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {a.titulo}
                          </span>
                        </div>
                      )
                    })}
                    {tarefasDoDia.length > 4 && (
                      <div style={{ fontSize: '10px', color: 'var(--ink-muted)', paddingLeft: '4px' }}>
                        +{tarefasDoDia.length - 4} mais
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
  )
}
