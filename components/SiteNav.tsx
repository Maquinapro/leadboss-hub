import Link from 'next/link'
import Image from 'next/image'
import { WHATSAPP_URL } from '@/lib/site'

// Nav reutilizável. No blog os itens de navegação levam de volta à home (#âncoras).
export default function SiteNav() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(245, 241, 234, 0.92)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: '12px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: '#ffffff', border: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            <Image src="/leadboss-logo.png" alt="Leadboss Ads" width={34} height={34} style={{ objectFit: 'contain' }} priority />
          </div>
          <span className="font-serif" style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            Leadboss Ads
          </span>
        </Link>

        <div className="nav-desktop" style={{ alignItems: 'center', fontSize: '14px' }}>
          <Link href="/#para-quem" className="nav-link" style={{ color: 'var(--ink-soft)' }}>Para quem</Link>
          <Link href="/#como-funciona" className="nav-link" style={{ color: 'var(--ink-soft)' }}>Como funciona</Link>
          <Link href="/blog" className="nav-link" style={{ color: 'var(--ink-soft)' }}>Blog</Link>
          <a href={WHATSAPP_URL} target="_blank" className="btn-primary" style={{
            background: 'var(--ink)', color: 'var(--bg)',
            padding: '8px 18px', borderRadius: '4px', fontWeight: 500, whiteSpace: 'nowrap',
          }}>
            Falar com especialista
          </a>
        </div>

        <a href={WHATSAPP_URL} target="_blank" className="nav-mobile-cta btn-primary" style={{
          background: 'var(--ink)', color: 'var(--bg)',
          padding: '12px 20px', borderRadius: '4px', fontWeight: 500, fontSize: '13px',
          display: 'none',
        }}>
          Falar →
        </a>
      </div>
    </nav>
  )
}
