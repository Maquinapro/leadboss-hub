'use client'

import { useEffect, useRef, useState } from 'react'

const BASE_NUMBER = '5511917139765'

interface Props {
  isOpen: boolean
  onClose: () => void
  gclid?: string
}

export default function WhatsAppModal({ isOpen, onClose, gclid }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [nameFocused, setNameFocused] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [msgFocused, setMsgFocused] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  // Foca no primeiro campo ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameRef.current?.focus(), 80)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Fecha com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const formatPhone = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
  }

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
    setPhoneError('')
  }

  const validatePhone = (v: string) => v.replace(/\D/g, '').length >= 10

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!validatePhone(phone)) {
      setPhoneError('Informe um número válido com DDD')
      return
    }
    const digits = phone.replace(/\D/g, '')
    const parts = [
      `Olá! Me chamo *${name.trim()}*`,
      `meu WhatsApp é *${phone}*`,
      message.trim() ? `e preciso de ajuda com: ${message.trim()}` : 'e gostaria de saber mais sobre tráfego pago.',
      gclid ? `[gclid: ${gclid}]` : '',
    ].filter(Boolean)
    const text = parts.join(', ')
    window.open(`https://wa.me/${BASE_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
    onClose()
    // Reset form
    setTimeout(() => {
      setName(''); setPhone(''); setMessage('')
      setSubmitted(false); setPhoneError('')
    }, 300)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(26, 26, 26, 0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'modal-fade-in 0.2s ease',
        }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            padding: 'clamp(28px, 5vw, 48px)',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 24px 64px rgba(26,26,26,0.18)',
            pointerEvents: 'all',
            animation: 'modal-slide-up 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            position: 'relative',
          }}
        >
          {/* Fechar */}
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ink-muted)', padding: '6px',
              lineHeight: 1, fontSize: '20px', borderRadius: '6px',
              transition: 'color 0.18s ease, background 0.18s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--line-soft)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-muted)'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
            }}
          >
            ×
          </button>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div className="brand-caps" style={{ color: 'var(--accent)', marginBottom: '10px', fontSize: '11px' }}>
              * Fale com um especialista
            </div>
            <h2
              id="modal-title"
              className="font-serif"
              style={{
                fontSize: 'clamp(20px, 4vw, 26px)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                color: 'var(--ink)',
              }}
            >
              Deixe seus dados e<br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>entramos em contato hoje.</em>
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Nome */}
            <Field
              id="modal-name"
              label="Seu nome"
              isFocused={nameFocused}
              hasValue={!!name}
            >
              <input
                ref={nameRef}
                id="modal-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                required
                autoComplete="name"
                style={inputStyle}
              />
            </Field>

            {/* Telefone */}
            <Field
              id="modal-phone"
              label="WhatsApp (com DDD)"
              isFocused={phoneFocused}
              hasValue={!!phone}
              error={submitted ? phoneError : ''}
            >
              <input
                id="modal-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={handlePhone}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                required
                autoComplete="tel"
                style={inputStyle}
              />
            </Field>

            {/* Mensagem */}
            <Field
              id="modal-msg"
              label="O que você precisa? (opcional)"
              isFocused={msgFocused}
              hasValue={!!message}
            >
              <textarea
                id="modal-msg"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onFocus={() => setMsgFocused(true)}
                onBlur={() => setMsgFocused(false)}
                rows={3}
                style={{ ...inputStyle, resize: 'none', paddingTop: '22px', height: 'auto' }}
              />
            </Field>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px 24px',
                background: 'var(--ink)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'background 0.22s ease, transform 0.18s ease, box-shadow 0.22s ease',
                fontFamily: 'inherit',
                marginTop: '4px',
              }}
              onMouseEnter={e => {
                const b = e.currentTarget
                b.style.background = 'var(--accent)'
                b.style.transform = 'translateY(-2px)'
                b.style.boxShadow = '0 8px 28px rgba(200, 71, 43, 0.28)'
              }}
              onMouseLeave={e => {
                const b = e.currentTarget
                b.style.background = 'var(--ink)'
                b.style.transform = ''
                b.style.boxShadow = ''
              }}
            >
              {/* WhatsApp icon inline */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar no WhatsApp
            </button>

            <p style={{ fontSize: '11px', color: 'var(--ink-muted)', textAlign: 'center', marginTop: '14px', lineHeight: 1.5 }}>
              Seus dados são usados somente para entrar em contato com você.
            </p>
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modal-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modal-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .modal-field { position: relative; margin-bottom: 20px; }
        .modal-field label {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          font-size: 15px;
          color: var(--ink-muted);
          transition: all 0.18s ease;
          pointer-events: none;
          background: var(--bg-card);
        }
        .modal-field.textarea-field label { top: 18px; transform: none; }
        .modal-field.active label, .modal-field.has-value label {
          top: 8px; transform: none;
          font-size: 11px;
          letter-spacing: 0.04em;
          color: var(--accent);
        }
        .modal-field.textarea-field.active label,
        .modal-field.textarea-field.has-value label {
          top: 6px;
        }
        .modal-field-error {
          font-size: 11px;
          color: var(--accent);
          margin-top: 4px;
          padding-left: 14px;
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes modal-fade-in { from { opacity: 1; } }
          @keyframes modal-slide-up { from { opacity: 1; transform: none; } }
        }
      ` }} />
    </>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '22px 14px 8px',
  background: 'var(--bg)',
  border: '1px solid var(--line)',
  borderRadius: '8px',
  fontSize: '15px',
  color: 'var(--ink)',
  outline: 'none',
  transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
  fontFamily: 'inherit',
}

function Field({
  id, label, isFocused, hasValue, error, children,
}: {
  id: string
  label: string
  isFocused: boolean
  hasValue: boolean
  error?: string
  children: React.ReactNode
}) {
  const isTextarea = (children as React.ReactElement)?.type === 'textarea'
  const className = [
    'modal-field',
    isTextarea ? 'textarea-field' : '',
    isFocused ? 'active' : '',
    hasValue ? 'has-value' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={className}>
      {children}
      <label htmlFor={id}>{label}</label>
      {error && <p className="modal-field-error" role="alert">{error}</p>}
    </div>
  )
}
