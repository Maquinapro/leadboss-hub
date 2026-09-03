// TV retrô "sem sinal" — metáfora do negócio que não é encontrado sem landing page.
// CSS puro, sem JS. Tudo em `em`, então a escala inteira vem do font-size do wrapper.
export default function NotFoundTV() {
  return (
    <div className="lptv" aria-hidden="true">
      <span className="lptv-mark">404</span>

      <div className="lptv-antenna">
        <span className="lptv-rod lptv-rod-l" />
        <span className="lptv-tip lptv-tip-l" />
        <span className="lptv-rod lptv-rod-r" />
        <span className="lptv-tip lptv-tip-r" />
        <span className="lptv-dome" />
      </div>

      <div className="lptv-body">
        <div className="lptv-screen">
          <span className="lptv-chip">NOT FOUND</span>
        </div>
        <div className="lptv-panel">
          <span className="lptv-knob" />
          <span className="lptv-knob" />
          <div className="lptv-speaker">
            <span /><span /><span />
          </div>
          <div className="lptv-grille">
            <span /><span />
          </div>
        </div>
      </div>

      <div className="lptv-legs">
        <span className="lptv-leg" />
        <span className="lptv-leg" />
        <span className="lptv-base" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .lptv {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: clamp(14px, 4.2vw, 19px);
          padding: 2.2em 0 0.6em;
        }

        /* 404 de fundo */
        .lptv-mark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 0;
          font-family: var(--font-fraunces), serif;
          font-size: 14em;
          font-weight: 600;
          letter-spacing: 0.02em;
          line-height: 1;
          color: var(--line);
          user-select: none;
          white-space: nowrap;
        }

        /* Antena */
        .lptv-antenna {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 3.6em;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .lptv-rod {
          position: absolute;
          bottom: 0.9em;
          width: 0.16em;
          height: 4.2em;
          border-radius: 0.1em;
          background: #1a1a1a;
          transform-origin: bottom center;
        }
        .lptv-rod-l { transform: rotate(-28deg) translateX(-1.1em); }
        .lptv-rod-r { transform: rotate(24deg) translateX(1.2em); }
        .lptv-tip {
          position: absolute;
          width: 0.52em;
          height: 0.52em;
          border-radius: 50%;
          border: 0.12em solid #1a1a1a;
          background: var(--bg-card);
        }
        .lptv-tip-l { bottom: 4.35em; left: calc(50% - 3.35em); }
        .lptv-tip-r { bottom: 4.5em; left: calc(50% + 2.5em); }
        .lptv-dome {
          position: absolute;
          bottom: -1.4em;
          width: 3.1em;
          height: 3.1em;
          border-radius: 50%;
          border: 0.12em solid #1a1a1a;
          background: #d9603f;
          box-shadow: inset -0.3em -0.32em 0 #a8391f;
        }

        /* Corpo */
        .lptv-body {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 0.5em;
          width: 15.6em;
          height: 8.8em;
          padding: 0.55em;
          border-radius: 0.85em;
          border: 0.12em solid #1a1a1a;
          background: var(--accent);
          box-shadow: inset 0.2em 0.2em 0 #d9603f;
        }

        /* Tela com chuvisco */
        .lptv-screen {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5em;
          border: 0.12em solid #1a1a1a;
          background-color: #2c2620;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.62'/%3E%3C/svg%3E");
          background-size: 140px 140px;
          animation: lptv-static 0.55s steps(4) infinite;
          box-shadow: 0.18em 0.18em 0 #d9603f;
        }
        @keyframes lptv-static {
          0%   { background-position: 0 0; }
          25%  { background-position: -37px 21px; }
          50%  { background-position: 24px -33px; }
          75%  { background-position: -19px -14px; }
          100% { background-position: 31px 27px; }
        }
        .lptv-chip {
          position: relative;
          font-family: var(--font-inter-tight), system-ui, sans-serif;
          font-size: 0.6em;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--bg);
          background: #1a1a1a;
          padding: 0.35em 0.6em;
          border-radius: 0.25em;
        }

        /* Painel de botões */
        .lptv-panel {
          width: 3.5em;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.45em;
          padding: 0.4em;
          border-radius: 0.5em;
          border: 0.12em solid #1a1a1a;
          background: #d9603f;
        }
        .lptv-knob {
          width: 1.25em;
          height: 1.25em;
          border-radius: 50%;
          border: 0.12em solid #1a1a1a;
          background: #8a6a4f;
          box-shadow: inset 0.12em 0.12em 0 #b49577;
        }
        .lptv-speaker {
          display: flex;
          gap: 0.22em;
        }
        .lptv-speaker span {
          width: 0.42em;
          height: 0.42em;
          border-radius: 50%;
          border: 0.1em solid #1a1a1a;
          background: #8a6a4f;
        }
        .lptv-grille {
          display: flex;
          flex-direction: column;
          gap: 0.16em;
          width: 1.6em;
        }
        .lptv-grille span {
          height: 0.1em;
          border-radius: 0.1em;
          background: #1a1a1a;
        }

        /* Pés */
        .lptv-legs {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          gap: 8.6em;
          margin-top: -0.12em;
        }
        .lptv-leg {
          width: 1.7em;
          height: 0.85em;
          border: 0.12em solid #1a1a1a;
          background: #4d4d4d;
        }
        .lptv-base {
          position: absolute;
          top: 0.78em;
          width: 15.4em;
          height: 0.14em;
          background: #1a1a1a;
        }

        @media (prefers-reduced-motion: reduce) {
          .lptv-screen { animation: none; }
        }
      ` }} />
    </div>
  )
}
