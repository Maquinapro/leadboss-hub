'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

const LINE_1 = 'Mais visibilidade,'
const LINE_2 = 'mais clientes.'

const INK_COLORS = ['#1a1a1a', '#2c2620', '#3d352b']
const ACCENT_COLORS = ['#c8472b', '#d9603f', '#a8391f']

const ATTRACTION_FORCE_BASE = 0.16
const NOISE_STRENGTH_BASE = 0.06
const FRICTION = 0.92
const MOUSE_INTERACTION_RADIUS = 42
const MOUSE_DISPERSE_STRENGTH = 1.1
const TRAIL_ALPHA = 0.16

const POINT_SAMPLING_DENSITY = 3
const PARTICLE_MIN = 400
const PARTICLE_MAX = 3200
const SETTLE_DISTANCE_THRESHOLD = 4
const SETTLE_ATTRACTION_MULTIPLIER = 0.15
const SETTLE_NOISE_MULTIPLIER = 0.7

interface TargetPoint {
  x: number
  y: number
  color: string
}

interface Mouse {
  x?: number
  y?: number
}

class Particle {
  x: number
  y: number
  vx: number
  vy: number
  targetX: number
  targetY: number
  size: number
  baseSize: number
  color: string
  attractionOffset: number
  noiseOffset: number

  constructor(target: TargetPoint, canvasWidth: number, canvasHeight: number, baseSize: number) {
    this.x = Math.random() * canvasWidth
    this.y = Math.random() * canvasHeight
    this.vx = (Math.random() - 0.5) * 6
    this.vy = (Math.random() - 0.5) * 6
    this.targetX = target.x
    this.targetY = target.y
    this.baseSize = baseSize
    this.size = baseSize + Math.random() * (baseSize * 0.5)
    this.color = target.color
    this.attractionOffset = (Math.random() - 0.5) * 0.04
    this.noiseOffset = (Math.random() - 0.5) * 0.2
  }

  update(mouse: Mouse) {
    const dxTarget = this.targetX - this.x
    const dyTarget = this.targetY - this.y
    const distTarget = Math.sqrt(dxTarget * dxTarget + dyTarget * dyTarget)

    let attraction = Math.max(0.001, ATTRACTION_FORCE_BASE + this.attractionOffset)
    let noise = Math.max(0, NOISE_STRENGTH_BASE + this.noiseOffset)

    if (distTarget < SETTLE_DISTANCE_THRESHOLD) {
      attraction *= SETTLE_ATTRACTION_MULTIPLIER
      noise *= SETTLE_NOISE_MULTIPLIER
    } else if (distTarget < SETTLE_DISTANCE_THRESHOLD * 4) {
      const factor = Math.max(0, (distTarget - SETTLE_DISTANCE_THRESHOLD) / (SETTLE_DISTANCE_THRESHOLD * 3))
      attraction *= SETTLE_ATTRACTION_MULTIPLIER + (1 - SETTLE_ATTRACTION_MULTIPLIER) * factor
      noise *= SETTLE_NOISE_MULTIPLIER + (1 - SETTLE_NOISE_MULTIPLIER) * factor
    }

    let forceX = 0
    let forceY = 0

    if (mouse.x !== undefined && mouse.y !== undefined) {
      const dxMouse = this.x - mouse.x
      const dyMouse = this.y - mouse.y
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)
      if (distMouse < MOUSE_INTERACTION_RADIUS && distMouse > 0) {
        const angle = Math.atan2(dyMouse, dxMouse)
        const disperse = ((MOUSE_INTERACTION_RADIUS - distMouse) / MOUSE_INTERACTION_RADIUS) * MOUSE_DISPERSE_STRENGTH
        forceX += Math.cos(angle) * disperse
        forceY += Math.sin(angle) * disperse
        attraction *= 0.1
      }
    }

    if (distTarget > 0.01) {
      forceX += (dxTarget / distTarget) * attraction * Math.min(distTarget, 100) * 0.1
      forceY += (dyTarget / distTarget) * attraction * Math.min(distTarget, 100) * 0.1
    }

    forceX += (Math.random() - 0.5) * noise
    forceY += (Math.random() - 0.5) * noise

    this.vx = (this.vx + forceX) * FRICTION
    this.vy = (this.vy + forceY) * FRICTION
    this.x += this.vx
    this.y += this.vy
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, Math.max(0.2, this.size), 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
  }
}

function getTargetPoints(width: number, height: number, fontFamily: string): TargetPoint[] {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx || width <= 0 || height <= 0) return []

  let fontSize = height * 0.42
  const fits = () => {
    ctx.font = `600 ${fontSize}px ${fontFamily}`
    const w1 = ctx.measureText(LINE_1).width
    ctx.font = `italic 400 ${fontSize}px ${fontFamily}`
    const w2 = ctx.measureText(LINE_2).width
    return Math.max(w1, w2) <= width * 0.94
  }
  while (!fits() && fontSize > 10) fontSize -= 2

  const lineHeight = fontSize * 1.08
  const startY = height / 2 - lineHeight / 2

  ctx.clearRect(0, 0, width, height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'white'
  ctx.font = `600 ${fontSize}px ${fontFamily}`
  ctx.fillText(LINE_1, width / 2, startY)
  ctx.font = `italic 400 ${fontSize}px ${fontFamily}`
  ctx.fillText(LINE_2, width / 2, startY + lineHeight)

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const midY = startY + lineHeight / 2
  const points: TargetPoint[] = []

  for (let y = 0; y < height; y += POINT_SAMPLING_DENSITY) {
    for (let x = 0; x < width; x += POINT_SAMPLING_DENSITY) {
      const alpha = data[(y * width + x) * 4 + 3]
      if (alpha > 128) {
        const palette = y > midY ? ACCENT_COLORS : INK_COLORS
        points.push({ x, y, color: palette[Math.floor(Math.random() * palette.length)] })
      }
    }
  }
  return points
}

export default function ParticleHeadline({ onReady }: { onReady?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef<Mouse>({})
  const rafRef = useRef(0)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const populate = useCallback((width: number, height: number, fontFamily: string) => {
    const targets = getTargetPoints(width, height, fontFamily)
    if (targets.length === 0) return
    const count = Math.round(Math.max(PARTICLE_MIN, Math.min(PARTICLE_MAX, targets.length)))
    const baseSize = Math.max(1, Math.min(width, height) / 220)
    particlesRef.current = Array.from({ length: count }, (_, i) => new Particle(targets[i % targets.length], width, height, baseSize))
  }, [])

  useEffect(() => {
    if (!enabled) return
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cancelled = false
    let lastW = 0
    let lastH = 0

    function resize() {
      const w = container!.clientWidth
      const h = container!.clientHeight
      if (!w || !h) return
      if (w === lastW && h === lastH) return
      lastW = w
      lastH = h
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      const fontFamily = getComputedStyle(container!).fontFamily || 'serif'
      populate(w, h, fontFamily)
      onReady?.()
    }

    document.fonts.ready.then(() => {
      if (cancelled) return
      resize()
    })

    const ro = new ResizeObserver(resize)
    ro.observe(container)

    function animate() {
      const w = container!.clientWidth
      const h = container!.clientHeight
      ctx!.fillStyle = `rgba(245, 241, 234, ${TRAIL_ALPHA})`
      ctx!.fillRect(0, 0, w, h)
      particlesRef.current.forEach((p) => {
        p.update(mouseRef.current)
        p.draw(ctx!)
      })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    function handleMove(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect()
      mouseRef.current = { x: clientX - rect.left, y: clientY - rect.top }
    }
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
    const onMouseLeave = () => { mouseRef.current = {} }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY)
    }
    const onTouchEnd = () => { mouseRef.current = {} }

    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)
    container.addEventListener('touchmove', onTouchMove, { passive: true })
    container.addEventListener('touchend', onTouchEnd)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
    }
  }, [enabled, populate])

  if (!enabled) return null

  return (
    <div ref={containerRef} aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
