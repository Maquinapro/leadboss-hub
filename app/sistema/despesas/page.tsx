'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase-client'

type Cartao = {
  id: string
  nome: string
  bandeira: string | null
  ultimos_digitos: string | null
  cor: string
  ativo: boolean
}

type Despesa = {
  id: string
  descricao: string
  categoria: string
  origem: string
  forma_pagamento: string
  cartao_id: string | null
  valor_total: number
  parcelas: number
  mes_inicio: string
  status: string
  observacoes: string | null
  cartao?: { nome: string; cor: string } | null
}

const CATEGORIAS: { value: string; label: string }[] = [
  { value: 'software_ia', label: 'Software / IA' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'impostos', label: 'Impostos' },
  { value: 'moradia', label: 'Moradia' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'saude', label: 'Saúde' },
  { value: 'pets', label: 'Pets' },
  { value: 'pessoal', label: 'Pessoal' },
  { value: 'outros', label: 'Outros' },
]

const ORIGENS: { value: string; label: string }[] = [
  { value: 'agencia', label: 'Agência' },
  { value: 'gustavo', label: 'Pessoal - Gustavo' },
  { value: 'esposa', label: 'Pessoal - Esposa' },
  { value: 'casa', label: 'Casa' },
]

const FORMAS: { value: string; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'cartao', label: 'Cartão de crédito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'debito', label: 'Débito automático' },
  { value: 'dinheiro', label: 'Dinheiro' },
]

const MESES_NOMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const ORIGEM_CORES: { [key: string]: string } = {
  agencia: 'var(--green)',
  gustavo: '#2d6a8f',
  esposa: '#6a4c93',
  casa: '#8a5a00',
}

const CAT_LABELS: { [key: string]: string } = {
  software_ia: 'Software / IA', marketing: 'Marketing', impostos: 'Impostos',
  moradia: 'Moradia', alimentacao: 'Alimentação', saude: 'Saúde',
  pets: 'Pets', pessoal: 'Pessoal', outros: 'Outros',
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`
}

export default function DespesasPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userEmail, setUserEmail] = useState('')
  const [cartoes, setCartoes] = useState<Cartao[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'despesas' | 'cartoes'>('despesas')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1))

  const [form, setForm] = useState({
    descricao: '',
    categoria: 'software_ia',
    origem: 'agencia',
    forma_pagamento: 'pix',
    cartao_id: '',
    valor_total: '',
    parcelas: '1',
    mes_inicio: toISODate(new Date()),
    observacoes: '',
  })

  const [cartaoForm, setCartaoForm] = useState({
    nome: '',
    bandeira: '',
    ultimos_digitos: '',
    cor: '#2d6a8f',
  })
  const [savingCartao, setSavingCartao] = useState(false)
  const [showCartaoForm, setShowCartaoForm] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sistema/login'); return }
      setUserEmail(user.email || '')
      await loadData()
    }
    init()
  }, [mesAtual])

  async function loadData() {
    const mesStr = toISODate(mesAtual)
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()

    const [{ data: cartoesData }, { data: despesasData }] = await Promise.all([
      supabase.from('cartoes').select('*').eq('ativo', true).order('nome'),
      supabase.from('despesas').select('*, cartao:cartoes(nome, cor)').order('mes_inicio'),
    ])

    if (cartoesData) setCartoes(cartoesData)

    // Filtrar despesas que aparecem neste mês (parcelas distribuídas)
    if (despesasData) {
      const doMes = despesasData.filter((d: Despesa) => {
        const inicio = new Date(d.mes_inicio)
        const fimParcelas = new Date(inicio.getFullYear(), inicio.getMonth() + (d.parcelas - 1), 1)
        const mesAtualDate = new Date(ano, mes, 1)
        return inicio <= mesAtualDate && mesAtualDate <= fimParcelas
      })
      setDespesas(doMes as Despesa[])
    }
    setLoading(false)
  }

  async function handleAddDespesa() {
    if (!form.descricao || !form.valor_total) return
    setSaving(true)
    setError('')

    const { error: err } = await supabase.from('despesas').insert({
      descricao: form.descricao,
      categoria: form.categoria,
      origem: form.origem,
      forma_pagamento: form.forma_pagamento,
      cartao_id: form.forma_pagamento === 'cartao' && form.cartao_id ? form.cartao_id : null,
      valor_total: Number(form.valor_total),
      parcelas: Number(form.parcelas),
      mes_inicio: form.mes_inicio,
      observacoes: form.observacoes || null,
      status: 'pendente',
    })

    if (err) { setError('Erro: ' + err.message); setSaving(false); return }

    setForm({ descricao: '', categoria: 'software_ia', origem: 'agencia', forma_pagamento: 'pix', cartao_id: '', valor_total: '', parcelas: '1', mes_inicio: toISODate(new Date()), observacoes: '' })
    setShowForm(false)
    setSaving(false)
    await loadData()
  }

  async function handleAddCartao() {
    if (!cartaoForm.nome) return
    setSavingCartao(true)
    await supabase.from('cartoes').insert({
      nome: cartaoForm.nome,
      bandeira: cartaoForm.bandeira || null,
      ultimos_digitos: cartaoForm.ultimos_digitos || null,
      cor: cartaoForm.cor,
    })
    setCartaoForm({ nome: '', bandeira: '', ultimos_digitos: '', cor: '#2d6a8f' })
    setShowCartaoForm(false)
    setSavingCartao(false)
    const { data } = await supabase.from('cartoes').select('*').eq('ativo', true).order('nome')
    if (data) setCartoes(data)
  }

  async function handleToggleStatus(id: string, status: string) {
    const novo = status === 'pago' ? 'pendente' : 'pago'
    await supabase.from('despesas').update({ status: novo }).eq('id', id)
    await loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir essa despesa?')) return
    await supabase.from('despesas').delete().eq('id', id)
    await loadData()
  }

  async function handleDesativarCartao(id: string) {
    if (!confirm('Remover esse cartão?')) return
    await supabase.from('cartoes').update({ ativo: false }).eq('id', id)
    const { data } = await supabase.from('cartoes').select('*').eq('ativo', true).order('nome')
    if (data) setCartoes(data)
  }

  const stats = useMemo(() => {
    const total = despesas.reduce((s, d) => s + Number(d.valor_total) / d.parcelas, 0)
    const pago = despesas.filter(d => d.status === 'pago').reduce((s, d) => s + Number(d.valor_total) / d.parcelas, 0)
    const pendente = despesas.filter(d => d.status === 'pendente').reduce((s, d) => s + Number(d.valor_total) / d.parcelas, 0)
    const agencia = despesas.filter(d => d.origem === 'agencia').reduce((s, d) => s + Number(d.valor_total) / d.parcelas, 0)
    return { total, pago, pendente, agencia }
  }, [despesas])

  const formatMoeda = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--line)',
    borderRadius: '4px', fontSize: '14px', color: 'var(--ink)',
    background: 'var(--bg-card)', fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', color: 'var(--ink-soft)',
    marginBottom: '6px', fontWeight: 500,
  }

  const parcelaValor = form.valor_total && form.parcelas
    ? Number(form.valor_total) / Number(form.parcelas)
    : null

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <Header userEmail={userEmail} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Link href="/sistema" style={{ fontSize: '12px', color: 'var(--ink-muted)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
            ← Dashboard
          </Link>
          <h2 className="font-serif" style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '8px', lineHeight: 1 }}>
            Despesas
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { setActiveSection('despesas') }} style={{
            padding: '10px 18px', borderRadius: '4px', fontSize: '14px', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
            background: activeSection === 'despesas' ? 'var(--ink)' : 'transparent',
            color: activeSection === 'despesas' ? 'var(--bg)' : 'var(--ink-soft)',
            border: '1px solid var(--line)',
          }}>Despesas</button>
          <button onClick={() => setActiveSection('cartoes')} style={{
            padding: '10px 18px', borderRadius: '4px', fontSize: '14px', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
            background: activeSection === 'cartoes' ? 'var(--ink)' : 'transparent',
            color: activeSection === 'cartoes' ? 'var(--bg)' : 'var(--ink-soft)',
            border: '1px solid var(--line)',
          }}>Cartões</button>
        </div>
      </div>

      {activeSection === 'despesas' && (
        <div>
          {/* Navegação mês */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth()-1, 1))} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: '4px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', color: 'var(--ink-muted)' }}>‹</button>
            <span style={{ fontWeight: 600, fontSize: '16px', minWidth: '160px', textAlign: 'center' }}>
              {MESES_NOMES[mesAtual.getMonth()]} de {mesAtual.getFullYear()}
            </span>
            <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth()+1, 1))} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: '4px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', color: 'var(--ink-muted)' }}>›</button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1px', background: 'var(--line)', border: '1px solid var(--line)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
            {[
              { label: 'Total previsto', value: formatMoeda(stats.total), color: undefined },
              { label: 'Pago', value: formatMoeda(stats.pago), color: 'var(--green)' },
              { label: 'Pendente', value: formatMoeda(stats.pendente), color: '#8a5a00' },
              { label: 'Agência', value: formatMoeda(stats.agencia), color: 'var(--accent)' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'var(--bg-card)', padding: '18px 20px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '6px', fontWeight: 600 }}>{s.label}</div>
                <div className="font-serif" style={{ fontSize: 'clamp(16px, 3vw, 26px)', fontWeight: 600, color: s.color || 'var(--ink)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Botão nova despesa */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={() => setShowForm(!showForm)} style={{
              padding: '10px 20px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
              border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {showForm ? 'Cancelar' : '+ Nova despesa'}
            </button>
          </div>

          {/* Formulário nova despesa */}
          {showForm && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px', padding: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Descrição *</label>
                  <input type="text" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} style={inputStyle} placeholder="Ex: Hotmart Pages, Conta de luz..." />
                </div>
                <div>
                  <label style={labelStyle}>Categoria *</label>
                  <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} style={inputStyle}>
                    {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Origem *</label>
                  <select value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })} style={inputStyle}>
                    {ORIGENS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Valor total (R$) *</label>
                  <input type="number" step="0.01" value={form.valor_total} onChange={(e) => setForm({ ...form, valor_total: e.target.value })} style={inputStyle} placeholder="0,00" />
                </div>
                <div>
                  <label style={labelStyle}>Parcelas</label>
                  <input type="number" min="1" max="48" value={form.parcelas} onChange={(e) => setForm({ ...form, parcelas: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Mês inicial</label>
                  <input type="month" value={form.mes_inicio.substring(0, 7)} onChange={(e) => setForm({ ...form, mes_inicio: e.target.value + '-01' })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Forma de pagamento</label>
                  <select value={form.forma_pagamento} onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value, cartao_id: '' })} style={inputStyle}>
                    {FORMAS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>

              {form.forma_pagamento === 'cartao' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Cartão *</label>
                  <select value={form.cartao_id} onChange={(e) => setForm({ ...form, cartao_id: e.target.value })} style={inputStyle}>
                    <option value="">Selecione o cartão...</option>
                    {cartoes.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.ultimos_digitos ? ` ···· ${c.ultimos_digitos}` : ''}</option>)}
                  </select>
                </div>
              )}

              {parcelaValor && Number(form.parcelas) > 1 && (
                <div style={{ background: 'var(--line-soft)', borderRadius: '4px', padding: '10px 14px', marginBottom: '12px', fontSize: '13px', color: 'var(--ink-soft)' }}>
                  {form.parcelas}x de <strong style={{ color: 'var(--ink)' }}>{formatMoeda(parcelaValor)}</strong> — de {MESES_NOMES[new Date(form.mes_inicio).getMonth()]} até {MESES_NOMES[new Date(new Date(form.mes_inicio).getFullYear(), new Date(form.mes_inicio).getMonth() + Number(form.parcelas) - 1, 1).getMonth()]} de {new Date(new Date(form.mes_inicio).getFullYear(), new Date(form.mes_inicio).getMonth() + Number(form.parcelas) - 1, 1).getFullYear()}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Observações</label>
                <input type="text" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} style={inputStyle} placeholder="Opcional..." />
              </div>

              {error && <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleAddDespesa} disabled={saving || !form.descricao || !form.valor_total} style={{
                  padding: '10px 24px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                  border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  opacity: saving || !form.descricao || !form.valor_total ? 0.4 : 1,
                }}>
                  {saving ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          )}

          {/* Lista de despesas */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-muted)' }}>Carregando...</div>
          ) : despesas.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--line)', borderRadius: '6px', padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
              <div className="font-serif" style={{ fontSize: '48px', fontStyle: 'italic', color: 'var(--line)', marginBottom: '8px' }}>*</div>
              <p style={{ fontSize: '14px' }}>Nenhuma despesa neste mês.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {despesas.map((d) => {
                const valorMes = Number(d.valor_total) / d.parcelas
                const isPago = d.status === 'pago'
                return (
                  <div key={d.id} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px',
                    padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
                    opacity: isPago ? 0.7 : 1,
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)', textDecoration: isPago ? 'line-through' : 'none' }}>
                          {d.descricao}
                        </span>
                        {d.parcelas > 1 && (
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '3px', background: 'var(--line-soft)', color: 'var(--ink-muted)', fontWeight: 600 }}>
                            {d.parcelas}x
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: 'var(--ink-muted)' }}>
                        <span style={{ color: ORIGEM_CORES[d.origem] || 'var(--ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {ORIGENS.find(o => o.value === d.origem)?.label}
                        </span>
                        <span>·</span>
                        <span>{CAT_LABELS[d.categoria] || d.categoria}</span>
                        {d.cartao && (
                          <>
                            <span>·</span>
                            <span style={{ color: d.cartao.cor, fontWeight: 500 }}>{d.cartao.nome}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                      <div className="font-serif" style={{ fontSize: '16px', fontWeight: 600 }}>{formatMoeda(valorMes)}</div>
                      {d.parcelas > 1 && <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>{formatMoeda(Number(d.valor_total))} total</div>}
                    </div>
                    <button onClick={() => handleToggleStatus(d.id, d.status)} style={{
                      padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      background: isPago ? 'var(--line-soft)' : '#e0ebd9',
                      color: isPago ? 'var(--ink-muted)' : 'var(--green)',
                      border: 'none', whiteSpace: 'nowrap',
                    }}>
                      {isPago ? 'Pago ✓' : 'Marcar pago'}
                    </button>
                    <button onClick={() => handleDelete(d.id)} style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--ink-muted)', fontSize: '16px', padding: '4px',
                    }}>×</button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeSection === 'cartoes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={() => setShowCartaoForm(!showCartaoForm)} style={{
              padding: '10px 20px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
              border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {showCartaoForm ? 'Cancelar' : '+ Novo cartão'}
            </button>
          </div>

          {showCartaoForm && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px', padding: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Nome do cartão *</label>
                  <input type="text" value={cartaoForm.nome} onChange={(e) => setCartaoForm({ ...cartaoForm, nome: e.target.value })} style={inputStyle} placeholder="Ex: Nubank, Inter, C6..." />
                </div>
                <div>
                  <label style={labelStyle}>Bandeira</label>
                  <select value={cartaoForm.bandeira} onChange={(e) => setCartaoForm({ ...cartaoForm, bandeira: e.target.value })} style={inputStyle}>
                    <option value="">Selecione</option>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Elo">Elo</option>
                    <option value="Amex">Amex</option>
                    <option value="Hipercard">Hipercard</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Últimos 4 dígitos</label>
                  <input type="text" maxLength={4} value={cartaoForm.ultimos_digitos} onChange={(e) => setCartaoForm({ ...cartaoForm, ultimos_digitos: e.target.value })} style={inputStyle} placeholder="1234" />
                </div>
                <div>
                  <label style={labelStyle}>Cor</label>
                  <input type="color" value={cartaoForm.cor} onChange={(e) => setCartaoForm({ ...cartaoForm, cor: e.target.value })} style={{ ...inputStyle, padding: '6px', height: '42px', cursor: 'pointer' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleAddCartao} disabled={savingCartao || !cartaoForm.nome} style={{
                  padding: '10px 24px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
                  border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  opacity: savingCartao || !cartaoForm.nome ? 0.4 : 1,
                }}>
                  {savingCartao ? 'Salvando...' : 'Adicionar cartão'}
                </button>
              </div>
            </div>
          )}

          {cartoes.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--line)', borderRadius: '6px', padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
              <p style={{ fontSize: '14px' }}>Nenhum cartão cadastrado ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {cartoes.map((c) => (
                <div key={c.id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px',
                  padding: '20px', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: c.cor, marginBottom: '12px' }} />
                  <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--ink)', marginBottom: '4px' }}>{c.nome}</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
                    {c.bandeira && <span>{c.bandeira} </span>}
                    {c.ultimos_digitos && <span>···· {c.ultimos_digitos}</span>}
                  </div>
                  <button onClick={() => handleDesativarCartao(c.id)} style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--ink-muted)', fontSize: '16px', padding: '4px',
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
