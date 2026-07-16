'use client'

import { useEffect } from 'react'

const GTM_ID = 'GTM-N2R38654'
const META_PIXEL_ID = '853098353836873'

function loadGTM() {
  if (window._gtmLoaded) return
  window._gtmLoaded = true

  // dataLayer init
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
  document.head.appendChild(s)
}

function loadMetaPixel() {
  if (window._pixelLoaded) return
  window._pixelLoaded = true

  /* eslint-disable */
  ;(function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = true
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

  window.fbq('init', META_PIXEL_ID)
  window.fbq('track', 'PageView')
  /* eslint-enable */
}

function loadAll() {
  loadGTM()
  loadMetaPixel()
}

export default function DeferredScripts() {
  useEffect(() => {
    const events = ['scroll', 'click', 'touchstart', 'keydown'] as const

    function onInteraction() {
      loadAll()
      events.forEach((e) => window.removeEventListener(e, onInteraction))
    }

    // Fallback: carrega após 5s mesmo sem interação
    const timer = setTimeout(loadAll, 5000)

    events.forEach((e) => window.addEventListener(e, onInteraction, { passive: true, once: true }))

    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, onInteraction))
    }
  }, [])

  return null
}

// Declarações de tipos globais
declare global {
  interface Window {
    dataLayer: unknown[]
    _gtmLoaded?: boolean
    _pixelLoaded?: boolean
    fbq: (...args: unknown[]) => void
  }
}
