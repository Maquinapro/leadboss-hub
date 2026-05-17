'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

interface HeaderProps {
  userEmail?: string
}

export default function Header({ userEmail }: HeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '16px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--line)',
        marginBottom: '32px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Logo circular */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <Image
            src="/leadboss-logo.png"
            alt="Leadboss"
            width={48}
            height={48}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        <div>
          <div className="brand-caps">Leadboss</div>
          <h1
            className="font-serif"
            style={{
              fontWeight: 600,
              fontSize: 'clamp(28px, 4vw, 40px)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              marginTop: '4px',
            }}
          >
            Hub
          </h1>
        </div>
      </div>

      <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
        <strong style={{ display: 'block', color: 'var(--ink)', fontSize: '14px', fontWeight: 600 }}>
          {today.charAt(0).toUpperCase() + today.slice(1)}
        </strong>
        {userEmail && <div style={{ marginTop: '4px' }}>{userEmail}</div>}
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--ink-muted)',
            fontSize: '11px',
            cursor: 'pointer',
            marginTop: '6px',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            padding: 0,
          }}
        >
          Sair
        </button>
      </div>
    </header>
  )
}