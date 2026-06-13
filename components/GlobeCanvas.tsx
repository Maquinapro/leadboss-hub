'use client'

import { useEffect, useRef } from 'react'

// Simplified continent outlines [longitude, latitude]
const NORTH_AMERICA: [number, number][] = [
  [-80, 8], [-92, 16], [-106, 22], [-110, 24],
  [-120, 30], [-118, 32], [-124, 42], [-125, 48],
  [-130, 55], [-140, 60], [-155, 57], [-165, 60],
  [-165, 66], [-163, 72], [-140, 70], [-90, 73],
  [-65, 64], [-55, 48], [-65, 45], [-80, 44],
  [-76, 38], [-80, 30], [-82, 24], [-90, 29],
  [-97, 26], [-100, 22], [-88, 15], [-83, 10],
  [-78, 8], [-80, 8],
]

const SOUTH_AMERICA: [number, number][] = [
  [-78, 8], [-77, 0], [-80, -5], [-78, -15],
  [-70, -18], [-68, -24], [-70, -30], [-70, -38],
  [-72, -42], [-74, -48], [-68, -54], [-65, -54],
  [-57, -40], [-52, -32], [-50, -28], [-48, -24],
  [-40, -20], [-38, -14], [-35, -8], [-38, -5],
  [-48, -2], [-50, 0], [-52, 4], [-60, 7],
  [-62, 11], [-72, 12], [-78, 8],
]

const GREENLAND: [number, number][] = [
  [-44, 60], [-28, 62], [-18, 65], [-18, 72],
  [-22, 76], [-35, 83], [-50, 83], [-65, 78],
  [-66, 74], [-60, 70], [-52, 70], [-44, 60],
]

// Africa + Europe (appear as globe rotates)
const EUROPE_AFRICA: [number, number][] = [
  [-18, 20], [-18, 28], [-10, 36], [0, 38], [10, 44],
  [20, 46], [28, 46], [36, 42], [38, 38], [36, 34],
  [34, 30], [36, 24], [40, 18], [44, 12], [44, 8],
  [40, 4], [34, -4], [30, -10], [26, -20], [24, -28],
  [18, -34], [16, -30], [14, -26], [10, -18], [8, -6],
  [4, 4], [0, 8], [-2, 10], [-8, 6], [-14, 10],
  [-18, 14], [-18, 20],
]

export default function GlobeCanvas({ size = 440 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotRef = useRef(90) // start with Americas centered (center = -rot)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const R = size / 2 - 1.5
    const cx = size / 2
    const cy = size / 2

    function project(lon: number, lat: number, rot: number): [number, number, boolean] {
      const lambda = ((lon + rot) * Math.PI) / 180
      const phi = (lat * Math.PI) / 180
      const x = cx + R * Math.cos(phi) * Math.sin(lambda)
      const y = cy - R * Math.sin(phi)
      return [x, y, Math.cos(phi) * Math.cos(lambda) >= 0]
    }

    function drawFilled(coords: [number, number][], rot: number) {
      ctx.beginPath()
      let pen = false
      for (const [lon, lat] of coords) {
        const [x, y, vis] = project(lon, lat, rot)
        if (vis) {
          if (!pen) { ctx.moveTo(x, y); pen = true } else ctx.lineTo(x, y)
        } else pen = false
      }
      ctx.closePath()
      ctx.fill()
    }

    function drawLine(pts: [number, number][], rot: number) {
      ctx.beginPath()
      let pen = false
      for (const [lon, lat] of pts) {
        const [x, y, vis] = project(lon, lat, rot)
        if (vis) {
          if (!pen) { ctx.moveTo(x, y); pen = true } else ctx.lineTo(x, y)
        } else pen = false
      }
      ctx.stroke()
    }

    // Pre-compute grid arrays (done once, not per frame)
    const latLines: [number, number][][] = []
    for (let lat = -75; lat <= 75; lat += 15) {
      const pts: [number, number][] = []
      for (let lon = -180; lon <= 180; lon += 2) pts.push([lon, lat])
      latLines.push(pts)
    }
    const lonLines: [number, number][][] = []
    for (let lon = -180; lon < 180; lon += 15) {
      const pts: [number, number][] = []
      for (let lat = -88; lat <= 88; lat += 2) pts.push([lon, lat])
      lonLines.push(pts)
    }

    function draw(rot: number) {
      ctx.clearRect(0, 0, size, size)

      // Clip everything to the globe circle
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()

      // Ocean (matches site background)
      ctx.fillStyle = '#f5f1ea'
      ctx.fillRect(0, 0, size, size)

      // Continents
      ctx.fillStyle = '#1a1a1a'
      drawFilled(GREENLAND, rot)
      drawFilled(NORTH_AMERICA, rot)
      drawFilled(SOUTH_AMERICA, rot)
      drawFilled(EUROPE_AFRICA, rot)

      // Grid lines
      ctx.strokeStyle = 'rgba(26, 26, 26, 0.22)'
      ctx.lineWidth = 0.75
      latLines.forEach(pts => drawLine(pts, rot))
      lonLines.forEach(pts => drawLine(pts, rot))

      ctx.restore()

      // Globe border
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (noMotion) {
      draw(rotRef.current)
      return
    }

    function animate() {
      rotRef.current -= 0.15 // natural Earth rotation direction
      draw(rotRef.current)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [size])

  return <canvas ref={canvasRef} aria-hidden="true" style={{ display: 'block' }} />
}
