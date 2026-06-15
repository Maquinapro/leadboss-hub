'use client'

import { useEffect, useRef } from 'react'

export default function HeroDashboard({ whatsappUrl }: { whatsappUrl: string }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      const target = parseFloat(el.dataset.count || '0')
      const decimals = parseInt(el.dataset.decimals || '0', 10)
      const prefix = el.dataset.prefix || ''
      const suffix = el.dataset.suffix || ''
      const format = (v: number) =>
        prefix +
        v.toLocaleString('pt-BR', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) +
        suffix

      if (reduceMotion) {
        el.textContent = format(target)
        return
      }

      const duration = 1800
      const start = performance.now() + 600
      const tick = (now: number) => {
        const t = Math.min(Math.max((now - start) / duration, 0), 1)
        const eased = 1 - Math.pow(1 - t, 3)
        el.textContent = format(target * eased)
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
  }, [])

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--ink-muted)',
    fontWeight: 600,
  }

  return (
    <div ref={rootRef}>
      <div style={{ position: 'relative' }}>
        {/* Card principal: gráfico de leads */}
        <div
          className="lb-dash-float"
          style={{
            position: 'relative',
            borderRadius: '24px',
            border: '1px solid var(--line)',
            background: 'rgba(11, 20, 38, 0.85)',
            padding: '24px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: '1px solid rgba(125, 211, 252, 0.2)',
              background: 'rgba(125, 211, 252, 0.06)',
              borderRadius: '999px',
              padding: '4px 12px',
              marginBottom: '16px',
              ...labelStyle,
              color: 'rgba(125, 211, 252, 0.85)',
            }}
          >
            Projeção · serviços de alto valor
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={labelStyle}>Leads gerados</div>
              <div style={{ fontSize: '30px', fontWeight: 600, color: 'var(--ink)', marginTop: '4px' }}>
                <span data-count="1247">0</span>
              </div>
            </div>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '999px',
                background: 'rgba(52, 211, 153, 0.1)',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#34d399',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M7 17L17 7M17 7H8M17 7v9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              +127% no trimestre
            </span>
          </div>

          <svg style={{ marginTop: '20px', width: '100%' }} viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="lbAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lbLineStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>
            <g stroke="rgba(148,163,184,0.12)" strokeWidth="1">
              <line x1="0" y1="40" x2="400" y2="40" />
              <line x1="0" y1="80" x2="400" y2="80" />
              <line x1="0" y1="120" x2="400" y2="120" />
            </g>
            <path
              className="lb-chart-area"
              d="M0 130 C40 125, 70 112, 100 108 C140 103, 160 90, 200 82 C240 74, 260 60, 300 48 C330 39, 360 28, 400 18 L400 160 L0 160 Z"
              fill="url(#lbAreaFill)"
            />
            <path
              className="lb-chart-line"
              d="M0 130 C40 125, 70 112, 100 108 C140 103, 160 90, 200 82 C240 74, 260 60, 300 48 C330 39, 360 28, 400 18"
              stroke="url(#lbLineStroke)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="400" cy="18" r="5" fill="#38BDF8" className="lb-pulse-dot-svg" />
          </svg>

          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', ...labelStyle, fontWeight: 500 }}>
            <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span>
          </div>
        </div>

        {/* Card flutuante: CPL */}
        <div
          className="lb-dash-float-2"
          style={{
            position: 'absolute',
            left: '-48px',
            bottom: '110px',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            background: 'rgba(2, 6, 23, 0.92)',
            padding: '14px 20px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={labelStyle}>Custo por lead</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink)' }}>R$ 18,40</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: 500, color: '#34d399' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M17 7L7 17M7 17h9M7 17V8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              32%
            </span>
          </div>
        </div>

        {/* Card flutuante: ROAS */}
        <div
          className="lb-dash-float"
          style={{
            position: 'absolute',
            right: '-16px',
            bottom: '-32px',
            borderRadius: '16px',
            border: '1px solid rgba(125, 211, 252, 0.25)',
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(37, 99, 235, 0.1))',
            padding: '14px 20px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ ...labelStyle, color: 'rgba(125, 211, 252, 0.7)' }}>Retorno sobre investimento</div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--ink)', marginTop: '4px' }}>
            <span data-count="4.1" data-decimals="1" data-suffix="x">0x</span>{' '}
            <span style={{ fontSize: '13px', fontWeight: 400, color: '#7dd3fc' }}>ROAS</span>
          </div>
        </div>
      </div>

      {/* Gancho: a projeção real é entregue no diagnóstico */}
      <p style={{ marginTop: '80px', textAlign: 'center', fontSize: '12px', color: 'var(--ink-muted)' }}>
        Números ilustrativos.{' '}
        <a
          href={whatsappUrl}
          target="_blank"
          style={{ color: '#7dd3fc', textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationColor: 'rgba(125, 211, 252, 0.4)' }}
        >
          Receba a projeção para o seu negócio →
        </a>
      </p>

      <style dangerouslySetInnerHTML={{ __html: `
        .lb-dash-float { animation: lb-float-soft 6s ease-in-out infinite; }
        .lb-dash-float-2 { animation: lb-float-soft 7.5s ease-in-out 1s infinite; }
        @keyframes lb-float-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .lb-chart-line {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: lb-draw-line 2.2s cubic-bezier(0.65, 0, 0.35, 1) 0.8s forwards;
        }
        @keyframes lb-draw-line { to { stroke-dashoffset: 0; } }
        .lb-chart-area { opacity: 0; animation: lb-area-in 1s ease-out 2.4s forwards; }
        @keyframes lb-area-in { to { opacity: 1; } }
        .lb-pulse-dot-svg { animation: lb-pulse-dot 2s ease-in-out infinite; }
        @keyframes lb-pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lb-dash-float, .lb-dash-float-2, .lb-pulse-dot-svg { animation: none; }
          .lb-chart-line { animation: none; stroke-dashoffset: 0; }
          .lb-chart-area { animation: none; opacity: 1; }
        }
      ` }} />
    </div>
  )
}
