'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

type Alerta = {
  id: string
  tipo: 'receber' | 'pagar'
  titulo: string
  valor: number
  data_vencimento: string
  diasAtraso: number
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function diasEntre(vencimento: string, hoje: string) {
  const v = new Date(vencimento + 'T00:00:00')
  const h = new Date(hoje + 'T00:00:00')
  return Math.round((h.getTime() - v.getTime()) / (1000 * 60 * 60 * 24))
}

function tagVencimento(dias: number) {
  if (dias > 0) return { label: `${dias}d atraso`, color: '#c44536', bg: '#fce8e6' }
  if (dias === 0) return { label: 'Hoje', color: '#8a5a00', bg: '#fff4e0' }
  return { label: 'Amanhã', color: '#2d6a4f', bg: '#e8f0e4' }
}

function Coluna({ titulo, href, alertas, cor }: {
  titulo: string
  href: string
  alertas: Alerta[]
  cor: string
}) {
  if (alertas.length === 0) return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cor, marginBottom: '8px' }}>
        {titulo}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Nada pendente</div>
    </div>
  )

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cor }}>
          {titulo}
        </div>
        <Link href={href} style={{ fontSize: '11px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
          Ver todos →
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {alertas.map(a => {
          const tag = tagVencimento(a.diasAtraso)
          return (
            <div key={a.id + a.tipo} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', color: 'var(--ink)',
              padding: '4px 0',
              borderBottom: '1px solid var(--line-soft)',
            }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px',
                background: tag.bg, color: tag.color, whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {tag.label}
              </span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.titulo}
              </span>
              <span style={{ fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {fmt(a.valor)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AlertasVencimento() {
  const supabase = createClient()
  const [receber, setReceber] = useState<Alerta[]>([])
  const [pagar, setPagar] = useState<Alerta[]>([])

  useEffect(() => {
    async function load() {
      const hoje = new Date()
      const hojeISO = toISODate(hoje)
      const amanha = toISODate(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1))

      const [{ data: pags }, { data: desps }] = await Promise.all([
        supabase
          .from('pagamentos')
          .select('id, data_vencimento, valor, cliente:clientes(nome)')
          .in('status', ['pendente', 'atrasado'])
          .lte('data_vencimento', amanha)
          .order('data_vencimento', { ascending: true }),
        supabase
          .from('despesas')
          .select('id, data_vencimento, valor_total, parcelas, descricao')
          .eq('status', 'pendente')
          .not('data_vencimento', 'is', null)
          .lte('data_vencimento', amanha)
          .order('data_vencimento', { ascending: true }),
      ])

      setReceber((pags || []).map(p => ({
        id: p.id,
        tipo: 'receber',
        titulo: (p.cliente as any)?.nome || 'Cliente',
        valor: Number(p.valor),
        data_vencimento: p.data_vencimento,
        diasAtraso: diasEntre(p.data_vencimento, hojeISO),
      })))

      setPagar((desps || []).filter(d => d.data_vencimento).map(d => ({
        id: d.id,
        tipo: 'pagar',
        titulo: d.descricao || 'Despesa',
        valor: Number(d.valor_total) / (d.parcelas || 1),
        data_vencimento: d.data_vencimento,
        diasAtraso: diasEntre(d.data_vencimento, hojeISO),
      })))
    }
    load()
  }, [])

  if (receber.length === 0 && pagar.length === 0) return null

  const totalVencidos = [...receber, ...pagar].filter(a => a.diasAtraso > 0).length

  return (
    <div style={{
      background: '#fffbf0',
      border: '1px solid #e8c84a55',
      borderLeft: '3px solid #e8a020',
      borderRadius: '8px',
      padding: '14px 20px',
      marginBottom: '24px',
    }}>
      {/* Título compacto */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e8a020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#92600a' }}>
          Alertas de vencimento
        </span>
        {totalVencidos > 0 && (
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px', background: '#fce8e6', color: '#c44536' }}>
            {totalVencidos} vencido{totalVencidos !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Duas colunas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Coluna titulo="A receber" href="/sistema/pagamentos" alertas={receber} cor="#2d6a4f" />
        <div style={{ width: '1px', background: 'var(--line)', margin: '0 -12px' }} />
        <Coluna titulo="A pagar" href="/sistema/despesas" alertas={pagar} cor="#c44536" />
      </div>
    </div>
  )
}
