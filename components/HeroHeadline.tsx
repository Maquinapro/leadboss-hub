'use client'

import { useState } from 'react'
import ParticleHeadline from './ParticleHeadline'

export default function HeroHeadline() {
  const [particlesReady, setParticlesReady] = useState(false)

  return (
    <h1 className="font-serif hero-h1" style={{
      position: 'relative',
      fontSize: 'clamp(38px, 6vw, 78px)', fontWeight: 600,
      letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '32px',
    }}>
      <span style={{ opacity: particlesReady ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        Mais visibilidade,
        <span style={{ position: 'relative', display: 'inline-block', marginTop: '4px' }}>
          <em style={{ display: 'block', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>mais clientes.</em>
          <span className="hero-underline" aria-hidden="true" />
        </span>
      </span>
      <ParticleHeadline onReady={() => setParticlesReady(true)} />
    </h1>
  )
}
