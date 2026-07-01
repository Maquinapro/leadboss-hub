'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
type Dados = {
  // Contas a receber
  receberTotal: number
  receberRecebido: number
  receberPendente: number
  receberAtrasado: number
  jurosRecebidos: number
  // Contas a pagar
  pagarTotal: number
  pagarPago: number
  pagarPendente: number
  pagarAtrasado: number
}

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}


export default function PanoramaMes() {
  const supabase = createClient()
  const [dados, setDados] = useState<Dados | null>(null)

  useEffect(() => {
    async function load() {
      const hoje = new Date()
      const hojeISO = hoje.toISOString().split('T')[0]
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1).toISOString().split('T')[0]

      // Contas a receber do mês
      const { data: pags } = await supabase
        .from('pagamentos')
        .select('valor, valor_pago, juros, status, data_vencimento')
        .gte('mes_referencia', inicioMes)
        .lt('mes_referencia', fimMes)

      // Contas a pagar do mês
      const { data: desps } = await supabase
        .from('despesas')
        .select('valor_total, parcelas, status, data_vencimento')
        .gte('mes_inicio', inicioMes)
        .lt('mes_inicio', fimMes)

      const pagsArr = pags || []
      const despsArr = desps || []

      // Receber
      const receberRecebido = pagsArr.filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.valor_pago ?? p.valor), 0)
      const jurosRecebidos = pagsArr.filter(p => p.status === 'pago' && p.juros).reduce((s, p) => s + Number(p.juros), 0)
      const receberAtrasado = pagsArr.filter(p => p.status === 'atrasado' || (p.status === 'pendente' && p.data_vencimento && p.data_vencimento < hojeISO)).reduce((s, p) => s + Number(p.valor), 0)
      const receberPendente = pagsArr.filter(p => p.status === 'pendente' && (!p.data_vencimento || p.data_vencimento >= hojeISO)).reduce((s, p) => s + Number(p.valor), 0)
      const receberTotal = receberRecebido + receberAtrasado + receberPendente

      // Pagar
      const valorMes = (d: { valor_total: number; parcelas: number }) => Number(d.valor_total) / (d.parcelas || 1)
      const pagarPago = despsArr.filter(d => d.status === 'pago').reduce((s, d) => s + valorMes(d), 0)
      const pagarAtrasado = despsArr.filter(d => d.status !== 'pago' && d.data_vencimento && d.data_vencimento < hojeISO).reduce((s, d) => s + valorMes(d), 0)
      const pagarPendente = despsArr.filter(d => d.status !== 'pago' && (!d.data_vencimento || d.data_vencimento >= hojeISO)).reduce((s, d) => s + valorMes(d), 0)
      const pagarTotal = pagarPago + pagarAtrasado + pagarPendente

      setDados({ receberTotal, receberRecebido, receberPendente, receberAtrasado, jurosRecebidos, pagarTotal, pagarPago, pagarPendente, pagarAtrasado })
    }
    load()
  }, [])

  if (!dados) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '13px' }}>Carregando panorama...</div>

  const saldo = dados.receberRecebido - dados.pagarPago
  const isPositivo = saldo >= 0

  const cardStyle = (cor: string, bg: string): React.CSSProperties => ({
    background: bg,
    border: `1px solid ${cor}22`,
    borderRadius: '8px',
    padding: '16px 18px',
  })

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontWeight: 700,
    marginBottom: '3px',
  }

  const valorStyle: React.CSSProperties = {
    fontFamily: 'Fraunces, serif',
    fontSize: '20px',
    fontWeight: 600,
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '2px' }}>
            Panorama do mês
          </div>
          <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Visão consolidada de entradas e saídas</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '2px' }}>Saldo realizado</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 700, color: isPositivo ? 'var(--green)' : 'var(--accent)' }}>
            {isPositivo ? '+' : ''}{fmtMoeda(saldo)}
          </div>
        </div>
      </div>

      {/* Grid de cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>

        {/* Contas a Receber */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--green)', marginBottom: '2px' }}>
            Contas a Receber
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div style={cardStyle('#4a6b3a', '#e8f0e4')}>
              <div style={{ ...labelStyle, color: 'var(--green)' }}>Recebido</div>
              <div style={{ ...valorStyle, color: 'var(--green)' }}>{fmtMoeda(dados.receberRecebido)}</div>
            </div>
            <div style={cardStyle('#8a5a00', '#fff4e0')}>
              <div style={{ ...labelStyle, color: '#8a5a00' }}>Pendente</div>
              <div style={{ ...valorStyle, color: '#8a5a00' }}>{fmtMoeda(dados.receberPendente)}</div>
            </div>
            <div style={cardStyle('#c8472b', '#f5d6cd')}>
              <div style={{ ...labelStyle, color: 'var(--accent)' }}>Atrasado</div>
              <div style={{ ...valorStyle, color: 'var(--accent)' }}>{fmtMoeda(dados.receberAtrasado)}</div>
            </div>
          </div>
          {/* Barra de progresso */}
          {dados.receberTotal > 0 && (
            <div style={{ height: '6px', borderRadius: '3px', background: 'var(--line-soft)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(dados.receberRecebido / dados.receberTotal) * 100}%`, background: 'var(--green)', transition: 'width 0.4s' }} />
              <div style={{ width: `${(dados.receberPendente / dados.receberTotal) * 100}%`, background: '#f0c060' }} />
              <div style={{ width: `${(dados.receberAtrasado / dados.receberTotal) * 100}%`, background: 'var(--accent)' }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Total previsto: <strong style={{ color: 'var(--ink)' }}>{fmtMoeda(dados.receberTotal)}</strong></div>
            {dados.jurosRecebidos > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', background: '#fff4e0', border: '1px solid #f0c060', borderRadius: '4px', padding: '3px 8px' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8a5a00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ color: '#8a5a00', fontWeight: 600 }}>{fmtMoeda(dados.jurosRecebidos)} em juros</span>
              </div>
            )}
          </div>
        </div>

        {/* Contas a Pagar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent)', marginBottom: '2px' }}>
            Contas a Pagar
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div style={cardStyle('#4a6b3a', '#e8f0e4')}>
              <div style={{ ...labelStyle, color: 'var(--green)' }}>Pago</div>
              <div style={{ ...valorStyle, color: 'var(--green)' }}>{fmtMoeda(dados.pagarPago)}</div>
            </div>
            <div style={cardStyle('#8a5a00', '#fff4e0')}>
              <div style={{ ...labelStyle, color: '#8a5a00' }}>Pendente</div>
              <div style={{ ...valorStyle, color: '#8a5a00' }}>{fmtMoeda(dados.pagarPendente)}</div>
            </div>
            <div style={cardStyle('#c8472b', '#f5d6cd')}>
              <div style={{ ...labelStyle, color: 'var(--accent)' }}>Atrasado</div>
              <div style={{ ...valorStyle, color: 'var(--accent)' }}>{fmtMoeda(dados.pagarAtrasado)}</div>
            </div>
          </div>
          {dados.pagarTotal > 0 && (
            <div style={{ height: '6px', borderRadius: '3px', background: 'var(--line-soft)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(dados.pagarPago / dados.pagarTotal) * 100}%`, background: 'var(--green)', transition: 'width 0.4s' }} />
              <div style={{ width: `${(dados.pagarPendente / dados.pagarTotal) * 100}%`, background: '#f0c060' }} />
              <div style={{ width: `${(dados.pagarAtrasado / dados.pagarTotal) * 100}%`, background: 'var(--accent)' }} />
            </div>
          )}
          <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Total do mês: <strong style={{ color: 'var(--ink)' }}>{fmtMoeda(dados.pagarTotal)}</strong></div>
        </div>
      </div>

    </div>
  )
}
