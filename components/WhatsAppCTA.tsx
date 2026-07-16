'use client'
import { useEffect, useState } from 'react'
import WhatsAppModal from './WhatsAppModal'

export default function WhatsAppCTA({
  children,
  className,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const [gclid, setGclid] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setGclid(params.get('gclid') ?? '')
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        style={{ cursor: 'pointer', ...style }}
      >
        {children}
      </button>

      <WhatsAppModal
        isOpen={open}
        onClose={() => setOpen(false)}
        gclid={gclid}
      />
    </>
  )
}
