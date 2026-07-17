'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function GlobeThree() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100)
    camera.position.z = 3

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    container.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0xb0a89a, wireframe: true, transparent: true, opacity: 0.09 })
    )
    group.add(globe)

    function resize() {
      const w = container!.clientWidth
      const h = container!.clientHeight
      if (!w || !h) return
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const rotationSpeed = 0.004
    let raf = 0
    function animate() {
      group.rotation.y += rotationSpeed
      group.rotation.x += rotationSpeed * 0.3
      group.rotation.z += rotationSpeed * 0.1
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    if (reduceMotion) {
      renderer.render(scene, camera)
    } else {
      raf = requestAnimationFrame(animate)
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      globe.geometry.dispose()
      ;(globe.material as THREE.Material).dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} aria-hidden="true" style={{ width: '100%', height: '100%' }} />
}
