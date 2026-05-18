'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase-client'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [configId, setConfigId] = useState<string | null>(null)

  const [form, setForm] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    whatsapp: '',
    email: '',
    site: '',
    chave_pix: '',
    banco: '',
    agencia: '',
    conta: '',
    observacoes_recibo: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/sistema/login')
        return
      }
      setUserEmail(user.email || '')

      const { data } = await supabase
        .from('configuracoes')
        .select('*')
        .limit(1)
        .single()

      if (data) {
        setConfigId(data.id)
        setForm({
          razao_social: data.razao_social || '',
          nome_fantasia: data.nome_fantasia || '',
          cnpj: data.cnpj || '',
          inscricao_estadual: data.inscricao_estadual || '',
          endereco: data.endereco || '',
          numero: data.numero || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          cep: data.cep || '',
          telefone: data.telefone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          site: data.site || '',
          chave_pix: data.chave_pix || '',
          banco: data.banco || '',
          agencia: data.agencia || '',
          conta: data.conta || '',
          observacoes_recibo: data.observacoes_recibo || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)

    const dados = {
      razao_social: form.razao_social || null,
      nome_fantasia: form.nome_fantasia || null,
      cnpj: form.cnpj || null,
      inscricao_estadual: form.inscricao_estadual || null,
      endereco: form.endereco || null,
      numero: form.numero || null,
      complemento: form.complemento || null,
      bairro: form.bairro || null,
      cidade: form.cidade || null,
      estado: form.estado || null,
      cep: form.cep || null,
      telefone: form.telefone || null,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      site: form.site || null,
      chave_pix: form.chave_pix || null,
      banco: form.banco || null,
      agencia: form.agencia || null,
      conta: form.conta || null,
      observacoes_recibo: form.observacoes_recibo || null,
    }

    const resp = configId
      ? await supabase.from('configuracoes').update(dados).eq('id', configId)
      : await supabase.from('configuracoes').insert(dados)

    if (resp.error) {
      setError('Erro: ' + resp.error.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)
    setTimeout(() => setSuccess(false), 3000)
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

  const sectionTitleStyle = {
    fontSize: '11px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: 'var(--ink-muted)',
    fontWeight: 600,
    marginTop: '28px',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--line-soft)',
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
        Carregando...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <Header userEmail={userEmail} />

      <div style={{ marginBottom: '24px' }}>
        <Link href="/sistema" style={{ fontSize: '12px', color: 'var(--ink-muted)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
          ← Dashboard
        </Link>
        <h2 className="font-serif" style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '8px', lineHeight: 1 }}>
          Configurações
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '8px' }}>
          Dados da agência usados em recibos, cobranças e relatórios.
        </p>
      </div>

      <form onSubmit={handleSave} style={{
        background: 'var(--bg-card)', border: '1px solid var(--line)',
        borderRadius: '6px', padding: '28px',
      }}>
        <div style={{ ...sectionTitleStyle, marginTop: 0 }}>Identificação</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Razão social</label>
            <input type="text" value={form.razao_social}
              onChange={(e) => setForm({ ...form, razao_social: e.target.value })}
              style={inputStyle} placeholder="Leadboss Marketing Digital LTDA" />
          </div>
          <div>
            <label style={labelStyle}>Nome fantasia</label>
            <input type="text" value={form.nome_fantasia}
              onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })}
              style={inputStyle} placeholder="Leadboss" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>CNPJ</label>
            <input type="text" value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
              style={inputStyle} placeholder="00.000.000/0000-00" />
          </div>
          <div>
            <label style={labelStyle}>Inscrição estadual</label>
            <input type="text" value={form.inscricao_estadual}
              onChange={(e) => setForm({ ...form, inscricao_estadual: e.target.value })}
              style={inputStyle} placeholder="Isento ou número" />
          </div>
        </div>

        <div style={sectionTitleStyle}>Endereço</div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Endereço</label>
            <input type="text" value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              style={inputStyle} placeholder="Rua, Avenida..." />
          </div>
          <div>
            <label style={labelStyle}>Número</label>
            <input type="text" value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
              style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Complemento</label>
            <input type="text" value={form.complemento}
              onChange={(e) => setForm({ ...form, complemento: e.target.value })}
              style={inputStyle} placeholder="Sala, andar..." />
          </div>
          <div>
            <label style={labelStyle}>Bairro</label>
            <input type="text" value={form.bairro}
              onChange={(e) => setForm({ ...form, bairro: e.target.value })}
              style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Cidade</label>
            <input type="text" value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              style={inputStyle} placeholder="Atibaia" />
          </div>
          <div>
            <label style={labelStyle}>Estado</label>
            <input type="text" maxLength={2} value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })}
              style={inputStyle} placeholder="SP" />
          </div>
          <div>
            <label style={labelStyle}>CEP</label>
            <input type="text" value={form.cep}
              onChange={(e) => setForm({ ...form, cep: e.target.value })}
              style={inputStyle} placeholder="00000-000" />
          </div>
        </div>

        <div style={sectionTitleStyle}>Contato</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Telefone</label>
            <input type="text" value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              style={inputStyle} placeholder="(11) 0000-0000" />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input type="text" value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              style={inputStyle} placeholder="(11) 99999-9999" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>E-mail comercial</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle} placeholder="contato@leadboss.com.br" />
          </div>
          <div>
            <label style={labelStyle}>Site</label>
            <input type="text" value={form.site}
              onChange={(e) => setForm({ ...form, site: e.target.value })}
              style={inputStyle} placeholder="leadboss.com.br" />
          </div>
        </div>

        <div style={sectionTitleStyle}>Dados para recebimento</div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Chave PIX</label>
          <input type="text" value={form.chave_pix}
            onChange={(e) => setForm({ ...form, chave_pix: e.target.value })}
            style={inputStyle} placeholder="CNPJ, e-mail, celular ou aleatória" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Banco</label>
            <input type="text" value={form.banco}
              onChange={(e) => setForm({ ...form, banco: e.target.value })}
              style={inputStyle} placeholder="Ex: Itaú, Inter, Nubank..." />
          </div>
          <div>
            <label style={labelStyle}>Agência</label>
            <input type="text" value={form.agencia}
              onChange={(e) => setForm({ ...form, agencia: e.target.value })}
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Conta</label>
            <input type="text" value={form.conta}
              onChange={(e) => setForm({ ...form, conta: e.target.value })}
              style={inputStyle} />
          </div>
        </div>

        <div style={sectionTitleStyle}>Texto adicional nos recibos</div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Observações</label>
          <textarea value={form.observacoes_recibo}
            onChange={(e) => setForm({ ...form, observacoes_recibo: e.target.value })}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder="Texto que aparecerá em todos os recibos (ex: 'Agradecemos pela parceria. Pagamento referente à gestão de tráfego.')" />
        </div>

        {error && (
          <div style={{
            background: 'var(--accent-soft)', color: 'var(--accent)',
            padding: '12px 14px', borderRadius: '4px', fontSize: '13px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#e0ebd9', color: 'var(--green)',
            padding: '12px 14px', borderRadius: '4px', fontSize: '13px',
            marginBottom: '16px',
          }}>
            ✓ Configurações salvas com sucesso!
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={saving} style={{
            padding: '12px 24px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
            border: 'none', fontSize: '14px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1, fontFamily: 'inherit',
          }}>
            {saving ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </div>
      </form>
    </div>
  )
}