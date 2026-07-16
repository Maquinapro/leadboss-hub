'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const BASE_NUMBER = '5511917139765'

interface Props {
  isOpen: boolean
  onClose: () => void
  gclid?: string
}

export default function WhatsAppModal({ isOpen, onClose, gclid }: Props) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [nameFocus, setNameFocus] = useState(false)
  const [phoneFocus, setPhoneFocus] = useState(false)
  const [msgFocus, setMsgFocus] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const nameRef = useRef<HTMLInputElement>(null)

  // Portal mount
  useEffect(() => { setMounted(true) }, [])

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      document.body.style.overflow = 'hidden'
      setTimeout(() => nameRef.current?.focus(), 120)
    } else {
      setVisible(false)
      setTimeout(() => {
        document.body.style.overflow = ''
      }, 260)
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ESC key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  // Canvas particles
  useEffect(() => {
    if (!isOpen) {
      cancelAnimationFrame(animRef.current)
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    type Particle = { x: number; y: number; r: number; vx: number; vy: number; alpha: number }
    const count = Math.min(70, Math.floor((canvas.width * canvas.height) / 18000))
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.18 + 0.04,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 71, 43, ${p.alpha})`
        ctx.fill()
      }
      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isOpen])

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  }

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
    setPhoneError('')
  }

  const validPhone = (v: string) => v.replace(/\D/g, '').length >= 10

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!validPhone(phone)) { setPhoneError('Informe um número com DDD'); return }
    const parts = [
      `Olá! Me chamo *${name.trim()}*`,
      `meu WhatsApp é *${phone}*`,
      message.trim()
        ? `e preciso de ajuda com: ${message.trim()}`
        : 'e gostaria de saber mais sobre tráfego pago.',
      gclid ? `[gclid: ${gclid}]` : '',
    ].filter(Boolean).join(', ')
    window.open(`https://wa.me/${BASE_NUMBER}?text=${encodeURIComponent(parts)}`, '_blank', 'noopener')
    onClose()
    setTimeout(() => {
      setName(''); setPhone(''); setMessage('')
      setSubmitted(false); setPhoneError('')
    }, 300)
  }

  if (!mounted || (!isOpen && !visible)) return null

  const content = (
    <>
      {/* Backdrop com canvas */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease',
          cursor: 'pointer',
        }}
        aria-hidden="true"
      >
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(20, 18, 12, 0.72)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }} />
      </div>

      {/* Card */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', pointerEvents: 'none',
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="wm-title"
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: 'all',
            background: 'var(--bg-card)',
            border: '1px solid var(--line)',
            borderRadius: '20px',
            padding: 'clamp(28px, 5vw, 48px)',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 32px 80px rgba(20,18,12,0.28), 0 0 0 1px rgba(200,71,43,0.08)',
            position: 'relative',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.96)',
            transition: 'opacity 0.28s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        >
          {/* Linha decorativa accent no topo */}
          <div style={{
            position: 'absolute', top: 0, left: '32px', right: '32px', height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
            borderRadius: '0 0 2px 2px',
            opacity: 0.6,
          }} />

          {/* Fechar */}
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              position: 'absolute', top: '18px', right: '18px',
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--line-soft)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink-muted)', fontSize: '18px', lineHeight: 1,
              transition: 'background 0.18s, color 0.18s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--accent)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--line-soft)'
              e.currentTarget.style.color = 'var(--ink-muted)'
            }}
          >×</button>

          {/* Header */}
          <div style={{ marginBottom: '32px', paddingRight: '32px' }}>
            <div className="brand-caps" style={{ color: 'var(--accent)', marginBottom: '12px', fontSize: '11px', letterSpacing: '0.2em' }}>
              * fale com um especialista
            </div>
            <h2
              id="wm-title"
              className="font-serif"
              style={{
                fontSize: 'clamp(22px, 4vw, 30px)',
                fontWeight: 600, letterSpacing: '-0.025em',
                lineHeight: 1.12, color: 'var(--ink)',
              }}
            >
              Deixe seus dados e<br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>
                entramos em contato hoje.
              </em>
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <FloatField id="wm-name" label="Seu nome" focused={nameFocus} hasVal={!!name}>
              <input
                ref={nameRef}
                id="wm-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={() => setNameFocus(true)}
                onBlur={() => setNameFocus(false)}
                required
                autoComplete="name"
                style={baseInput(nameFocus)}
              />
            </FloatField>

            <FloatField id="wm-phone" label="WhatsApp com DDD" focused={phoneFocus} hasVal={!!phone} error={submitted ? phoneError : ''}>
              <input
                id="wm-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={handlePhone}
                onFocus={() => setPhoneFocus(true)}
                onBlur={() => setPhoneFocus(false)}
                required
                autoComplete="tel"
                style={baseInput(phoneFocus, !!(submitted && phoneError))}
              />
            </FloatField>

            <FloatField id="wm-msg" label="O que você precisa? (opcional)" focused={msgFocus} hasVal={!!message} isTextarea>
              <textarea
                id="wm-msg"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onFocus={() => setMsgFocus(true)}
                onBlur={() => setMsgFocus(false)}
                rows={3}
                style={{ ...baseInput(msgFocus), resize: 'none', paddingTop: '26px', height: 'auto' }}
              />
            </FloatField>

            <button
              type="submit"
              style={{
                width: '100%', padding: '15px 24px',
                background: 'var(--ink)', color: 'var(--bg)',
                border: 'none', borderRadius: '10px',
                fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'background 0.22s, transform 0.18s, box-shadow 0.22s',
                marginTop: '4px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 32px rgba(200,71,43,0.32)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--ink)'
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar no WhatsApp
            </button>

            <p style={{ fontSize: '11px', color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              Seus dados são usados apenas para entrarmos em contato com você.
            </p>
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .wm-field { position: relative; }
        .wm-field input, .wm-field textarea {
          display: block; width: 100%;
        }
        .wm-label {
          position: absolute;
          left: 16px;
          pointer-events: none;
          color: var(--ink-muted);
          transition: top 0.18s ease, font-size 0.18s ease, color 0.18s ease, letter-spacing 0.18s ease, background 0s;
          background: transparent;
          padding: 0 3px;
        }
        .wm-field:not(.ta) .wm-label { top: 50%; transform: translateY(-50%); font-size: 15px; }
        .wm-field.ta .wm-label { top: 16px; font-size: 15px; }
        .wm-field.active:not(.ta) .wm-label,
        .wm-field.has-val:not(.ta) .wm-label {
          top: 0; transform: translateY(-50%); font-size: 11px;
          letter-spacing: 0.05em; color: var(--accent);
          background: var(--bg-card);
        }
        .wm-field.active.ta .wm-label,
        .wm-field.has-val.ta .wm-label {
          top: 6px; font-size: 11px;
          letter-spacing: 0.05em; color: var(--accent);
          background: var(--bg-card);
        }
        .wm-error {
          font-size: 11px; color: var(--accent);
          padding: 4px 0 0 4px; display: block;
        }
        @media (prefers-reduced-motion: reduce) {
          .wm-label { transition: none !important; }
        }
      ` }} />
    </>
  )

  return createPortal(content, document.body)
}

function baseInput(focused: boolean, hasError = false): React.CSSProperties {
  return {
    width: '100%',
    padding: '24px 16px 10px',
    background: 'var(--bg)',
    border: `1.5px solid ${hasError ? 'var(--accent)' : focused ? 'var(--ink)' : 'var(--line)'}`,
    borderRadius: '10px',
    fontSize: '15px',
    color: 'var(--ink)',
    outline: 'none',
    transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
    boxShadow: focused ? '0 0 0 3px rgba(26,26,26,0.06)' : 'none',
    fontFamily: 'inherit',
  }
}

function FloatField({
  id, label, focused, hasVal, error, isTextarea, children,
}: {
  id: string
  label: string
  focused: boolean
  hasVal: boolean
  error?: string
  isTextarea?: boolean
  children: React.ReactNode
}) {
  const cls = [
    'wm-field',
    isTextarea ? 'ta' : '',
    focused ? 'active' : '',
    hasVal ? 'has-val' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      {children}
      <label htmlFor={id} className="wm-label">{label}</label>
      {error && <span className="wm-error" role="alert">{error}</span>}
    </div>
  )
}
