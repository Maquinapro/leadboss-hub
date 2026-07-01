'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import SistemaNav from '@/components/SistemaNav'
import { createClient } from '@/lib/supabase-client'

type Cliente = {
  id: string
  nome: string
  segmento: string
  status: string
  valor_mensal: number | null
  data_entrada: string
  plataformas: string[] | null
  created_at: string
}

const statusConfig: { [key: string]: { label: string; bg: string; color: string } } = {
  ativo: { label: 'Ativo', bg: '#e0ebd9', color: 'var(--green)' },
  pausado: { label: 'Pausado', bg: '#e3eef7', color: 'var(--blue)' },
  cancelado: { label: 'Cancelado', bg: '#f5d6cd', color: 'var(--accent)' },
}

export default function ClientesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [ordem, setOrdem] = useState('recente')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/sistema/login')
        return
      }
      setUserEmail(user.email || '')

      const { data } = await supabase
        .from('clientes_completo')
        .select('id, nome, segmento, status, valor_mensal, data_entrada, plataformas, created_at')
        .order('created_at', { ascending: false })

      if (data) setClientes(data as Cliente[])
      setLoading(false)
    }
    load()
  }, [])

  const clientesFiltrados = useMemo(() => {
    let lista = [...clientes]
    if (filtroStatus !== 'todos') {
      lista = lista.filter((c) => c.status === filtroStatus)
    }
    if (busca.trim()) {
      const termo = busca.toLowerCase().trim()
      lista = lista.filter((c) =>
        c.nome.toLowerCase().includes(termo) ||
        c.segmento.toLowerCase().includes(termo)
      )
    }
    if (ordem === 'recente') lista.sort((a, b) => b.created_at.localeCompare(a.created_at))
    if (ordem === 'antigo') lista.sort((a, b) => a.created_at.localeCompare(b.created_at))
    if (ordem === 'nome') lista.sort((a, b) => a.nome.localeCompare(b.nome))
    if (ordem === 'maior') lista.sort((a, b) => Number(b.valor_mensal ?? 0) - Number(a.valor_mensal ?? 0))
    if (ordem === 'menor') lista.sort((a, b) => Number(a.valor_mensal ?? 0) - Number(b.valor_mensal ?? 0))
    return lista
  }, [clientes, busca, filtroStatus, ordem])

  const totalAtivos = clientes.filter((c) => c.status === 'ativo').length
  const totalPausados = clientes.filter((c) => c.status === 'pausado').length
  const totalCancelados = clientes.filter((c) => c.status === 'cancelado').length

  const formatMoeda = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })

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

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <Header userEmail={userEmail} />
      <SistemaNav />

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: '24px', gap: '16px', flexWrap: 'wrap',
      }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Clientes
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '6px' }}>
            Cadastro, histórico e contratos dos clientes da agência
          </p>
        </div>

        <Link href="/sistema/clientes/novo" style={{
          background: 'var(--ink)', color: 'var(--bg)', padding: '12px 20px', borderRadius: '4px',
          fontSize: '14px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '8px',
        }}>
          + Novo cliente
        </Link>
      </div>

      {/* Tabs de status */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
        <TabBtn label="Todos" count={clientes.length} active={filtroStatus === 'todos'} onClick={() => setFiltroStatus('todos')} />
        <TabBtn label="Ativos" count={totalAtivos} active={filtroStatus === 'ativo'} onClick={() => setFiltroStatus('ativo')} />
        <TabBtn label="Pausados" count={totalPausados} active={filtroStatus === 'pausado'} onClick={() => setFiltroStatus('pausado')} />
        <TabBtn label="Cancelados" count={totalCancelados} active={filtroStatus === 'cancelado'} onClick={() => setFiltroStatus('cancelado')} />
      </div>

      {/* Busca e ordenação */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nome ou segmento..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
        />
        <select value={ordem} onChange={(e) => setOrdem(e.target.value)} style={{ ...inputStyle, width: '200px' }}>
          <option value="recente">Mais recentes</option>
          <option value="antigo">Mais antigos</option>
          <option value="nome">Nome (A-Z)</option>
          <option value="maior">Maior valor</option>
          <option value="menor">Menor valor</option>
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-muted)' }}>
          Carregando...
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px dashed var(--line)', borderRadius: '6px',
          padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)',
        }}>
          <div className="font-serif" style={{ fontSize: '48px', fontStyle: 'italic', color: 'var(--line)', marginBottom: '8px' }}>*</div>
          <h3 className="font-serif" style={{ fontSize: '22px', color: 'var(--ink)', marginBottom: '8px', fontWeight: 600 }}>
            {clientes.length === 0 ? 'Nenhum cliente cadastrado ainda' : 'Nenhum resultado encontrado'}
          </h3>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            {clientes.length === 0
              ? 'Comece adicionando seu primeiro cliente para acompanhar pagamentos e campanhas.'
              : 'Tente ajustar os filtros ou a busca.'}
          </p>
          {clientes.length === 0 && (
            <Link href="/sistema/clientes/novo" style={{
              background: 'var(--ink)', color: 'var(--bg)', padding: '10px 18px', borderRadius: '4px',
              fontSize: '14px', fontWeight: 500, display: 'inline-block',
            }}>
              + Cadastrar primeiro cliente
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {clientesFiltrados.map((c) => {
            const cfg = statusConfig[c.status] || statusConfig.ativo
            return (
              <Link key={c.id} href={`/sistema/clientes/${c.id}`} style={{
                background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px',
                padding: '18px', display: 'block', transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em', flex: 1 }}>
                    {c.nome}
                  </h3>
                  <span style={{
                    fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '4px 9px', borderRadius: '3px', fontWeight: 600, whiteSpace: 'nowrap',
                    background: cfg.bg, color: cfg.color,
                  }}>
                    {cfg.label}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '10px' }}>
                  {c.segmento}
                </div>

                {c.plataformas && c.plataformas.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {c.plataformas.map((p) => (
                      <span key={p} style={{
                        fontSize: '11px', padding: '3px 8px', borderRadius: '3px',
                        background: 'var(--line-soft)', color: 'var(--ink-soft)', fontWeight: 500,
                      }}>
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{
                  paddingTop: '12px', borderTop: '1px solid var(--line-soft)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                }}>
                  <span className="font-serif" style={{ fontSize: '20px', fontWeight: 600 }}>
                    {formatMoeda(Number(c.valor_mensal ?? 0))}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>/mês</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TabBtn({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', padding: '12px 18px', fontSize: '14px', fontWeight: 500,
      color: active ? 'var(--ink)' : 'var(--ink-muted)', cursor: 'pointer',
      borderBottom: '2px solid', borderBottomColor: active ? 'var(--accent)' : 'transparent',
      marginBottom: '-1px', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px',
    }}>
      {label}
      <span style={{
        fontSize: '11px', padding: '1px 7px', borderRadius: '10px', fontWeight: 600,
        background: active ? 'var(--accent-soft)' : 'var(--line-soft)',
        color: active ? 'var(--accent)' : 'var(--ink-soft)',
      }}>
        {count}
      </span>
    </button>
  )
}
