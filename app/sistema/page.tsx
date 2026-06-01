import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import DashboardToDo from '@/components/DashboardToDo'
import DashboardStats from '@/components/DashboardStats'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sistema/login')
  }

  const { data: clientesAtivos } = await supabase
    .from('clientes_completo')
    .select('id, valor_mensal')
    .eq('status', 'ativo')

  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const fimMes = new Date(inicioMes)
  fimMes.setMonth(fimMes.getMonth() + 1)

  const { data: pagamentosMes } = await supabase
    .from('pagamentos')
    .select('valor, status')
    .gte('mes_referencia', inicioMes.toISOString().split('T')[0])
    .lt('mes_referencia', fimMes.toISOString().split('T')[0])

  const totalClientesAtivos = clientesAtivos?.length || 0
  const receitaPrevista = (clientesAtivos || []).reduce(
    (sum, c) => sum + Number(c.valor_mensal || 0),
    0
  )
  const recebido = (pagamentosMes || [])
    .filter((p) => p.status === 'pago')
    .reduce((sum, p) => sum + Number(p.valor || 0), 0)
  const inadimplentes = (pagamentosMes || []).filter(
    (p) => p.status === 'atrasado'
  ).length

  const formatMoeda = (v: number) =>
    v.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <Header userEmail={user.email} />

      <DashboardStats
        totalClientesAtivos={totalClientesAtivos}
        receitaPrevista={receitaPrevista}
        recebido={recebido}
        inadimplentes={inadimplentes}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <NavCard href="/sistema/clientes" label="Clientes" description="Cadastro, listagem e detalhes dos clientes da agência" available />
        <NavCard href="/sistema/pagamentos" label="Recebimentos" description="Controle de faturas, recebimentos e inadimplência" available />
        <NavCard href="/sistema/campanhas" label="Campanhas" description="KPIs de Meta, Google e LinkedIn Ads por cliente" available />
        <NavCard href="/sistema/despesas" label="Despesas" description="Contas a pagar, cartões, parcelas e fluxo de caixa" available />
      </div>

      <DashboardToDo />
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', padding: '20px 22px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '8px', fontWeight: 600 }}>
        {label}
      </div>
      <div className="font-serif" style={{ fontSize: '32px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em', color: color || 'var(--ink)' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '6px' }}>
        {sub}
      </div>
    </div>
  )
}

function NavCard({ href, label, description, available }: { href: string; label: string; description: string; available?: boolean }) {
  const content = (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '6px',
      padding: '24px', height: '100%', opacity: available ? 1 : 0.55,
      cursor: available ? 'pointer' : 'default', transition: 'all 0.15s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 className="font-serif" style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.01em' }}>
          {label}
        </h3>
        {!available && (
          <span style={{
            fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '4px 9px', borderRadius: '3px', fontWeight: 600,
            background: 'var(--line-soft)', color: 'var(--ink-muted)',
          }}>
            Em breve
          </span>
        )}
      </div>
      <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '16px' }}>
        {description}
      </p>
      {available && (
        <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>
          Acessar →
        </span>
      )}
    </div>
  )

  if (!available) return content
  return (
    <a href={href} style={{ display: 'block', height: '100%' }}>
      {content}
    </a>
  )
}
