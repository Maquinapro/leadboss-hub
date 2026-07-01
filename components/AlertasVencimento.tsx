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
  diasAtraso: number // 0 = vence hoje, -1 = amanhã, >0 = atrasado há X dias
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

export default function AlertasVencimento() {
  const supabase = createClient()
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    async function load() {
      const hoje = new Date()
      const hojeISO = toISODate(hoje)
      const amanha = toISODate(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1))
      // Busca vencidos + vence amanhã
      const limite = amanha

      const [{ data: pags }, { data: desps }] = await Promise.all([
        supabase
          .from('pagamentos')
          .select('id, data_vencimento, valor, cliente:clientes(nome)')
          .in('status', ['pendente', 'atrasado'])
          .lte('data_vencimento', limite)
          .order('data_vencimento', { ascending: true }),
        supabase
          .from('despesas')
          .select('id, data_vencimento, valor_total, parcelas, descricao')
          .eq('status', 'pendente')
          .not('data_vencimento', 'is', null)
          .lte('data_vencimento', limite)
          .order('data_vencimento', { ascending: true }),
      ])

      const lista: Alerta[] = []

      for (const p of pags || []) {
        if (!p.data_vencimento) continue
        lista.push({
          id: p.id,
          tipo: 'receber',
          titulo: (p.cliente as any)?.nome || 'Cliente',
          valor: Number(p.valor),
          data_vencimento: p.data_vencimento,
          diasAtraso: diasEntre(p.data_vencimento, hojeISO),
        })
      }

      for (const d of desps || []) {
        if (!d.data_vencimento) continue
        lista.push({
          id: d.id,
          tipo: 'pagar',
          titulo: d.descricao || 'Despesa',
          valor: Number(d.valor_total) / (d.parcelas || 1),
          data_vencimento: d.data_vencimento,
          diasAtraso: diasEntre(d.data_vencimento, hojeISO),
        })
      }

      // Ordena: mais atrasados primeiro
      lista.sort((a, b) => b.diasAtraso - a.diasAtraso)
      setAlertas(lista)
    }
    load()
  }, [])

  if (alertas.length === 0) return null

  const vencidos = alertas.filter(a => a.diasAtraso > 0)
  const hoje = alertas.filter(a => a.diasAtraso === 0)
  const amanha = alertas.filter(a => a.diasAtraso < 0)

  const totalReceber = alertas.filter(a => a.tipo === 'receber' && a.diasAtraso > 0).reduce((s, a) => s + a.valor, 0)
  const totalPagar = alertas.filter(a => a.tipo === 'pagar' && a.diasAtraso > 0).reduce((s, a) => s + a.valor, 0)

  return (
    <div style={{
      background: '#fffbf0',
      border: '1px solid #e8c84a44',
      borderLeft: '4px solid #e8a020',
      borderRadius: '8px',
      marginBottom: '24px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e8a020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#92600a' }}>
            {alertas.length} alerta{alertas.length !== 1 ? 's' : ''} de vencimento
          </span>
          {vencidos.length > 0 && (
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px',
              background: '#fce8e6', color: '#c44536',
            }}>
              {vencidos.length} vencido{vencidos.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92600a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ padding: '0 20px 16px' }}>

          {/* Resumo de valores vencidos */}
          {vencidos.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
              {totalReceber > 0 && (
                <span style={{ fontSize: '12px', color: '#c44536', fontWeight: 600 }}>
                  A receber em atraso: {fmt(totalReceber)}
                </span>
              )}
              {totalReceber > 0 && totalPagar > 0 && <span style={{ color: '#e8c84a' }}>·</span>}
              {totalPagar > 0 && (
                <span style={{ fontSize: '12px', color: '#c44536', fontWeight: 600 }}>
                  A pagar em atraso: {fmt(totalPagar)}
                </span>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {vencidos.length > 0 && <Grupo label="Vencido" alertas={vencidos} />}
            {hoje.length > 0 && <Grupo label="Vence hoje" alertas={hoje} />}
            {amanha.length > 0 && <Grupo label="Vence amanhã" alertas={amanha} />}
          </div>
        </div>
      )}
    </div>
  )
}

function Grupo({ label, alertas }: { label: string; alertas: Alerta[] }) {
  const isVencido = label === 'Vencido'
  const isHoje = label === 'Vence hoje'

  const corLabel = isVencido ? '#c44536' : isHoje ? '#8a5a00' : '#2d6a4f'
  const bgLabel = isVencido ? '#fce8e6' : isHoje ? '#fff4e0' : '#e8f0e4'

  return (
    <div>
      <div style={{
        fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
        fontWeight: 700, color: corLabel, marginBottom: '6px', marginTop: '8px',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {alertas.map(a => (
          <Link
            key={a.id + a.tipo}
            href={a.tipo === 'receber' ? '/sistema/pagamentos' : '/sistema/despesas'}
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-card)',
              border: '1px solid var(--line)', cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Pill tipo */}
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  background: a.tipo === 'receber' ? '#e8f0e4' : '#fce8e6',
                  color: a.tipo === 'receber' ? '#2d6a4f' : '#c44536',
                }}>
                  {a.tipo === 'receber' ? '▲ Rec' : '▼ Pag'}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                  {a.titulo}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                {a.diasAtraso > 0 && (
                  <span style={{ fontSize: '11px', color: '#c44536', fontWeight: 600 }}>
                    {a.diasAtraso}d atraso
                  </span>
                )}
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                  {new Date(a.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', minWidth: '80px', textAlign: 'right' }}>
                  {a.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
