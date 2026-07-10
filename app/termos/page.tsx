import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Termos de Serviço',
  description:
    'Termos de Serviço da Leadboss Ads: condições de uso do site leadboss.com.br e do Portal do Cliente.',
  alternates: { canonical: 'https://leadboss.com.br/termos' },
}

const h2Style: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 600,
  letterSpacing: '-0.01em',
  margin: '40px 0 14px',
}

const pStyle: React.CSSProperties = {
  fontSize: '15px',
  color: 'var(--ink-soft)',
  lineHeight: 1.7,
  marginBottom: '14px',
}

const liStyle: React.CSSProperties = {
  fontSize: '15px',
  color: 'var(--ink-soft)',
  lineHeight: 1.7,
  marginBottom: '8px',
}

export default function TermosPage() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(245, 241, 234, 0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '14px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: '#ffffff', border: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              <Image src="/leadboss-logo.png" alt="Leadboss Ads" width={34} height={34} style={{ objectFit: 'contain' }} />
            </div>
            <span className="font-serif" style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Leadboss Ads
            </span>
          </Link>
          <Link href="/" style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
            ← Voltar ao site
          </Link>
        </div>
      </nav>

      <article style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px 80px' }}>
        <div className="brand-caps" style={{ color: 'var(--accent)', marginBottom: '16px' }}>
          * Documento legal
        </div>
        <h1 className="font-serif" style={{
          fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600,
          letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '12px',
        }}>
          Termos de Serviço
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '32px' }}>
          Última atualização: 10 de julho de 2026
        </p>

        <p style={pStyle}>
          Estes termos regulam o uso do site leadboss.com.br e do Portal do Cliente em
          clientes.leadboss.com.br, operados pela Leadboss Ads (&quot;Leadboss&quot;), agência
          de tráfego pago com sede em Barueri/SP. Ao usar o site ou o portal, você concorda
          com estes termos.
        </p>

        <h2 className="font-serif" style={h2Style}>1. Sobre o serviço</h2>
        <p style={pStyle}>
          A Leadboss presta serviços de gestão de tráfego pago (Google, Meta, LinkedIn e
          TikTok) e criação de landing pages para negócios locais. As condições comerciais
          específicas de cada cliente (escopo, valores e prazos) são definidas em proposta
          ou contrato próprio, que prevalece sobre estes termos em caso de conflito.
        </p>

        <h2 className="font-serif" style={h2Style}>2. Portal do Cliente</h2>
        <p style={pStyle}>
          O Portal do Cliente é uma área restrita onde cada cliente da Leadboss acompanha o
          desempenho das suas campanhas publicitárias. Ao usar o portal, você concorda que:
        </p>
        <ul style={{ paddingLeft: '20px', marginBottom: '14px' }}>
          <li style={liStyle}>
            o acesso é pessoal e intransferível; você é responsável por manter a
            confidencialidade das suas credenciais;
          </li>
          <li style={liStyle}>
            os dados exibidos são obtidos da API do Google Ads e refletem as informações
            disponibilizadas pela plataforma, podendo haver pequenas defasagens de
            atualização;
          </li>
          <li style={liStyle}>
            os relatórios têm caráter informativo e não constituem garantia de resultados
            futuros;
          </li>
          <li style={liStyle}>
            é proibido tentar acessar dados de outras contas, burlar mecanismos de segurança
            ou usar o portal para qualquer finalidade ilícita.
          </li>
        </ul>

        <h2 className="font-serif" style={h2Style}>3. Responsabilidades</h2>
        <p style={pStyle}>
          A Leadboss emprega as melhores práticas de gestão de campanhas, mas os resultados
          de publicidade dependem de fatores externos (mercado, concorrência, verba,
          sazonalidade e políticas das plataformas). O desempenho passado não garante
          desempenho futuro. A Leadboss não se responsabiliza por indisponibilidades das
          plataformas de anúncios ou por decisões unilaterais delas, como reprovação de
          anúncios ou suspensão de contas.
        </p>

        <h2 className="font-serif" style={h2Style}>4. Propriedade intelectual</h2>
        <p style={pStyle}>
          O conteúdo do site e do portal (marca, textos, layout e código) pertence à
          Leadboss. Os materiais criados para clientes (anúncios e landing pages) seguem o
          que estiver definido no contrato de prestação de serviços. Os dados das contas de
          anúncios pertencem aos respectivos titulares.
        </p>

        <h2 className="font-serif" style={h2Style}>5. Privacidade</h2>
        <p style={pStyle}>
          O tratamento de dados pessoais é descrito na nossa{' '}
          <Link href="/privacidade" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            Política de Privacidade
          </Link>
          , que faz parte destes termos.
        </p>

        <h2 className="font-serif" style={h2Style}>6. Alterações e encerramento</h2>
        <p style={pStyle}>
          Podemos atualizar estes termos periodicamente; a versão vigente estará sempre
          nesta página. O acesso ao portal pode ser suspenso em caso de uso indevido ou
          encerramento do contrato de prestação de serviços.
        </p>

        <h2 className="font-serif" style={h2Style}>7. Lei aplicável e contato</h2>
        <p style={pStyle}>
          Estes termos são regidos pelas leis brasileiras, com foro na comarca de
          Barueri/SP. Dúvidas podem ser enviadas para{' '}
          <a href="mailto:leadboss.gt@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            leadboss.gt@gmail.com
          </a>{' '}
          ou pelo WhatsApp (11) 9 1713-9765.
        </p>
      </article>
    </main>
  )
}
