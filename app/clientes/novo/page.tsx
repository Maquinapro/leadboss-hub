'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

type Plano = {
  id: string
  nome: string
  valor_padrao: number | null
  permite_valor_customizado: boolean
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

export default function NovoClientePage() {
  const router = useRouter()
  const supabase = createClient()

  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    data_entrada: new Date().toISOString().split('T')[0],
    dia_vencimento: '5',
    status: 'ativo',
    observacoes: '',
  })

  useEffect(() => {
    async function loadPlanos() {
      const { data } = await supabase
        .from('planos')
        .select('id, nome, valor_padrao, permite_valor_customizado')
        .order('valor_padrao', { ascending: true, nullsFirst: false })
      if (data) setPlanos(data)
    }
    loadPlanos()
  }, [])

  function handlePlanoChange(planoId: string) {
    const plano = planos.find((p) => p.id === planoId)
    setForm((f) => ({
      ...f,
      plano_id: planoId,
      valor_mensal:
        plano && plano.valor_padrao && !plano.permite_valor_customizado
          ? String(plano.valor_padrao)
          : f.valor_mensal,
    }))
  }

  function togglePlataforma(plat: string) {
    setForm((f) => ({
      ...f,
      plataformas: f.plataformas.includes(plat)
        ? f.plataformas.filter((p) => p !== plat)
        : [...f.plataformas, plat],
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: insertError } = await supabase.from('clientes').insert({
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
      observacoes: form.observacoes || null,
    })

    if (insertError) {
      setError('Erro ao cadastrar: ' + insertError.message)
      setLoading(false)
      return
    }

    router.push('/clientes')
    router.refresh()
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
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/clientes"
          style={{
            fontSize: '12px',
            color: 'var(--ink-muted)',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}
        >
          ← Clientes
        </Link>
        <h2
          className="font-serif"
          style={{
            fontSize: '36px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            marginTop: '8px',
            lineHeight: 1,
          }}
        >
          Novo cliente
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--line)',
          borderRadius: '6px',
          padding: '28px',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Nome do cliente *</label>
          <input
            type="text"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            style={inputStyle}
            placeholder="Ex: Clínica Sorriso Atibaia"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Segmento *</label>
          <select
            value={form.segmento}
            onChange={(e) => setForm({ ...form, segmento: e.target.value })}
            style={inputStyle}
          >
            {SEGMENTOS_SUGERIDOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Telefone</label>
            <input
              type="text"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              style={inputStyle}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Responsável de contato</label>
          <input
            type="text"
            value={form.responsavel_contato}
            onChange={(e) => setForm({ ...form, responsavel_contato: e.target.value })}
            style={inputStyle}
            placeholder="Nome da pessoa que você fala"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Plano *</label>
            <select
              required
              value={form.plano_id}
              onChange={(e) => handlePlanoChange(e.target.value)}
              style={inputStyle}
            >
              <option value="">Selecione...</option>
              {planos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                  {p.valor_padrao ? ` — R$ ${p.valor_padrao}` : ' — valor livre'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Valor mensal (R$) *</label>
            <input
              type="number"
              required
              step="0.01"
              value={form.valor_mensal}
              onChange={(e) => setForm({ ...form, valor_mensal: e.target.value })}
              style={inputStyle}
              placeholder="0.00"
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Verba de mídia mensal (R$)</label>
          <input
            type="number"
            step="0.01"
            value={form.verba_midia}
            onChange={(e) => setForm({ ...form, verba_midia: e.target.value })}
            style={inputStyle}
            placeholder="0.00"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Plataformas contratadas</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PLATAFORMAS_DISPONIVEIS.map((p) => {
              const ativo = form.plataformas.includes(p)
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => togglePlataforma(p)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: ativo ? 'var(--ink)' : 'var(--line)',
                    background: ativo ? 'var(--ink)' : 'transparent',
                    color: ativo ? 'var(--bg)' : 'var(--ink-soft)',
                    fontFamily: 'inherit',
                  }}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Data de entrada *</label>
            <input
              type="date"
              required
              value={form.data_entrada}
              onChange={(e) => setForm({ ...form, data_entrada: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Dia de vencimento *</label>
            <select
              required
              value={form.dia_vencimento}
              onChange={(e) => setForm({ ...form, dia_vencimento: e.target.value })}
              style={inputStyle}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>Dia {d}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status *</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={inputStyle}
            >
              <option value="prospeccao">Prospecção</option>
              <option value="ativo">Ativo</option>
              <option value="pausado">Pausado</option>
              <option value="encerrado">Encerrado</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Observações</label>
          <textarea
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder="Anotações sobre o cliente, contrato, peculiaridades..."
          />
        </div>

        {error && (
          <div
            style={{
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              padding: '12px 14px',
              borderRadius: '4px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Link
            href="/clientes"
            style={{
              padding: '12px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--ink-soft)',
              border: '1px solid var(--line)',
            }}
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '4px',
              background: 'var(--ink)',
              color: 'var(--bg)',
              border: 'none',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Salvando...' : 'Cadastrar cliente'}
          </button>
        </div>
      </form>
    </div>
  )
}