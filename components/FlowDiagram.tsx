'use client'

import { useEffect, useState } from 'react'

const CHANNELS = ['Meta', 'Google', 'LinkedIn', 'TikTok']

// Partículas que percorrem um caminho (path) — fluxo contínuo de tráfego
function Particles({
  pathId,
  count,
  dur,
  animate,
}: {
  pathId: string
  count: number
  dur: number
  animate: boolean
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const begin = `${(i * dur) / count}s`
        return (
          <circle key={i} r="3.4" fill="var(--accent)" opacity="0">
            {animate && (
              <>
                <animateMotion
                  dur={`${dur}s`}
                  begin={begin}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.4 0 0.6 1"
                >
                  <mpath href={`#${pathId}`} xlinkHref={`#${pathId}`} />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.12;0.82;1"
                  dur={`${dur}s`}
                  begin={begin}
                  repeatCount="indefinite"
                />
              </>
            )}
          </circle>
        )
      })}
    </>
  )
}

export default function FlowDiagram() {
  const [animate, setAnimate] = useState(true)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimate(false)
    }
  }, [])

  const pathStroke = 'var(--line)'
  const nodeInk = 'var(--ink)'

  // Coordenadas dos caminhos horizontais (desktop)
  const hY = [60, 140, 220, 300]
  const hPaths = hY.map((y) => `M130,${y} C 430,${y} 500,180 786,180`)

  // Coordenadas dos caminhos verticais (mobile)
  const vX = [50, 140, 230, 320]
  const vPaths = vX.map((x) => `M${x},64 C ${x},250 180,250 180,390`)

  return (
    <div className="flow-wrap" aria-hidden="true">
      {/* ===== HORIZONTAL (desktop) ===== */}
      <svg
        className="flow-h"
        viewBox="0 0 900 360"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* caminhos */}
        {hPaths.map((d, i) => (
          <path
            key={i}
            id={`ph${i}`}
            d={d}
            fill="none"
            stroke={pathStroke}
            strokeWidth="1.25"
          />
        ))}

        {/* partículas */}
        {hPaths.map((_, i) => (
          <Particles key={i} pathId={`ph${i}`} count={3} dur={3.6 + i * 0.35} animate={animate} />
        ))}

        {/* nós de canal (esquerda) */}
        {hY.map((y, i) => (
          <g key={i}>
            <circle cx="130" cy={y} r="4.5" fill={nodeInk} />
            <text
              x="108"
              y={y + 5}
              textAnchor="end"
              fontFamily="'Fraunces', serif"
              fontSize="18"
              fontWeight="600"
              fill="var(--ink-soft)"
              letterSpacing="-0.01em"
            >
              {CHANNELS[i]}
            </text>
          </g>
        ))}

        {/* nó de convergência (direita): seu cliente */}
        {animate && (
          <circle cx="820" cy="180" r="34" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0">
            <animate attributeName="r" values="34;54" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.55;0" dur="2.6s" repeatCount="indefinite" />
          </circle>
        )}
        <circle cx="820" cy="180" r="34" fill={nodeInk} />
        <text
          x="820"
          y="184"
          textAnchor="middle"
          fontFamily="'Fraunces', serif"
          fontSize="14"
          fontWeight="600"
          fill="var(--bg)"
          letterSpacing="-0.01em"
        >
          Clientes
        </text>
      </svg>

      {/* ===== VERTICAL (mobile) ===== */}
      <svg
        className="flow-v"
        viewBox="0 0 360 480"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {vPaths.map((d, i) => (
          <path
            key={i}
            id={`pv${i}`}
            d={d}
            fill="none"
            stroke={pathStroke}
            strokeWidth="1.25"
          />
        ))}

        {vPaths.map((_, i) => (
          <Particles key={i} pathId={`pv${i}`} count={2} dur={3.4 + i * 0.35} animate={animate} />
        ))}

        {vX.map((x, i) => (
          <g key={i}>
            <text
              x={x}
              y="38"
              textAnchor="middle"
              fontFamily="'Fraunces', serif"
              fontSize="15"
              fontWeight="600"
              fill="var(--ink-soft)"
              letterSpacing="-0.01em"
            >
              {CHANNELS[i]}
            </text>
            <circle cx={x} cy="62" r="4" fill={nodeInk} />
          </g>
        ))}

        {animate && (
          <circle cx="180" cy="420" r="30" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0">
            <animate attributeName="r" values="30;48" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.55;0" dur="2.6s" repeatCount="indefinite" />
          </circle>
        )}
        <circle cx="180" cy="420" r="30" fill={nodeInk} />
        <text
          x="180"
          y="424"
          textAnchor="middle"
          fontFamily="'Fraunces', serif"
          fontSize="13"
          fontWeight="600"
          fill="var(--bg)"
          letterSpacing="-0.01em"
        >
          Clientes
        </text>
      </svg>

      <style dangerouslySetInnerHTML={{ __html: `
        .flow-wrap { width: 100%; }
        .flow-h { display: block; width: 100%; height: auto; }
        .flow-v { display: none; width: 100%; max-width: 360px; height: auto; margin: 0 auto; }
        @media (max-width: 760px) {
          .flow-h { display: none; }
          .flow-v { display: block; }
        }
      ` }} />
    </div>
  )
}
