'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('E-mail ou senha incorretos')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f1ea',
        fontFamily: 'system-ui, sans-serif',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#fffdf8',
          border: '1px solid #d9d3c5',
          borderRadius: '8px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '13px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#8b8478',
              marginBottom: '6px',
            }}
          >
            Leadboss
          </div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: '#1a1a1a',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Hub
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#555048',
              marginTop: '8px',
            }}
          >
            Entre para acessar o sistema
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#555048',
                marginBottom: '6px',
                fontWeight: 500,
              }}
            >
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d9d3c5',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#1a1a1a',
                background: '#fffdf8',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#555048',
                marginBottom: '6px',
                fontWeight: 500,
              }}
            >
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d9d3c5',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#1a1a1a',
                background: '#fffdf8',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: '#f5d6cd',
                color: '#c8472b',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#1a1a1a',
              color: '#f5f1ea',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}