'use client'
import { useEffect } from 'react'

export default function MicroInteractions() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    )

    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach((el) =>
      observer.observe(el)
    )

    return () => observer.disconnect()
  }, [])

  return null
}
