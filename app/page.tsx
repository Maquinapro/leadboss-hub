import Link from 'next/link'
import Image from 'next/image'

const WHATSAPP_URL = 'https://wa.me/5511917139765?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20saber%20mais!'

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
            <a href="#para-quem" style={{ color: 'var(--ink-soft)' }}>Para quem</a>
            <a href="#como-funciona" style={{ color: 'var(--ink-soft)' }}>Como funciona</a>
            <a href="#planos" style={{ color: 'var(--ink-soft)' }}>Planos</a>
            <a href={WHATSAPP_URL} target="_blank" style={{
              background: 'var(--ink)', color: 'var(--bg)',
              padding: '8px 18px', borderRadius: '4px', fontWeight: 500, whiteSpace: 'nowrap',
            }}>
              Falar com especialista
            </a>
          </div>

          <a href={WHATSAPP_URL} target="_blank" className="nav-mobile-cta" style={{
            background: 'var(--ink)', color: 'var(--bg)',
            padding: '9px 18px', borderRadius: '4px', fontWeight: 500, fontSize: '13px',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Falar
          </a>
        </div>
      </nav>

      {/* ===== HERO CENTRALIZADO ===== */}
      <section style={{
        padding: 'clamp(60px, 10vw, 120px) 24px clamp(60px, 8vw, 100px)',
        maxWidth: '1200px', margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="brand-caps" style={{ marginBottom: '24px', color: 'var(--accent)' }}>
            * Tráfego pago para negócios locais
          </div>
          <h1 className="font-serif" style={{
            fontSize: 'clamp(38px, 7vw, 84px)', fontWeight: 600,
            letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: '28px',
          }}>
            Mais visibilidade, <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>mais clientes.</em>
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2.4vw, 22px)', color: 'var(--ink-soft)',
            lineHeight: 1.5, marginBottom: '40px',
            maxWidth: '700px', margin: '0 auto 40px',
          }}>
            Estratégia, gestão e resultado em <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>Meta, Google, LinkedIn e TikTok.</strong> Atraímos clientes qualificados pro seu negócio crescer mês a mês.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href={WHATSAPP_URL} target="_blank" style={{
              background: 'var(--ink)', color: 'var(--bg)',
              padding: '16px 32px', borderRadius: '4px', fontWeight: 500,
              fontSize: '15px',
            }}>
              Fale com um especialista →
            </a>
            <a href="#planos" style={{
              padding: '16px 32px', borderRadius: '4px', fontWeight: 500,
              fontSize: '15px', border: '1px solid var(--line)', color: 'var(--ink-soft)',
            }}>
              Ver planos
            </a>
          </div>

          <div style={{
            marginTop: '80px', paddingTop: '40px',
            borderTop: '1px solid var(--line)',
            maxWidth: '700px', margin: '80px auto 0',
          }}>
            <div className="brand-caps" style={{ marginBottom: '20px', paddingTop: '40px' }}>
              * Plataformas que trabalhamos
            </div>
            <div style={{
              display: 'flex', gap: 'clamp(20px, 4vw, 48px)',
              flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
            }}>
              {['Meta', 'Google', 'LinkedIn', 'TikTok'].map((p) => (
                <span key={p} className="font-serif" style={{
                  fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 600, letterSpacing: '-0.01em',
                  color: 'var(--ink-soft)',
                }}>
                  {p}
                </span>
              ))}
            </div>
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
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="brand-caps" style={{ marginBottom: '16px', color: 'var(--accent)' }}>
              * O cenário hoje
            </div>
            <h2 className="font-serif" style={{
              fontSize: 'clamp(26px, 4.5vw, 48px)', fontWeight: 600,
              letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '20px',
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}>
            {[
              { numero: '12,15%', titulo: 'Foi quanto o Meta Ads subiu em janeiro/2026 no Brasil.', descricao: 'Seu CAC aumentou da noite pro dia — e o gerenciador não mostra isso.', fonte: 'Meta Business · 2026' },
              { numero: '1 em 4', titulo: 'empresas NÃO medem se a mídia paga gera lucro.', descricao: 'Você sabe exatamente quanto custou pra trazer cada cliente?', fonte: 'IAB Brasil · Kantar IBOPE' },
              { numero: '1 em 2', titulo: 'pequenas empresas no Brasil ainda não investem em tráfego pago.', descricao: 'Quem está nessa metade que investe, está crescendo.', fonte: 'Sebrae · Pulso dos Pequenos Negócios 2024' },
              { numero: '76%', titulo: 'das empresas brasileiras já se digitalizaram —', descricao: 'mas só uma pequena parte investe direito em tráfego. A maioria está exposta sem estratégia.', fonte: 'Sebrae · 2024' },
            ].map((stat, i) => (
              <div key={i} style={{
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
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto' }}>
          <div className="brand-caps" style={{ marginBottom: '16px' }}>* O que ninguém te conta</div>
          <h2 className="font-serif" style={{
            fontSize: 'clamp(26px, 4.5vw, 46px)', fontWeight: 600,
            letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '20px',
          }}>
            Só <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>1 em cada 20</em> negócios locais anuncia ativamente no Google.
          </h2>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            Enquanto seus concorrentes brigam pelo mesmo público no Instagram, existe um oceano de pessoas buscando ativamente pelo seu serviço — e ninguém aparecendo. Menos concorrência, leads mais qualificados, resultado mais previsível.
          </p>
        </div>
      </section>

      {/* ===== PLATAFORMAS DETALHADAS ===== */}
      <section style={{ padding: 'clamp(60px, 10vw, 100px) 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="brand-caps" style={{ marginBottom: '12px' }}>* Plataformas que trabalhamos</div>
            <h2 className="font-serif" style={{
              fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 600,
              letterSpacing: '-0.02em', lineHeight: 1.1,
              maxWidth: '760px', margin: '0 auto',
            }}>
              Cada canal tem um momento. <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>Nós sabemos quando usar cada um.</em>
            </h2>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px',
          }}>
            {[
              { nome: 'Meta', desc: 'Facebook e Instagram. Alcance massivo, branding e remarketing visual.' },
              { nome: 'Google', desc: 'Pessoas buscando ativamente pelo seu serviço. Alta intenção de compra.' },
              { nome: 'LinkedIn', desc: 'B2B e tomadores de decisão. Ideal para serviços de alto ticket.' },
              { nome: 'TikTok', desc: 'Público jovem, criativos virais, custo mais baixo de impressão.' },
            ].map((p) => (
              <div key={p.nome} style={{
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
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="brand-caps" style={{ marginBottom: '12px' }}>* Para quem</div>
          <h2 className="font-serif" style={{
            fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 600,
            letterSpacing: '-0.02em', lineHeight: 1.1,
            maxWidth: '780px', margin: '0 auto',
          }}>
            Atendemos negócios locais que vendem <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>serviços de valor.</em>
          </h2>
        </div>

        <div style={{
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
            <div key={s.titulo} style={{ background: 'var(--bg-card)', padding: '28px' }}>
              <h3 className="font-serif" style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '10px' }}>
                {s.titulo}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.55 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
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
          <a href={WHATSAPP_URL} target="_blank" style={{
            display: 'inline-block', padding: '14px 28px', borderRadius: '4px',
            background: 'transparent', color: 'var(--ink)', fontWeight: 500,
            fontSize: '14px', border: '1.5px solid var(--ink)',
          }}>
            Conversar sobre meu negócio →
          </a>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" style={{
        padding: 'clamp(60px, 10vw, 100px) 24px', background: 'var(--bg-card)',
        borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="brand-caps" style={{ marginBottom: '12px' }}>* Método Leadboss</div>
            <h2 className="font-serif" style={{
              fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 600,
              letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: '780px', margin: '0 auto',
            }}>
              Do planejamento ao resultado, <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>cuidamos de tudo.</em>
            </h2>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px',
          }}>
            {[
              { n: '01', t: 'Estratégia personalizada', d: 'Analisamos seu negócio, público e região para criar campanhas sob medida — focadas em atrair clientes qualificados, não vaidade de números.' },
              { n: '02', t: 'Campanhas em ação', d: 'Configuramos, lançamos e otimizamos seus anúncios diariamente para garantir o melhor custo por cliente.' },
              { n: '03', t: 'Resultados mensuráveis', d: 'Você acompanha tudo com relatórios claros — sabendo exatamente quantos clientes chegaram pelos anúncios.' },
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

      {/* ===== PLANOS ===== */}
      <section id="planos" style={{ padding: 'clamp(60px, 10vw, 100px) 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="brand-caps" style={{ marginBottom: '12px' }}>* Investimento</div>
          <h2 className="font-serif" style={{
            fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 600,
            letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '12px',
          }}>
            Três caminhos. <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>Você escolhe o seu.</em>
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--ink-soft)', maxWidth: '560px', margin: '0 auto' }}>
            Cada plano é pensado pra um momento do negócio. Comece de onde você está hoje.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[
            { nome: 'Essencial', valor: 'R$ 750', periodo: '/ mês', tagline: 'Base sólida pra começar com previsibilidade.', paraQuem: 'Negócios que estão começando no tráfego pago e querem um fluxo constante de leads qualificados.', itens: ['Gestão de tráfego em uma plataforma (Meta OU Google)','Criação de campanhas de geração de leads','Relatórios quinzenais','Configuração de pixels e tags de rastreamento'], destaque: false },
            { nome: 'Performance', valor: 'R$ 1.500', periodo: '/ mês', tagline: 'Crescimento acelerado com mais canais.', paraQuem: 'Negócios que já investem em tráfego e querem escalar com Meta + Google trabalhando juntos.', itens: ['Gestão em duas plataformas (Meta E Google)','Estratégias de remarketing','Campanhas para serviços específicos','Reuniões estratégicas mensais','Dashboard de acompanhamento'], destaque: true },
            { nome: 'Elite', valor: 'Consultar', periodo: '', tagline: 'Escala, dados e referência no nicho.', paraQuem: 'Negócios consolidados que querem dominar o mercado e transformar tráfego em vantagem competitiva.', itens: ['Gestão 360º (Meta + Google + LinkedIn + TikTok)','Estratégia de funil completo','Otimização contínua de landing pages','Análise competitiva aprofundada','Consultoria trimestral de vendas','Atendimento preferencial'], destaque: false },
          ].map((plano) => (
            <div key={plano.nome} style={{
              background: 'var(--bg-card)',
              border: plano.destaque ? '2px solid var(--accent)' : '1px solid var(--line)',
              borderRadius: '8px', padding: '32px', position: 'relative',
            }}>
              {plano.destaque && (
                <span style={{
                  position: 'absolute', top: '-12px', right: '24px',
                  background: 'var(--accent)', color: 'var(--bg)',
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em',
                  textTransform: 'uppercase', padding: '4px 10px', borderRadius: '3px',
                }}>Mais escolhido</span>
              )}
              <h3 className="font-serif" style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '8px' }}>
                {plano.nome}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '20px', lineHeight: 1.5 }}>{plano.tagline}</p>
              <div style={{ marginBottom: '20px' }}>
                <span className="font-serif" style={{ fontSize: '40px', fontWeight: 600, letterSpacing: '-0.02em' }}>{plano.valor}</span>
                {plano.periodo && <span style={{ fontSize: '14px', color: 'var(--ink-muted)', marginLeft: '6px' }}>{plano.periodo}</span>}
              </div>
              <p style={{
                fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.55,
                marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--line-soft)',
              }}>
                <strong style={{ color: 'var(--ink)' }}>Pra quem é:</strong> {plano.paraQuem}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', display: 'grid', gap: '10px' }}>
                {plano.itens.map((item, i) => (
                  <li key={i} style={{ fontSize: '13px', color: 'var(--ink-soft)', paddingLeft: '20px', position: 'relative', lineHeight: 1.5 }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--green)', fontWeight: 600 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href={WHATSAPP_URL} target="_blank" style={{
                display: 'block', textAlign: 'center', padding: '12px 20px', borderRadius: '4px',
                background: plano.destaque ? 'var(--accent)' : 'var(--ink)',
                color: 'var(--bg)', fontWeight: 500, fontSize: '14px',
              }}>
                {plano.valor === 'Consultar' ? 'Conversar sobre' : 'Contratar plano'} →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SOBRE ===== */}
      <section style={{
        padding: 'clamp(60px, 10vw, 100px) 24px', background: 'var(--bg-card)',
        borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
          <div className="brand-caps" style={{ marginBottom: '12px' }}>* Sobre a Leadboss Ads</div>
          <h2 className="font-serif" style={{
            fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 600,
            letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '32px',
          }}>
            Marketing de performance <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>focado em faturamento.</em>
          </h2>
          <div style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--ink-soft)', lineHeight: 1.7, display: 'grid', gap: '16px', textAlign: 'left' }}>
            <p>A Leadboss Ads nasceu pra resolver um problema simples: a maioria das agências mede sucesso em quantidade de leads. Nós medimos em <strong style={{ color: 'var(--ink)' }}>quantos clientes você fechou.</strong></p>
            <p>Atendemos negócios locais em todo o Brasil — saúde, jurídico, imobiliário, educação, serviços. Cada cliente recebe uma estratégia personalizada, e o nosso KPI principal é sempre o mesmo: o crescimento do seu faturamento.</p>
            <p>Com gestão de tráfego em Meta, Google, LinkedIn e TikTok, criamos campanhas sob medida pra cada momento do seu negócio. E você acompanha tudo, sempre, em relatórios claros.</p>
          </div>
          <div style={{ marginTop: '36px' }}>
            <a href={WHATSAPP_URL} target="_blank" style={{
              display: 'inline-block', padding: '14px 32px', borderRadius: '4px',
              background: 'var(--ink)', color: 'var(--bg)', fontWeight: 500, fontSize: '15px',
            }}>Fale com a gente →</a>
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
              <div style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                Alameda Rio Negro, 503<br />
                Sala 2020 · Alphaville Centro Industrial e Empresarial<br />
                Alphaville · Barueri/SP<br />
                CEP 06454-000
              </div>
            </div>

            <div>
              <div className="brand-caps" style={{ marginBottom: '12px' }}>Contato</div>
              <div style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                <a href="tel:11917139765">(11) 9 1713-9765</a><br />
                <a href={WHATSAPP_URL} target="_blank">WhatsApp direto</a>
              </div>
            </div>

            <div>
              <div className="brand-caps" style={{ marginBottom: '12px' }}>Redes</div>
              <div style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
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
            <div>Tráfego pago · Estratégia · Gestão · Resultado</div>
          </div>
        </div>
      </footer>

      {/* CSS responsivo */}
      <style dangerouslySetInnerHTML={{ __html: `
        .nav-desktop { display: flex; gap: 28px; }
        .nav-mobile-cta { display: none; }
        @media (max-width: 820px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-cta { display: inline-block !important; }
        }
      `}} />
    </main>
  )
}