import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Política de Privacidade da Leadboss Ads: como coletamos, usamos e protegemos os seus dados pessoais e os dados das contas de anúncios dos nossos clientes.',
  alternates: { canonical: 'https://leadboss.com.br/privacidade' },
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

export default function PrivacidadePage() {
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
          Política de Privacidade
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '32px' }}>
          Última atualização: 10 de julho de 2026
        </p>

        <p style={pStyle}>
          A Leadboss Ads (&quot;Leadboss&quot;, &quot;nós&quot;) é uma agência de tráfego pago
          para negócios locais, com sede em Barueri/SP. Esta política explica como coletamos,
          usamos e protegemos os dados pessoais de visitantes do site leadboss.com.br e de
          clientes que utilizam o nosso portal em clientes.leadboss.com.br, em conformidade
          com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
        </p>

        <h2 className="font-serif" style={h2Style}>1. Dados que coletamos</h2>
        <ul style={{ paddingLeft: '20px', marginBottom: '14px' }}>
          <li style={liStyle}>
            <strong style={{ color: 'var(--ink)' }}>Dados de contato:</strong> nome, e-mail e
            telefone informados quando você fala conosco pelo site ou WhatsApp.
          </li>
          <li style={liStyle}>
            <strong style={{ color: 'var(--ink)' }}>Dados de conta do portal:</strong> nome,
            e-mail e credenciais de acesso dos clientes que utilizam o Portal do Cliente.
          </li>
          <li style={liStyle}>
            <strong style={{ color: 'var(--ink)' }}>Dados de campanhas publicitárias:</strong>{' '}
            métricas de desempenho (impressões, cliques, conversões e investimento) das contas
            de anúncios que gerenciamos para os nossos clientes, obtidas por meio da API do
            Google Ads.
          </li>
          <li style={liStyle}>
            <strong style={{ color: 'var(--ink)' }}>Dados de navegação:</strong> cookies e
            identificadores coletados por ferramentas de análise e publicidade (Google Tag
            Manager e Meta Pixel) quando você visita o nosso site.
          </li>
        </ul>

        <h2 className="font-serif" style={h2Style}>2. Como usamos os dados do Google</h2>
        <p style={pStyle}>
          O Portal do Cliente da Leadboss acessa a API do Google Ads exclusivamente para
          exibir aos nossos clientes os relatórios de desempenho das suas próprias contas de
          anúncios, gerenciadas pela Leadboss. Os dados obtidos por meio das APIs do Google:
        </p>
        <ul style={{ paddingLeft: '20px', marginBottom: '14px' }}>
          <li style={liStyle}>são usados apenas para gerar relatórios e dashboards para o titular da conta;</li>
          <li style={liStyle}>não são vendidos, alugados ou transferidos a terceiros;</li>
          <li style={liStyle}>não são usados para publicidade própria da Leadboss nem para criação de perfis;</li>
          <li style={liStyle}>não são usados para treinar modelos de inteligência artificial.</li>
        </ul>
        <p style={pStyle}>
          O uso e a transferência de informações recebidas das APIs do Google pela Leadboss
          seguem a{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener"
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
          >
            Política de Dados do Usuário dos Serviços de API do Google
          </a>
          , incluindo os requisitos de Uso Limitado (Limited Use).
        </p>

        <h2 className="font-serif" style={h2Style}>3. Finalidade e base legal</h2>
        <p style={pStyle}>
          Tratamos dados pessoais para: prestar os serviços contratados (execução de
          contrato), responder a solicitações de contato (legítimo interesse ou
          consentimento), enviar relatórios de desempenho por e-mail aos clientes (execução
          de contrato) e mensurar a eficácia do nosso próprio marketing (consentimento, por
          meio do banner de cookies do navegador).
        </p>

        <h2 className="font-serif" style={h2Style}>4. Compartilhamento</h2>
        <p style={pStyle}>
          Utilizamos fornecedores que processam dados em nosso nome, sob contrato e apenas
          para as finalidades descritas nesta política: provedores de hospedagem e
          infraestrutura (Vercel, Supabase), envio de e-mails transacionais (Resend) e
          plataformas de anúncios (Google, Meta). Não vendemos dados pessoais.
        </p>

        <h2 className="font-serif" style={h2Style}>5. Armazenamento e segurança</h2>
        <p style={pStyle}>
          Os dados do portal são armazenados com criptografia em trânsito (HTTPS) e em
          repouso, com controle de acesso por autenticação. Cada cliente acessa somente os
          dados da sua própria conta. Mantemos os dados pelo período necessário à prestação
          do serviço ou conforme exigido por lei; após o encerramento do contrato, os dados
          são excluídos mediante solicitação.
        </p>

        <h2 className="font-serif" style={h2Style}>6. Seus direitos</h2>
        <p style={pStyle}>
          Nos termos da LGPD, você pode solicitar a qualquer momento: confirmação do
          tratamento, acesso, correção, anonimização, portabilidade ou exclusão dos seus
          dados, além de revogar consentimentos. Para exercer esses direitos, fale conosco
          pelos canais abaixo.
        </p>

        <h2 className="font-serif" style={h2Style}>7. Cookies</h2>
        <p style={pStyle}>
          O site utiliza cookies de análise e publicidade (Google Tag Manager e Meta Pixel)
          para entender o uso do site e mensurar campanhas. Você pode bloquear cookies nas
          configurações do seu navegador; o site continuará funcionando normalmente.
        </p>

        <h2 className="font-serif" style={h2Style}>8. Contato</h2>
        <p style={pStyle}>
          Dúvidas ou solicitações sobre esta política podem ser enviadas para{' '}
          <a href="mailto:leadboss.gt@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            leadboss.gt@gmail.com
          </a>{' '}
          ou pelo WhatsApp (11) 9 1713-9765. Endereço: Alameda Rio Negro, 503, Sala 2020,
          Alphaville, Barueri/SP, CEP 06454-000.
        </p>

        <p style={{ ...pStyle, marginTop: '32px', fontSize: '13px', color: 'var(--ink-muted)' }}>
          Esta política pode ser atualizada periodicamente. A versão vigente estará sempre
          disponível nesta página. Veja também os nossos{' '}
          <Link href="/termos" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            Termos de Serviço
          </Link>
          .
        </p>
      </article>
    </main>
  )
}
