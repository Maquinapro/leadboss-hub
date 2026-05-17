'use client'

import { useState, useEffect, FormEvent } from 'react'
import { createClient } from '@/lib/supabase-client'

type Atividade = {
  id: string
  tipo: string
  titulo: string
  descricao: string | null
  data_evento: string
  created_at: string
}

const tipoConfig: { [key: string]: { label: string; color: string; bg: string } } = {
  reuniao: { label: 'Reunião', color: 'var(--blue)', bg: '#e3eef7' },
  relatorio: { label: 'Relatório', color: 'var(--green)', bg: '#e0ebd9' },
  criativo: { label: 'Criativo', color: 'var(--gold)', bg: '#f0e9d8' },
  observacao: { label: 'Observação', color: 'var(--ink-soft)', bg: 'var(--line-soft)' },
  cobranca: { label: 'Cobrança', color: 'var(--accent)', bg: 'var(--accent-soft)' },
  outro: { label: 'Outro', color: 'var(--ink-muted)', bg: 'var(--line-soft)' },
}

export default function ClienteHistorico({ clienteId }: { clienteId: string }) {
  const supabase = createClient()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    tipo: 'observacao',
    titulo: '',
    descricao: '',
    data_evento: new Date().toISOString().slice(0, 16),
  })

  async function load() {
    const { data } = await supabase
      .from('atividades')
      .select('id, tipo, titulo, descricao, data_evento, created_at')
      .eq('cliente_id', clienteId)
      .order('data_evento', { ascending: false })

    if (data) setAtividades(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [clienteId])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const { error: insertError } = await supabase.from('atividades').insert({
      cliente_id: clienteId,
      tipo: form.tipo,
      titulo: form.titulo,
      descricao: form.descricao || null,
      data_evento: new Date(form.data_evento).toISOString(),
    })

    if (insertError) {
      setError('Erro ao salvar: ' + insertError.message)
      setSaving(false)
      return
    }

    setForm({
      tipo: 'observacao',
      titulo: '',
      descricao: '',
      data_evento: new Date().toISOString().slice(0, 16),
    })
    setModalOpen(false)
    setSaving(false)
    await load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir essa atividade?')) return
    const { error: delError } = await supabase.from('atividades').delete().eq('id', id)
    if (delError) {
      alert('Erro ao excluir: ' + delError.message)
      return
    }
    await load()
  }

  const formatDateTime = (dt: string) => {
    const d = new Date(dt)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
    <div>
      {/* Botão de adicionar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: '10px 18px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
            border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + Nova atividade
        </button>
      </div>

      {/* Timeline */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-muted)' }}>
          Carregando...
        </div>
      ) : atividades.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px dashed var(--line)', borderRadius: '6px',
          padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)',
        }}>
          <div className="font-serif" style={{ fontSize: '48px', fontStyle: 'italic', color: 'var(--line)', marginBottom: '8px' }}>*</div>
          <h3 className="font-serif" style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '8px', fontWeight: 600 }}>
            Sem atividades ainda
          </h3>
          <p style={{ fontSize: '14px' }}>
            Registre reuniões, relatórios enviados, observações e tudo que for relevante sobre esse cliente.
          </p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '24px' }}>
          {/* Linha vertical */}
          <div style={{
            position: 'absolute', left: '7px', top: '8px', bottom: '8px',
            width: '2px', background: 'var(--line)',
          }} />

          {atividades.map((a) => {
            const cfg = tipoConfig[a.tipo] || tipoConfig.outro
            return (
              <div key={a.id} style={{ position: 'relative', marginBottom: '20px' }}>
                {/* Bolinha */}
                <div style={{
                  position: 'absolute', left: '-22px', top: '12px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: cfg.bg, border: '2px solid var(--bg)',
                  boxShadow: `0 0 0 2px ${cfg.color}`,
                }} />

                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--line)',
                  borderRadius: '6px', padding: '16px 18px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
                          padding: '3px 8px', borderRadius: '3px', fontWeight: 600,
                          background: cfg.bg, color: cfg.color,
                        }}>
                          {cfg.label}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                          {formatDateTime(a.data_evento)}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>
                        {a.titulo}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleDelete(a.id)}
                      title="Excluir"
                      style={{
                        background: 'transparent', border: 'none', color: 'var(--ink-muted)',
                        cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '2px 6px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                  {a.descricao && (
                    <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5, marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                      {a.descricao}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.5)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            zIndex: 100, padding: '40px 20px', overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', borderRadius: '8px', width: '100%', maxWidth: '560px',
              padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative',
            }}
          >
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: 'absolute', top: '14px', right: '14px',
                background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer',
                color: 'var(--ink-muted)', lineHeight: 1,
              }}
            >
              ×
            </button>

            <h3 className="font-serif" style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '20px' }}>
              Nova atividade
            </h3>

            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Tipo *</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} style={inputStyle}>
                  <option value="reuniao">Reunião</option>
                  <option value="relatorio">Relatório</option>
                  <option value="criativo">Criativo</option>
                  <option value="observacao">Observação</option>
                  <option value="cobranca">Cobrança</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Título *</label>
                <input
                  type="text" required value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  style={inputStyle}
                  placeholder="Ex: Reunião de alinhamento mensal"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Data e hora *</label>
                <input
                  type="datetime-local" required value={form.data_evento}
                  onChange={(e) => setForm({ ...form, data_evento: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                  placeholder="Detalhes da atividade, pontos discutidos, decisões tomadas..."
                />
              </div>

              {error && (
                <div style={{
                  background: 'var(--accent-soft)', color: 'var(--accent)',
                  padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px',
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{
                  padding: '10px 18px', borderRadius: '4px', fontSize: '14px', fontWeight: 500,
                  color: 'var(--ink-soft)', border: '1px solid var(--line)', background: 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={{
                  padding: '10px 20px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                  border: 'none', fontSize: '14px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1, fontFamily: 'inherit',
                }}>
                  {saving ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}