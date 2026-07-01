'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import SistemaNav from '@/components/SistemaNav'
import { createClient } from '@/lib/supabase-client'

const CAT_LABELS: { [key: string]: string } = {
  software_ia: 'Software / IA', marketing: 'Marketing', impostos: 'Impostos',
  infra: 'Infra', alimentacao: 'Alimentação', transporte: 'Transporte',
  saude: 'Saúde', pets: 'Pets', pessoal: 'Pessoal', emprestimo: 'Empréstimo', outros: 'Outros',
}

type Entrada = {
  id: string
  data: string
  descricao: string
  cliente: string
  valor: number
  valor_pago: number | null
  juros: number | null
  metodo: string | null
}

type Saida = {
  id: string
  data: string
  descricao: string
  categoria: string
  forma_pagamento: string
  valor: number
  conta_corrente: string | null
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function RelatorioPage() {
  const supabase = createClient()

  const hoje = new Date()
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

  const [dataInicio, setDataInicio] = useState(toISODate(primeiroDiaMes))
  const [dataFim, setDataFim] = useState(toISODate(hoje))
  const [loading, setLoading] = useState(false)
  const [buscou, setBuscou] = useState(false)
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [saidas, setSaidas] = useState<Saida[]>([])
  const [userEmail, setUserEmail] = useState<string | undefined>()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? undefined))
  }, [])

  async function buscar() {
    if (!dataInicio || !dataFim) return
    setLoading(true)
    try {
      const [{ data: pags }, { data: desps }] = await Promise.all([
        supabase
          .from('pagamentos')
          .select('id, data_pagamento, valor, valor_pago, juros, metodo_pagamento, cliente:clientes(nome), contrato:contratos(descricao)')
          .eq('status', 'pago')
          .gte('data_pagamento', dataInicio)
          .lte('data_pagamento', dataFim)
          .order('data_pagamento', { ascending: true }),
        supabase
          .from('despesas')
          .select('id, data_pagamento, descricao, categoria, forma_pagamento, valor, conta_corrente:contas_correntes(nome)')
          .eq('status', 'pago')
          .gte('data_pagamento', dataInicio)
          .lte('data_pagamento', dataFim)
          .order('data_pagamento', { ascending: true }),
      ])

      setEntradas(
        (pags || []).map((p: any) => ({
          id: p.id,
          data: p.data_pagamento,
          descricao: p.contrato?.descricao || 'Honorários',
          cliente: p.cliente?.nome || '—',
          valor: p.valor,
          valor_pago: p.valor_pago,
          juros: p.juros,
          metodo: p.metodo_pagamento,
        }))
      )

      setSaidas(
        (desps || []).map((d: any) => ({
          id: d.id,
          data: d.data_pagamento,
          descricao: d.descricao,
          categoria: d.categoria,
          forma_pagamento: d.forma_pagamento,
          valor: d.valor,
          conta_corrente: d.conta_corrente?.nome || null,
        }))
      )

      setBuscou(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const totalEntradas = entradas.reduce((s, e) => s + (e.valor_pago ?? e.valor), 0)
  const totalJuros = entradas.reduce((s, e) => s + (e.juros ?? 0), 0)
  const totalSaidas = saidas.reduce((s, d) => s + d.valor, 0)
  const saldo = totalEntradas - totalSaidas

  // Saídas agrupadas por categoria
  const saidasPorCat: { [k: string]: number } = {}
  saidas.forEach((d) => {
    saidasPorCat[d.categoria] = (saidasPorCat[d.categoria] || 0) + d.valor
  })
  const saidasCatOrdenadas = Object.entries(saidasPorCat).sort((a, b) => b[1] - a[1])

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '4px',
    fontSize: '14px', color: 'var(--ink)', background: 'var(--bg-card)', fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '6px', fontWeight: 500,
  }

  function fmtData(iso: string) {
    if (!iso) return '—'
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <Header userEmail={userEmail} />
      <SistemaNav />

      <div style={{ marginBottom: '28px' }}>
        <h1 className="font-serif" style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Relatório por Período
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>
          Todas as entradas e saídas pagas no período selecionado.
        </p>
      </div>

      {/* Filtro */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px',
        padding: '20px 24px', marginBottom: '24px',
        display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap',
      }}>
        <div>
          <label style={labelStyle}>Data início</label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Data fim</label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={inputStyle} />
        </div>

        {/* Atalhos rápidos */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'Este mês', fn: () => { const h = new Date(); setDataInicio(toISODate(new Date(h.getFullYear(), h.getMonth(), 1))); setDataFim(toISODate(h)) } },
            { label: 'Mês passado', fn: () => { const h = new Date(); const m = new Date(h.getFullYear(), h.getMonth() - 1, 1); const mf = new Date(h.getFullYear(), h.getMonth(), 0); setDataInicio(toISODate(m)); setDataFim(toISODate(mf)) } },
            { label: 'Este ano', fn: () => { const h = new Date(); setDataInicio(`${h.getFullYear()}-01-01`); setDataFim(toISODate(h)) } },
          ].map(({ label, fn }) => (
            <button key={label} onClick={fn} style={{
              padding: '8px 14px', borderRadius: '4px', border: '1px solid var(--line)',
              background: 'transparent', fontSize: '12px', color: 'var(--ink-muted)',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
            }}>
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={buscar}
          disabled={loading || !dataInicio || !dataFim}
          style={{
            padding: '10px 24px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--bg)',
            border: 'none', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', opacity: loading ? 0.5 : 1, marginLeft: 'auto',
          }}
        >
          {loading ? 'Buscando...' : 'Gerar relatório'}
        </button>
      </div>

      {buscou && (
        <>
          {/* Cards de resumo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', padding: '20px 24px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '8px' }}>
                Total recebido
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#2d6a4f', letterSpacing: '-0.02em' }}>
                {fmt(totalEntradas)}
              </div>
              {totalJuros > 0 && (
                <div style={{ fontSize: '12px', color: '#8a5a00', marginTop: '4px' }}>
                  inclui {fmt(totalJuros)} de juros
                </div>
              )}
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', padding: '20px 24px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '8px' }}>
                Total pago
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#c44536', letterSpacing: '-0.02em' }}>
                {fmt(totalSaidas)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                {saidas.length} despesa{saidas.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div style={{
              background: saldo >= 0 ? '#e8f5e9' : '#fce8e6',
              border: `1px solid ${saldo >= 0 ? '#a5d6a7' : '#f5c6c3'}`,
              borderRadius: '8px', padding: '20px 24px',
            }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '8px' }}>
                Saldo do período
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: saldo >= 0 ? '#2d6a4f' : '#c44536', letterSpacing: '-0.02em' }}>
                {fmt(saldo)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                {fmtData(dataInicio)} → {fmtData(dataFim)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* ENTRADAS */}
            <div>
              <h2 className="font-serif" style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', letterSpacing: '-0.01em' }}>
                Entradas <span style={{ fontSize: '14px', color: 'var(--ink-muted)', fontWeight: 400 }}>({entradas.length})</span>
              </h2>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
                {entradas.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '14px' }}>
                    Nenhum recebimento no período.
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--line)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600 }}>
                      <span>Data</span><span>Cliente</span><span>Valor</span>
                    </div>
                    {entradas.map((e) => (
                      <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>{fmtData(e.data)}</span>
                        <div>
                          <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 500 }}>{e.cliente}</div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{e.descricao}{e.metodo ? ` · ${e.metodo}` : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#2d6a4f' }}>{fmt(e.valor_pago ?? e.valor)}</div>
                          {e.juros && e.juros > 0 && (
                            <div style={{ fontSize: '11px', color: '#8a5a00' }}>+{fmt(e.juros)} juros</div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '12px', padding: '12px 16px', background: '#e8f5e9' }}>
                      <span /><span style={{ fontSize: '13px', fontWeight: 700, color: '#2d6a4f' }}>Total</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#2d6a4f' }}>{fmt(totalEntradas)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SAÍDAS */}
            <div>
              <h2 className="font-serif" style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', letterSpacing: '-0.01em' }}>
                Saídas <span style={{ fontSize: '14px', color: 'var(--ink-muted)', fontWeight: 400 }}>({saidas.length})</span>
              </h2>

              {/* Por categoria */}
              {saidasCatOrdenadas.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '10px' }}>
                    Por categoria
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {saidasCatOrdenadas.map(([cat, val]) => (
                      <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--ink)', fontWeight: 500 }}>{CAT_LABELS[cat] || cat}</span>
                            <span style={{ fontSize: '12px', color: '#c44536', fontWeight: 600 }}>{fmt(val)}</span>
                          </div>
                          <div style={{ height: '4px', background: 'var(--line)', borderRadius: '2px' }}>
                            <div style={{ height: '4px', background: '#c44536', borderRadius: '2px', width: `${(val / totalSaidas) * 100}%`, opacity: 0.6 }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
                {saidas.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '14px' }}>
                    Nenhuma despesa paga no período.
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--line)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600 }}>
                      <span>Data</span><span>Despesa</span><span>Valor</span>
                    </div>
                    {saidas.map((d) => (
                      <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>{fmtData(d.data)}</span>
                        <div>
                          <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 500 }}>{d.descricao}</div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                            {CAT_LABELS[d.categoria] || d.categoria}
                            {d.conta_corrente ? ` · ${d.conta_corrente}` : ''}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#c44536' }}>{fmt(d.valor)}</div>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '12px', padding: '12px 16px', background: '#fce8e6' }}>
                      <span /><span style={{ fontSize: '13px', fontWeight: 700, color: '#c44536' }}>Total</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#c44536' }}>{fmt(totalSaidas)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
