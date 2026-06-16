import Link from 'next/link'
import Image from 'next/image'
import WhatsAppCTA from '@/components/WhatsAppCTA'

export default function SiteFooter() {
  return (
    <footer style={{ padding: '60px 24px 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px',
          marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid var(--line)',
        }}>
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#ffffff', border: '1px solid var(--line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              }}>
                <Image src="/leadboss-logo.png" alt="Leadboss Ads" width={30} height={30} style={{ objectFit: 'contain' }} />
              </div>
              <span className="font-serif" style={{ fontSize: '20px', fontWeight: 600 }}>Leadboss Ads</span>
            </Link>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.55 }}>
              Tráfego pago para negócios locais. Estratégia, gestão e resultado.
            </p>
          </div>

          <div>
            <div className="brand-caps" style={{ marginBottom: '12px' }}>Conteúdo</div>
            <div className="foot-links" style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
              <Link href="/blog">Blog</Link><br />
              <Link href="/#faq">Perguntas frequentes</Link>
            </div>
          </div>

          <div>
            <div className="brand-caps" style={{ marginBottom: '12px' }}>Contato</div>
            <div className="foot-links" style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
              <a href="tel:11917139765">(11) 9 1713-9765</a><br />
              <WhatsAppCTA>WhatsApp direto</WhatsAppCTA>
            </div>
          </div>

          <div>
            <div className="brand-caps" style={{ marginBottom: '12px' }}>Redes</div>
            <div className="foot-links" style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
              <a href="https://www.instagram.com/leadboss.ads" target="_blank">Instagram @leadboss.ads</a><br />
              <a href="https://www.youtube.com/@leadboss_ads" target="_blank">YouTube @leadboss_ads</a>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '12px', color: 'var(--ink-muted)', flexWrap: 'wrap', gap: '12px',
        }}>
          <div>© 2026 Leadboss Ads. Todos os direitos reservados.</div>
          <div>Tráfego pago · Estratégia · Gestão · Resultado</div>
        </div>
      </div>
    </footer>
  )
}
