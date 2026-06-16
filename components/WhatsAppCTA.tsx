'use client'
import { useEffect, useState } from 'react'

const BASE_NUMBER = '5511917139765'
const BASE_TEXT = 'Olá, vim pelo site e gostaria de saber mais!'

export default function WhatsAppCTA({
  children,
  className,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const [href, setHref] = useState(
    `https://wa.me/${BASE_NUMBER}?text=${encodeURIComponent(BASE_TEXT)}`
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const gclid = params.get('gclid')
    const text = gclid
      ? `${BASE_TEXT} [gclid: ${gclid}]`
      : BASE_TEXT
    setHref(`https://wa.me/${BASE_NUMBER}?text=${encodeURIComponent(text)}`)
  }, [])

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
      {children}
    </a>
  )
}
