'use client'

import { useState } from 'react'

type Props = {
  totalClientesAtivos: number
  receitaPrevista: number
  recebido: number
  inadimplentes: number
}

export default function DashboardStats({ totalClientesAtivos, receitaPrevista, recebido, inadimplentes }: Props) {
  const [visivel, setVisivel] = useState(false)

  const formatMoeda = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const mascarar = (valor: string) => '••••'

  return (
    <div style={{ position: 'relative', marginBottom: '28px' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1px',
        background: 'var(--line)', border: '1px solid var(--line)',
        borderRadius: '4px', overflow: 'hidden',
      }}>
        <StatCard label="Clientes ativos" value={String(totalClientesAtivos)} sub="contas no mês" visivel={visivel} />
        <StatCard label="Receita prevista" value={formatMoeda(receitaPrevista)} sub="este mês" visivel={visivel} />
        <StatCard label="Recebido" value={formatMoeda(recebido)} sub="já entrou no caixa" color="var(--green)" visivel={visivel} />
        <StatCard label="Inadimplentes" value={String(inadimplentes)} sub="faturas atrasadas" color={inadimplentes > 0 ? 'var(--accent)' : undefined} visivel={visivel} />
      </div>

      {/* Botão olhinho */}
      <button
        onClick={() => setVisivel(!visivel)}
        title={visivel ? 'Ocultar valores' : 'Mostrar valores'}
        style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'transparent', border: 'none',
          cursor: 'pointer', padding: '4px',
          color: 'var(--ink-muted)', fontSize: '16px',
          lineHeight: 1,
        }}
      >
        {visivel ? '👁' : '🙈'}
      </button>
    </div>
  )
}

function StatCard({
  label, value, sub, color, visivel
}: {
  label: string
  value: string
  sub: string
  color?: string
  visivel: boolean
}) {
  return (
    <div style={{ background: 'var(--bg-card)', padding: '20px 22px' }}>
      <div style={{
        fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--ink-muted)', marginBottom: '8px', fontWeight: 600,
      }}>
        {label}
      </div>
      <div className="font-serif" style={{
        fontSize: '32px', fontWeight: 600, lineHeight: 1,
        letterSpacing: '-0.02em', color: color || 'var(--ink)',
        filter: visivel ? 'none' : 'blur(8px)',
        userSelect: visivel ? 'auto' : 'none',
        transition: 'filter 0.2s ease',
      }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '6px' }}>
        {sub}
      </div>
    </div>
  )
}
