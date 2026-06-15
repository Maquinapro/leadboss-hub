import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { ReactNode } from 'react'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import MicroInteractions from '@/components/MicroInteractions'
import { getPostBySlug, getAllSlugs, getAllPosts, formatDate, type Block } from '@/lib/posts'
import { SITE_URL, WHATSAPP_URL } from '@/lib/site'

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  const url = `${SITE_URL}/blog/${post.slug}`
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
    },
  }
}

// Renderiza **negrito** dentro de um texto
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--ink)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function renderBlock(block: Block, i: number): ReactNode {
  if (block.type === 'h2') {
    return (
      <h2 key={i} className="font-serif" style={{
        fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 600,
        letterSpacing: '-0.02em', lineHeight: 1.2, margin: '40px 0 16px',
      }}>
        {block.text}
      </h2>
    )
  }
  if (block.type === 'ul') {
    return (
      <ul key={i} style={{ margin: '0 0 20px', paddingLeft: '22px', display: 'grid', gap: '10px' }}>
        {block.items.map((it, j) => (
          <li key={j} style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: 'var(--ink-soft)', lineHeight: 1.65 }}>
            {renderInline(it)}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <p key={i} style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: '20px' }}>
      {renderInline(block.text)}
    </p>
  )
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const url = `${SITE_URL}/blog/${post.slug}`
  const others = getAllPosts().filter((p) => p.slug !== post.slug).slice(0, 2)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'pt-BR',
    articleSection: post.category,
    author: { '@type': 'Organization', name: 'Leadboss Ads', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Leadboss Ads',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/leadboss-logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <SiteNav />

      <article style={{ padding: 'clamp(40px, 7vw, 72px) 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <Link href="/blog" className="nav-link" style={{ fontSize: '14px', color: 'var(--ink-soft)', display: 'inline-block', marginBottom: '24px' }}>
            ← Voltar para o blog
          </Link>

          {/* Cabeçalho */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <span className="brand-caps" style={{ color: 'var(--accent)', marginBottom: 0 }}>{post.category}</span>
            <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
              {formatDate(post.date)} · {post.readingMinutes} min de leitura
            </span>
          </div>
          <h1 className="font-serif" style={{
            fontSize: 'clamp(30px, 5vw, 50px)', fontWeight: 600,
            letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: '32px',
          }}>
            {post.title}
          </h1>

          {/* Corpo */}
          <div>{post.body.map((block, i) => renderBlock(block, i))}</div>

          {/* CTA de fim de artigo (peak-end) */}
          <div style={{
            marginTop: '48px', padding: 'clamp(28px, 4vw, 40px)',
            background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '10px',
            textAlign: 'center',
          }}>
            <h2 className="font-serif" style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '12px' }}>
              Quer aplicar isso no seu negócio?
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '24px', maxWidth: '460px', margin: '0 auto 24px' }}>
              Fazemos um diagnóstico do seu cenário e mostramos onde estão as oportunidades — sem compromisso.
            </p>
            <a href={WHATSAPP_URL} target="_blank" className="btn-primary" style={{
              display: 'inline-block', padding: '14px 30px', borderRadius: '4px',
              background: 'var(--ink)', color: 'var(--bg)', fontWeight: 500, fontSize: '15px',
            }}>
              Falar com um especialista →
            </a>
          </div>

          {/* Outros artigos */}
          {others.length > 0 && (
            <div style={{ marginTop: '56px', paddingTop: '32px', borderTop: '1px solid var(--line)' }}>
              <div className="brand-caps" style={{ marginBottom: '20px' }}>* Continue lendo</div>
              <div style={{ display: 'grid', gap: '16px' }}>
                {others.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="card-hover" style={{
                    display: 'block', background: 'var(--bg-card)', border: '1px solid var(--line)',
                    borderRadius: '8px', padding: '20px 24px',
                  }}>
                    <span className="brand-caps" style={{ color: 'var(--accent)', marginBottom: 0, fontSize: '11px' }}>{p.category}</span>
                    <div className="font-serif" style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3, marginTop: '8px' }}>
                      {p.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <SiteFooter />
      <MicroInteractions />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    </main>
  )
}
