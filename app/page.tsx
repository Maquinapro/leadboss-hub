import Link from 'next/link'
import Image from 'next/image'
import MicroInteractions from '@/components/MicroInteractions'
import FlowDiagram from '@/components/FlowDiagram'
import WhatsAppCTA from '@/components/WhatsAppCTA'

// Perguntas frequentes — conteúdo extraível pela IA do Google (FAQPage schema)
const FAQS: { q: string; a: string }[] = [
  {
    q: 'Quanto preciso investir em tráfego pago para começar?',
    a: 'Não trabalhamos com um valor fixo: o investimento ideal depende do seu mercado, da sua região e da sua meta. No diagnóstico inicial indicamos uma faixa realista para o seu caso, com verba suficiente para gerar dados e otimizar as campanhas com consistência.',
  },
  {
    q: 'Em quanto tempo vejo resultados com os anúncios?',
    a: 'As primeiras campanhas começam a rodar em poucos dias. A geração de leads costuma aparecer já nas primeiras semanas, e a performance ganha consistência conforme otimizamos os anúncios com base nos dados reais do seu público.',
  },
  {
    q: 'A Leadboss Ads atende negócios de qualquer cidade?',
    a: 'Sim. Atendemos negócios locais em todo o Brasil. Nossa sede fica em Alphaville (Barueri/SP), mas as campanhas são geridas remotamente e segmentadas exatamente para a região onde estão os seus clientes.',
  },
  {
    q: 'Qual a diferença entre anunciar no Google e no Meta (Instagram e Facebook)?',
    a: 'No Google você alcança quem já está buscando ativamente pelo seu serviço, com alta intenção de compra. No Meta você gera demanda e constrói marca para quem ainda não procurava. A estratégia certa quase sempre combina os dois canais.',
  },
  {
    q: 'Vocês cuidam de tudo ou eu preciso acompanhar as campanhas?',
    a: 'Cuidamos de toda a parte técnica: estratégia, criação, configuração, otimização diária e relatórios. Você acompanha tudo com clareza, sem precisar entender de plataforma de anúncios.',
  },
  {
    q: 'A Leadboss também cria a landing page da campanha?',
    a: 'Sim. Além de gerir o tráfego, criamos landing pages focadas em conversão: captura, serviço, oferta ou agendamento, alinhadas com a campanha para que cada clique tenha a melhor chance de virar cliente.',
  },
]

export default function HomePage() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* ===== NAV RESPONSIVA ===== */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(245, 241, 234, 0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '14px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: '12px',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: '#ffffff', border: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}>
              <Image src="/leadboss-logo.png" alt="Leadboss Ads" width={34} height={34} style={{ objectFit: 'contain' }} priority />
            </div>
            <span className="font-serif" style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
              Leadboss Ads
            </span>
          </Link>

          <div className="nav-desktop" style={{ alignItems: 'center', fontSize: '14px' }}>
            <a href="#para-quem" className="nav-link" style={{ color: 'var(--ink-soft)' }}>Para quem</a>
            <a href="#como-funciona" className="nav-link" style={{ color: 'var(--ink-soft)' }}>Como funciona</a>
            <a href="#landing-pages" className="nav-link" style={{ color: 'var(--ink-soft)' }}>Landing Pages</a>
            <Link href="/blog" className="nav-link" style={{ color: 'var(--ink-soft)' }}>Blog</Link>
            <a href="https://clientes.leadboss.com.br" target="_blank" rel="noopener" className="btn-primary" style={{
              background: 'var(--ink)', color: 'var(--bg)',
              padding: '8px 18px', borderRadius: '4px', fontWeight: 500, whiteSpace: 'nowrap',
            }}>
              Portal do Cliente
            </a>
          </div>

          <div className="nav-mobile-cta" style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
            <a href="https://clientes.leadboss.com.br" target="_blank" rel="noopener" style={{
              background: 'var(--ink)', color: 'var(--bg)',
              padding: '12px 16px', borderRadius: '4px', fontWeight: 500, fontSize: '13px',
              whiteSpace: 'nowrap',
            }}>
              Portal do Cliente
            </a>
            <WhatsAppCTA className="btn-primary" style={{
              border: '1px solid var(--line)', color: 'var(--ink-soft)',
              padding: '12px 16px', borderRadius: '4px', fontWeight: 500, fontSize: '13px',
              whiteSpace: 'nowrap',
            }}>
              Falar →
            </WhatsAppCTA>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section style={{ padding: 'clamp(48px, 8vw, 96px) 24px clamp(40px, 6vw, 72px)' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div className="hero-grid">

            {/* Coluna esquerda: texto */}
            <div>
              <div className="brand-caps hero-tag" style={{ marginBottom: '24px', color: 'var(--accent)' }}>
                * Tráfego pago para negócios locais
              </div>
              <h1 className="font-serif hero-h1" style={{
                fontSize: 'clamp(38px, 5.5vw, 74px)', fontWeight: 600,
                letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: '28px',
              }}>
                Mais visibilidade, <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>mais clientes.</em>
              </h1>
              <p className="hero-p" style={{
                fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--ink-soft)',
                lineHeight: 1.55, marginBottom: '40px', maxWidth: '520px',
              }}>
                Estratégia, gestão e resultado em <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>Meta, Google, LinkedIn e TikTok.</strong> Atraímos clientes qualificados pro seu negócio crescer mês a mês.
              </p>
              <div className="hero-cta" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <WhatsAppCTA className="btn-primary" style={{
                  background: 'var(--ink)', color: 'var(--bg)',
                  padding: '16px 32px', borderRadius: '4px', fontWeight: 500, fontSize: '15px',
                }}>
                  Fale com um especialista →
                </WhatsAppCTA>
                <a href="#como-funciona" className="btn-secondary" style={{
                  padding: '16px 32px', borderRadius: '4px', fontWeight: 500,
                  fontSize: '15px', border: '1px solid var(--line)', color: 'var(--ink-soft)',
                }}>
                  Como funciona
                </a>
              </div>
            </div>

            {/* Coluna direita: vídeo globo */}
            <div className="hero-globe">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transform: 'scale(1.35)',
                  mixBlendMode: 'multiply',
                }}
              >
                <source src="/globe-preview.mp4" type="video/mp4" />
              </video>
            </div>

          </div>

          {/* Plataformas — fora do grid para não esticar a coluna de texto */}
          <div style={{ marginTop: '48px', paddingTop: '28px', borderTop: '1px solid var(--line)' }}>
            <div className="brand-caps" style={{ marginBottom: '14px' }}>
              * Plataformas que trabalhamos
            </div>
            <div style={{ display: 'flex', gap: 'clamp(20px, 3vw, 40px)', flexWrap: 'wrap', alignItems: 'center' }}>
              {['Meta', 'Google', 'LinkedIn', 'TikTok'].map((p) => (
                <span key={p} className="font-serif platform-logo" style={{
                  fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 600,
                  letterSpacing: '-0.01em', color: 'var(--ink-soft)',
                }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FLUXO: canais → clientes ===== */}
      <section style={{ padding: 'clamp(64px, 10vw, 120px) 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 56px' }}>
            <div className="brand-caps" style={{ marginBottom: '16px', color: 'var(--accent)' }}>
              * O que fazemos
            </div>
            <h2 className="font-serif" style={{
              fontSize: 'clamp(26px, 4.5vw, 46px)', fontWeight: 600,
              letterSpacing: '-0.02em', lineHeight: 1.12, marginBottom: '20px',
            }}>
              De cada canal, <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>um caminho até o seu cliente.</em>
            </h2>
            <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              Captamos atenção onde o seu público está e conduzimos cada clique até virar uma oportunidade real de negócio.
            </p>
          </div>
          <div data-reveal>
            <FlowDiagram />
          </div>
        </div>
      </section>

      {/* ===== CENÁRIO HOJE ===== */}
      <section style={{
        padding: 'clamp(60px, 10vw, 100px) 24px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="brand-caps" style={{ marginBottom: '16px', color: 'var(--accent)' }}>
              * O cenário hoje
            </div>
            <h2 className="font-serif" style={{
              fontSize: 'clamp(26px, 4.5vw, 48px)', fontWeight: 600,
              letterSpacing: '-0.02em', lineHeight: 1.1,
              maxWidth: '780px', margin: '0 auto 20px',
            }}>
              Talvez você esteja <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>passando por isso…</em>
            </h2>
            <p style={{
              fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--ink-soft)',
              maxWidth: '620px', margin: '0 auto', lineHeight: 1.55,
            }}>
              Não é coincidência: o mercado mudou, os custos subiram, e quem não se adapta fica pra trás. Os números falam por si.
            </p>
          </div>

          <div data-reveal-stagger style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}>
            {[
              { numero: '12,15%', titulo: 'Foi quanto o Meta Ads subiu em janeiro/2026 no Brasil.', descricao: 'Seu CAC aumentou da noite pro dia. O gerenciador não mostra isso.', fonte: 'Meta Business · 2026' },
              { numero: '1 em 4', titulo: 'empresas NÃO medem se a mídia paga gera lucro.', descricao: 'Você sabe exatamente quanto custou pra trazer cada cliente?', fonte: 'IAB Brasil · Kantar IBOPE' },
              { numero: '1 em 2', titulo: 'pequenas empresas no Brasil ainda não investem em tráfego pago.', descricao: 'Quem está nessa metade que investe, está crescendo.', fonte: 'Sebrae · Pulso dos Pequenos Negócios 2024' },
              { numero: '76%', titulo: 'das empresas brasileiras já se digitalizaram.', descricao: 'Mas só uma pequena parte investe direito em tráfego. A maioria está exposta sem estratégia.', fonte: 'Sebrae · 2024' },
            ].map((stat, i) => (
              <div key={i} className="card-hover" style={{
                background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px',
                padding: '28px 24px', display: 'flex', flexDirection: 'column',
              }}>
                <div className="font-serif" style={{
                  fontSize: 'clamp(34px, 4.5vw, 52px)', fontWeight: 600,
                  color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '16px',
                }}>{stat.numero}</div>
                <h3 className="font-serif" style={{
                  fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em',
                  lineHeight: 1.3, marginBottom: '12px', color: 'var(--ink)',
                }}>{stat.titulo}</h3>
                <p style={{
                  fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.55,
                  marginBottom: '16px', flex: 1,
                }}>{stat.descricao}</p>
                <div style={{
                  paddingTop: '12px', borderTop: '1px solid var(--line-soft)',
                  fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--ink-muted)', fontWeight: 600,
                }}>Fonte: {stat.fonte}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DIFERENCIAL ===== */}
      <section style={{ padding: 'clamp(60px, 10vw, 100px) 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div data-reveal style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto' }}>
          <div className="brand-caps" style={{ marginBottom: '16px' }}>* O que ninguém te conta</div>
          <h2 className="font-serif" style={{
            fontSize: 'clamp(26px, 4.5vw, 46px)', fontWeight: 600,
            letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '20px',
          }}>
            Só <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>1 em cada 20</em> negócios locais anuncia ativamente no Google.
          </h2>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            Enquanto seus concorrentes brigam pelo mesmo público no Instagram, existe um oceano de pessoas buscando ativamente pelo seu serviço sem ninguém aparecendo. Menos concorrência, leads mais qualificados, resultado mais previsível.
          </p>
        </div>
      </section>

      {/* ===== PLATAFORMAS DETALHADAS ===== */}
      <section style={{ padding: 'clamp(60px, 10vw, 100px) 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="brand-caps" style={{ marginBottom: '12px' }}>* Plataformas que trabalhamos</div>
            <h2 className="font-serif" style={{
              fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 600,
              letterSpacing: '-0.02em', lineHeight: 1.1,
              maxWidth: '760px', margin: '0 auto',
            }}>
              Cada canal tem um momento. <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>Nós sabemos quando usar cada um.</em>
            </h2>
          </div>
          <div data-reveal-stagger style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px',
          }}>
            {[
              { nome: 'Meta', desc: 'Facebook e Instagram. Alcance massivo, branding e remarketing visual.' },
              { nome: 'Google', desc: 'Pessoas buscando ativamente pelo seu serviço. Alta intenção de compra.' },
              { nome: 'LinkedIn', desc: 'B2B e tomadores de decisão. Ideal para serviços de alto ticket.' },
              { nome: 'TikTok', desc: 'Público jovem, criativos virais, custo mais baixo de impressão.' },
            ].map((p) => (
              <div key={p.nome} className="card-hover" style={{
                background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '24px',
              }}>
                <h3 className="font-serif" style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '12px' }}>
                  {p.nome}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.55 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PARA QUEM ===== */}
      <section id="para-quem" style={{ padding: 'clamp(60px, 10vw, 100px) 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div data-reveal style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="brand-caps" style={{ marginBottom: '12px' }}>* Para quem</div>
          <h2 className="font-serif" style={{
            fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 600,
            letterSpacing: '-0.02em', lineHeight: 1.1,
            maxWidth: '780px', margin: '0 auto',
          }}>
            Atendemos negócios locais que vendem <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>serviços de valor.</em>
          </h2>
        </div>

        <div data-reveal style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1px', background: 'var(--line)', border: '1px solid var(--line)',
          borderRadius: '4px', overflow: 'hidden',
          maxWidth: '1000px', margin: '0 auto',
        }}>
          {[
            { titulo: 'Saúde', desc: 'Clínicas odontológicas, médicas, estética, fisioterapia.' },
            { titulo: 'Jurídico', desc: 'Advocacia, escritórios e consultoria jurídica.' },
            { titulo: 'Imobiliário', desc: 'Corretores, imobiliárias, construtoras e incorporadoras.' },
            { titulo: 'Educação', desc: 'Cursos, escolas, treinamentos profissionalizantes.' },
            { titulo: 'Serviços locais', desc: 'Pet shops, academias, restaurantes, salões.' },
            { titulo: 'E-commerce local', desc: 'Lojas físicas com venda online ou delivery próprio.' },
          ].map((s) => (
            <div key={s.titulo} className="para-quem-item" style={{ background: 'var(--bg-card)', padding: '28px' }}>
              <h3 className="font-serif" style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '10px' }}>
                {s.titulo}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.55 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div data-reveal style={{ textAlign: 'center', marginTop: '48px', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div className="font-serif" style={{
            fontSize: '40px', color: 'var(--accent)', lineHeight: 1,
            marginBottom: '16px', fontStyle: 'italic',
          }}>*</div>
          <p className="font-serif" style={{
            fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 500,
            color: 'var(--ink)', lineHeight: 1.35, letterSpacing: '-0.01em', marginBottom: '24px',
          }}>
            Atendemos negócios de <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>qualquer setor.</em> Seja o seu o que for, podemos ajudar a crescer.
          </p>
          <WhatsAppCTA className="btn-secondary" style={{
            display: 'inline-block', padding: '14px 28px', borderRadius: '4px',
            background: 'transparent', color: 'var(--ink)', fontWeight: 500,
            fontSize: '14px', border: '1.5px solid var(--ink)',
          }}>
            Conversar sobre meu negócio →
          </WhatsAppCTA>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" style={{
        padding: 'clamp(60px, 10vw, 100px) 24px', background: 'var(--bg-card)',
        borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="brand-caps" style={{ marginBottom: '12px' }}>* Método Leadboss</div>
            <h2 className="font-serif" style={{
              fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 600,
              letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: '780px', margin: '0 auto',
            }}>
              Do planejamento ao resultado, <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>cuidamos de tudo.</em>
            </h2>
          </div>
          <div data-reveal-stagger style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px',
          }}>
            {[
              { n: '01', t: 'Estratégia personalizada', d: 'Analisamos seu negócio, público e região para criar campanhas sob medida, focadas em atrair clientes qualificados, não vaidade de números.' },
              { n: '02', t: 'Campanhas em ação', d: 'Configuramos, lançamos e otimizamos seus anúncios diariamente para garantir o melhor custo por cliente.' },
              { n: '03', t: 'Resultados mensuráveis', d: 'Você acompanha tudo com relatórios claros, sabendo exatamente quantos clientes chegaram pelos anúncios.' },
            ].map((p) => (
              <div key={p.n} style={{ position: 'relative' }}>
                <div className="font-serif" style={{
                  fontSize: '64px', fontWeight: 600, color: 'var(--accent)',
                  fontStyle: 'italic', lineHeight: 1, marginBottom: '12px', opacity: 0.45,
                }}>{p.n}</div>
                <h3 className="font-serif" style={{
                  fontSize: '22px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '10px',
                }}>{p.t}</h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LANDING PAGES ===== */}
      <section id="landing-pages" style={{ padding: 'clamp(60px, 10vw, 100px) 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'center' }}>
          <div data-reveal>
            <div className="brand-caps" style={{ marginBottom: '16px', color: 'var(--accent)' }}>* Além dos anúncios</div>
            <h2 className="font-serif" style={{
              fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 600,
              letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '24px',
            }}>
              Também criamos <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>landing pages</em> que convertem.
            </h2>
            <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: '20px' }}>
              De nada adianta o melhor anúncio se a página de destino não convence. Criamos landing pages focadas em conversão, rápidas, diretas e alinhadas com a campanha, para que cada clique vire uma oportunidade real.
            </p>
            <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: '32px' }}>
              Diagnóstico de copy, estrutura de oferta, prova social e CTA, tudo pensado para o seu público específico.
            </p>
            <WhatsAppCTA className="btn-primary" style={{
              display: 'inline-block', padding: '14px 28px', borderRadius: '4px',
              background: 'var(--ink)', color: 'var(--bg)', fontWeight: 500, fontSize: '14px',
            }}>
              Quero uma landing page →
            </WhatsAppCTA>
          </div>

          <div data-reveal-stagger style={{ display: 'grid', gap: '16px' }}>
            {[
              { titulo: 'Página de captura', desc: 'Para campanhas de geração de leads. Formulário simples, proposta clara, sem distração.' },
              { titulo: 'Página de serviço', desc: 'Apresenta um serviço específico com profundidade, ideal para tráfego qualificado de Google.' },
              { titulo: 'Página de oferta', desc: 'Promoção, pacote ou condição especial com urgência e prova social para acelerar a decisão.' },
              { titulo: 'Página de agendamento', desc: 'Integrada com agenda online. O lead marca a consulta direto, sem fricção.' },
            ].map((item) => (
              <div key={item.titulo} className="card-hover" style={{
                background: 'var(--bg-card)', border: '1px solid var(--line)',
                borderRadius: '6px', padding: '20px 24px',
                display: 'flex', gap: '16px', alignItems: 'flex-start',
              }}>
                <div style={{
                  flexShrink: 0, marginTop: '2px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'var(--accent-soft)', border: '1px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, lineHeight: 1 }}>✓</span>
                </div>
                <div>
                  <div className="font-serif" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{item.titulo}</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.55 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" style={{ padding: 'clamp(60px, 10vw, 100px) 24px', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div className="brand-caps" style={{ marginBottom: '12px', color: 'var(--accent)' }}>* Perguntas frequentes</div>
            <h2 className="font-serif" style={{
              fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 600,
              letterSpacing: '-0.02em', lineHeight: 1.12,
            }}>
              As dúvidas que mais <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>ouvimos.</em>
            </h2>
          </div>

          <div data-reveal-stagger>
            {FAQS.map((item, i) => (
              <div key={i} style={{
                padding: '28px 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)',
              }}>
                <h3 className="font-serif" style={{
                  fontSize: 'clamp(18px, 2.4vw, 22px)', fontWeight: 600,
                  letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: '12px', color: 'var(--ink)',
                }}>
                  {item.q}
                </h3>
                <p style={{ fontSize: 'clamp(15px, 2vw, 16px)', color: 'var(--ink-soft)', lineHeight: 1.65 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ structured data (FAQPage) — formato que a IA do Google extrai */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }) }}
      />

      {/* ===== DEPOIMENTOS ===== */}
      <section style={{ padding: 'clamp(60px, 10vw, 100px) 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="brand-caps" style={{ marginBottom: '12px', color: 'var(--accent)' }}>* O que nossos clientes dizem</div>
            <h2 className="font-serif" style={{
              fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 600,
              letterSpacing: '-0.02em', lineHeight: 1.12,
            }}>
              Quem trabalha com a gente, <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>recomenda.</em>
            </h2>
          </div>

          <div data-reveal-stagger style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px',
          }}>
            {[
              { nome: 'Igor Sottani', texto: 'Agência excelente com atendimento personalizado e muito focado no crescimento e desenvolvimento do seu negócio. Super indico.' },
              { nome: 'Luciana da Cunha', texto: 'Depois que conheci o Gustavo, abriu minha mente para detalhes que nunca tinha observado, me ajudou a faturar mais.' },
              { nome: 'Antonio Ferraço Junior', texto: 'Agência de respeito e compromisso com cliente!' },
            ].map((d) => (
              <div key={d.nome} className="card-hover" style={{
                background: 'var(--bg-card)', border: '1px solid var(--line)',
                borderRadius: '8px', padding: 'clamp(24px, 4vw, 32px)',
                display: 'flex', flexDirection: 'column', gap: '16px',
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: 'var(--ink-soft)', lineHeight: 1.65, flex: 1 }}>
                  &ldquo;{d.texto}&rdquo;
                </p>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{d.nome}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOBRE ===== */}
      <section style={{
        padding: 'clamp(60px, 10vw, 100px) 24px', background: 'var(--bg-card)',
        borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
      }}>
        <div data-reveal style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
          <div className="brand-caps" style={{ marginBottom: '12px' }}>* Sobre a Leadboss Ads</div>
          <h2 className="font-serif" style={{
            fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 600,
            letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '32px',
          }}>
            Marketing de performance <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>focado em faturamento.</em>
          </h2>
          <div style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--ink-soft)', lineHeight: 1.7, display: 'grid', gap: '16px', textAlign: 'left' }}>
            <p>A Leadboss Ads nasceu pra resolver um problema simples: a maioria das agências mede sucesso em quantidade de leads. Nós medimos em <strong style={{ color: 'var(--ink)' }}>quantos clientes você fechou.</strong></p>
            <p>Atendemos negócios locais em todo o Brasil: saúde, jurídico, imobiliário, educação, serviços. Cada cliente recebe uma estratégia personalizada, e o nosso KPI principal é sempre o mesmo: o crescimento do seu faturamento.</p>
            <p>Com gestão de tráfego em Meta, Google, LinkedIn e TikTok, criamos campanhas sob medida pra cada momento do seu negócio. E você acompanha tudo, sempre, em relatórios claros.</p>
          </div>
          <div style={{ marginTop: '36px' }}>
            <WhatsAppCTA className="btn-primary" style={{
              display: 'inline-block', padding: '14px 32px', borderRadius: '4px',
              background: 'var(--ink)', color: 'var(--bg)', fontWeight: 500, fontSize: '15px',
            }}>Fale com a gente →</WhatsAppCTA>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ padding: '60px 24px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px',
            marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid var(--line)',
          }}>
            <div>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: '#ffffff', border: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  <Image src="/leadboss-logo.png" alt="Leadboss Ads" width={30} height={30} style={{ objectFit: 'contain' }} />
                </div>
                <span className="font-serif" style={{ fontSize: '20px', fontWeight: 600 }}>Leadboss Ads</span>
              </Link>
              <p style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.55 }}>
                Tráfego pago para negócios locais. Estratégia, gestão e resultado.
              </p>
            </div>

            <div>
              <div className="brand-caps" style={{ marginBottom: '12px' }}>Endereço</div>
              <div className="foot-links" style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                Alameda Rio Negro, 503<br />
                Sala 2020 · Alphaville Centro Industrial e Empresarial<br />
                Alphaville · Barueri/SP<br />
                CEP 06454-000
              </div>
            </div>

            <div>
              <div className="brand-caps" style={{ marginBottom: '12px' }}>Contato</div>
              <div className="foot-links" style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                <a href="tel:11917139765">(11) 9 1713-9765</a><br />
                <WhatsAppCTA>WhatsApp direto</WhatsAppCTA>
              </div>
            </div>

            <div>
              <div className="brand-caps" style={{ marginBottom: '12px' }}>Redes</div>
              <div className="foot-links" style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                <a href="https://www.instagram.com/leadboss.ads" target="_blank">Instagram @leadboss.ads</a><br />
                <a href="https://www.youtube.com/@leadboss_ads" target="_blank">YouTube @leadboss_ads</a>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '12px', color: 'var(--ink-muted)', flexWrap: 'wrap', gap: '12px',
          }}>
            <div>© 2026 Leadboss Ads. Todos os direitos reservados.</div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/privacidade" style={{ color: 'var(--ink-muted)' }}>Política de Privacidade</Link>
              <Link href="/termos" style={{ color: 'var(--ink-muted)' }}>Termos de Serviço</Link>
            </div>
            <div>Tráfego pago · Estratégia · Gestão · Resultado</div>
          </div>
        </div>
      </footer>

      <MicroInteractions />

      {/* CSS responsivo + micro-interações */}
      <style dangerouslySetInnerHTML={{ __html: `
        .nav-desktop { display: flex; gap: 28px; }
        .nav-mobile-cta { display: none; }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: center;
        }
        .hero-globe {
          border-radius: 50%;
          overflow: hidden;
          aspect-ratio: 1;
          width: 80%;
          margin: 0 auto;
        }
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-cta { display: inline-block !important; }
          .hero-grid { grid-template-columns: 1fr; }
          .hero-globe { display: none; }
        }

        /* ---- Hero: entrada em cascata ---- */
        @keyframes lb-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-tag { animation: lb-in 0.55s cubic-bezier(0.25,0.46,0.45,0.94) 0.05s both; }
        .hero-h1  { animation: lb-in 0.65s cubic-bezier(0.25,0.46,0.45,0.94) 0.18s both; }
        .hero-p   { animation: lb-in 0.65s cubic-bezier(0.25,0.46,0.45,0.94) 0.30s both; }
        .hero-cta { animation: lb-in 0.55s cubic-bezier(0.25,0.46,0.45,0.94) 0.42s both; }

        /* ---- Scroll reveal ---- */
        [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s cubic-bezier(0.25,0.46,0.45,0.94),
                      transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        [data-reveal].revealed { opacity: 1; transform: translateY(0); }

        [data-reveal-stagger] > * {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.55s cubic-bezier(0.25,0.46,0.45,0.94),
                      transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        [data-reveal-stagger].revealed > *:nth-child(1) { opacity:1; transform:translateY(0); transition-delay:0ms; }
        [data-reveal-stagger].revealed > *:nth-child(2) { opacity:1; transform:translateY(0); transition-delay:90ms; }
        [data-reveal-stagger].revealed > *:nth-child(3) { opacity:1; transform:translateY(0); transition-delay:180ms; }
        [data-reveal-stagger].revealed > *:nth-child(4) { opacity:1; transform:translateY(0); transition-delay:270ms; }
        [data-reveal-stagger].revealed > *:nth-child(5) { opacity:1; transform:translateY(0); transition-delay:360ms; }
        [data-reveal-stagger].revealed > *:nth-child(6) { opacity:1; transform:translateY(0); transition-delay:450ms; }

        /* ---- Nav: underline deslizante ---- */
        .nav-link { position: relative; transition: color 0.18s ease !important; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -3px; left: 0;
          width: 0; height: 1px;
          background: var(--ink);
          transition: width 0.22s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .nav-link:hover { color: var(--ink) !important; }
        .nav-link:hover::after { width: 100%; }

        /* ---- Botões: hover com transição para acento ---- */
        .btn-primary {
          transition: background 0.22s ease, transform 0.18s ease, box-shadow 0.22s ease !important;
          cursor: pointer;
        }
        .btn-primary:hover {
          background: var(--accent) !important;
          color: var(--bg) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 28px rgba(200,71,43,0.28) !important;
        }
        .btn-secondary {
          transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease, transform 0.18s ease !important;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background: var(--ink) !important;
          color: var(--bg) !important;
          transform: translateY(-2px) !important;
        }

        /* ---- Cards: lift no hover ---- */
        .card-hover {
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease !important;
        }
        .card-hover:hover {
          transform: translateY(-4px) !important;
          border-color: rgba(200,71,43,0.3) !important;
          box-shadow: 0 16px 40px rgba(26,26,26,0.09) !important;
        }

        /* ---- Para quem: hover sutil ---- */
        .para-quem-item { transition: background 0.22s ease; }
        .para-quem-item:hover { background: var(--bg) !important; }

        /* ---- Plataformas no hero ---- */
        .platform-logo { transition: opacity 0.18s ease; }
        .platform-logo:hover { opacity: 0.5; }

        /* ---- Rodapé: alvos de toque acessíveis (WCAG) ---- */
        .foot-links a {
          display: inline-block;
          padding: 7px 0;
          transition: color 0.18s ease;
        }
        .foot-links a:hover { color: var(--accent); }

        /* ---- Respeito por reduced motion ---- */
        @media (prefers-reduced-motion: reduce) {
          .hero-tag,.hero-h1,.hero-p,.hero-cta { animation: none !important; opacity:1 !important; }
          [data-reveal],[data-reveal-stagger]>* { opacity:1 !important; transform:none !important; transition:none !important; }
          .btn-primary:hover,.btn-secondary:hover,.card-hover:hover { transform:none !important; box-shadow:none !important; }
        }
      `}} />
    </main>
  )
}
