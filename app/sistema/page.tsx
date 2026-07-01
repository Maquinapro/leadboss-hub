import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import DashboardToDo from '@/components/DashboardToDo'
import DashboardStats from '@/components/DashboardStats'
import SistemaNav from '@/components/SistemaNav'
import AlertasVencimento from '@/components/AlertasVencimento'

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

  const temFaturasMes = (pagamentosMes || []).length > 0

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <Header userEmail={user.email} />
      <SistemaNav />
      <AlertasVencimento />
      <DashboardStats
        totalClientesAtivos={totalClientesAtivos}
        receitaPrevista={receitaPrevista}
        recebido={recebido}
        inadimplentes={inadimplentes}
      />

      {/* Fluxo mensal */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px',
        padding: '20px 24px', marginBottom: '28px',
      }}>
        <div style={{
          fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '16px',
        }}>
          Fluxo mensal — o que fazer todo mês
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <FluxoStep
            step={1}
            label="Gerar faturas"
            description={'Vá em Contas a Receber e clique em "Gerar faturas do mês" para criar uma cobrança pra cada cliente ativo.'}
            href="/sistema/pagamentos"
            done={temFaturasMes}
            cta="Ir para Contas a Receber"
          />
          <FluxoStep
            step={2}
            label="Confirmar recebimentos"
            description="Quando o cliente pagar, marque a fatura como paga. Informe a data, método (PIX, boleto etc.) e número da NF."
            href="/sistema/pagamentos"
            done={recebido > 0}
            cta="Ver faturas"
          />
          <FluxoStep
            step={3}
            label="Emitir recibo ou fatura"
            description="Com a fatura marcada como paga, gere o recibo em PDF para enviar ao cliente ou emita a fatura para sua NF."
            href="/sistema/pagamentos"
            cta="Ver recebimentos"
          />
          <FluxoStep
            step={4}
            label="Registrar despesas"
            description="Cadastre as saídas do mês: softwares, impostos, cartão de crédito e qualquer outro custo da agência."
            href="/sistema/despesas"
            cta="Ir para Contas a Pagar"
          />
        </div>
      </div>

      {/* Nav cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <NavCard
          href="/sistema/clientes"
          label="Clientes"
          description="Cadastro, histórico e detalhes dos clientes. Gerencie contratos, plataformas e status."
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <NavCard
          href="/sistema/pagamentos"
          label="Contas a Receber"
          description="Faturas mensais, recebimentos e inadimplência. Gere faturas, marque pagamentos e emita recibos."
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
          highlight={!temFaturasMes && totalClientesAtivos > 0}
          highlightLabel="Faturas pendentes de geração"
        />
        <NavCard
          href="/sistema/campanhas"
          label="Campanhas"
          description="KPIs de Meta, Google e LinkedIn Ads. Acompanhe CPL, leads, agendamentos e conversões."
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        />
        <NavCard
          href="/sistema/despesas"
          label="Contas a Pagar"
          description="Saídas do mês: softwares, impostos, cartão de crédito e despesas parceladas da agência e pessoais."
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          }
        />
      </div>

      <DashboardToDo />
    </div>
  )
}

function FluxoStep({
  step, label, description, href, done, cta,
}: {
  step: number
  label: string
  description: string
  href: string
  done?: boolean
  cta: string
}) {
  return (
    <a href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        padding: '16px', borderRadius: '6px', cursor: 'pointer',
        border: '1px solid var(--line-soft)',
        background: done ? '#e0ebd9' : 'var(--bg)',
        transition: 'border-color 0.15s',
        height: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{
            width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700,
            background: done ? 'var(--green)' : 'var(--line-soft)',
            color: done ? '#fff' : 'var(--ink-muted)',
          }}>
            {done ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : step}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{label}</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.55, marginBottom: '10px' }}>
          {description}
        </p>
        <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 500 }}>{cta} →</span>
      </div>
    </a>
  )
}

function NavCard({
  href, label, description, icon, highlight, highlightLabel,
}: {
  href: string
  label: string
  description: string
  icon: React.ReactNode
  highlight?: boolean
  highlightLabel?: string
}) {
  return (
    <a href={href} style={{ display: 'block', height: '100%' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: highlight ? '1px solid var(--accent)' : '1px solid var(--line)',
        borderRadius: '6px',
        padding: '20px 22px',
        height: '100%',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '10px',
        }}>
          <span style={{ color: 'var(--ink-muted)' }}>{icon}</span>
          {highlight && highlightLabel && (
            <span style={{
              fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '3px 8px', borderRadius: '3px', fontWeight: 600,
              background: 'var(--accent-soft)', color: 'var(--accent)',
            }}>
              {highlightLabel}
            </span>
          )}
        </div>
        <h3 className="font-serif" style={{
          fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '6px',
        }}>
          {label}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '14px' }}>
          {description}
        </p>
        <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>
          Acessar →
        </span>
      </div>
    </a>
  )
}
