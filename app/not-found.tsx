import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import WhatsAppCTA from '@/components/WhatsAppCTA'
import NotFoundTV from '@/components/NotFoundTV'

export const metadata: Metadata = {
  title: 'Página não encontrada',
  description: 'O endereço que você tentou acessar não existe ou saiu do ar.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
      <SiteNav />

      <section style={{
        padding: 'clamp(48px, 8vw, 90px) 24px clamp(56px, 9vw, 100px)',
        maxWidth: '720px', margin: '0 auto', textAlign: 'center',
      }}>
        <NotFoundTV size="lg" />

        <h1 className="font-serif" style={{
          marginTop: 'clamp(28px, 4vw, 44px)',
          fontSize: 'clamp(30px, 5.5vw, 52px)', fontWeight: 600,
          letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>
          Sem sinal <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>por aqui.</em>
        </h1>

        <p style={{
          margin: '20px auto 36px',
          maxWidth: '480px',
          fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--ink-soft)', lineHeight: 1.65,
        }}>
          O endereço que você tentou acessar não existe ou saiu do ar. Mas a gente ainda está no ar, e pode te ajudar a aparecer pra quem procura o seu serviço.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/" className="btn-primary" style={{
            display: 'inline-block', padding: '14px 28px', borderRadius: '4px',
            background: 'var(--ink)', color: 'var(--bg)', fontWeight: 500, fontSize: '15px',
          }}>
            Voltar pro início
          </Link>
          <WhatsAppCTA className="btn-secondary" style={{
            display: 'inline-block', padding: '14px 28px', borderRadius: '4px',
            border: '1px solid var(--line)', color: 'var(--ink-soft)',
            fontWeight: 500, fontSize: '15px',
          }}>
            Falar com a gente →
          </WhatsAppCTA>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
