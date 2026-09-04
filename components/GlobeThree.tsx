'use client'

import { useEffect, useRef } from 'react'

// Grade de arame de uma esfera (paralelos + meridianos), pré-calculada uma
// vez em coordenadas unitárias. Sem three.js: canvas 2D + projeção manual
// custam uma fração do peso e do CPU de um WebGLRenderer pra uma esfera
// decorativa parada em 0.09 de opacidade.
const LAT_LINES = 9
const LON_LINES = 16
const SEGMENTS = 48

type Point3 = [number, number, number]

function buildGrid(): Point3[][] {
  const lines: Point3[][] = []

  for (let i = 1; i <= LAT_LINES; i++) {
    const phi = ((-90 + (180 * i) / (LAT_LINES + 1)) * Math.PI) / 180
    const line: Point3[] = []
    for (let j = 0; j <= SEGMENTS; j++) {
      const theta = ((360 * j) / SEGMENTS * Math.PI) / 180
      line.push([Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)])
    }
    lines.push(line)
  }

  for (let i = 0; i < LON_LINES; i++) {
    const theta = ((360 * i) / LON_LINES * Math.PI) / 180
    const line: Point3[] = []
    for (let j = 0; j <= SEGMENTS; j++) {
      const phi = ((-90 + (180 * j) / SEGMENTS) * Math.PI) / 180
      line.push([Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)])
    }
    lines.push(line)
  }

  return lines
}

const GRID = buildGrid()
const CAMERA_DISTANCE = 3
const VERTICAL_FOV = (75 * Math.PI) / 180

export default function GlobeThree() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0

    function resize() {
      w = container!.clientWidth
      h = container!.clientHeight
      if (!w || !h) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }

    let rx = 0
    let ry = 0
    let rz = 0
    const speed = 0.004

    function project(p: Point3): [number, number] {
      const cosX = Math.cos(rx), sinX = Math.sin(rx)
      let [x, y, z] = p
      let ny = y * cosX - z * sinX
      let nz = y * sinX + z * cosX
      y = ny; z = nz

      const cosY = Math.cos(ry), sinY = Math.sin(ry)
      let nx = x * cosY + z * sinY
      nz = -x * sinY + z * cosY
      x = nx; z = nz

      const cosZ = Math.cos(rz), sinZ = Math.sin(rz)
      nx = x * cosZ - y * sinZ
      ny = x * sinZ + y * cosZ
      x = nx; y = ny

      const f = (h / 2) / Math.tan(VERTICAL_FOV / 2)
      const denom = CAMERA_DISTANCE - z
      return [w / 2 + (f * x) / denom, h / 2 - (f * y) / denom]
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      ctx!.strokeStyle = 'rgba(176, 168, 154, 0.09)'
      ctx!.lineWidth = 1
      for (const line of GRID) {
        ctx!.beginPath()
        line.forEach((p, i) => {
          const [px, py] = project(p)
          if (i === 0) ctx!.moveTo(px, py)
          else ctx!.lineTo(px, py)
        })
        ctx!.stroke()
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    let raf = 0
    function animate() {
      rx += speed * 0.3
      ry += speed
      rz += speed * 0.1
      draw()
      raf = requestAnimationFrame(animate)
    }
    if (!reduceMotion) raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
