import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import MicroInteractions from '@/components/MicroInteractions'
import { getAllPosts, formatDate } from '@/lib/posts'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Blog — tráfego pago e crescimento para negócios locais',
  description:
    'Artigos práticos sobre tráfego pago, Google Ads, Meta Ads e geração de leads para negócios locais. Estratégias diretas, sem enrolação.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/blog`,
    title: 'Blog Leadboss Ads — tráfego pago para negócios locais',
    description:
      'Artigos práticos sobre tráfego pago, Google Ads, Meta Ads e geração de leads para negócios locais.',
  },
}

export default function BlogIndex() {
  const posts = getAllPosts()

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog#blog`,
    name: 'Blog Leadboss Ads',
    description:
      'Artigos sobre tráfego pago, Google Ads, Meta Ads e geração de leads para negócios locais.',
    url: `${SITE_URL}/blog`,
    publisher: { '@type': 'Organization', name: 'Leadboss Ads', url: SITE_URL },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      url: `${SITE_URL}/blog/${p.slug}`,
    })),
  }

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <SiteNav />

      {/* Cabeçalho */}
      <section style={{ padding: 'clamp(48px, 8vw, 88px) 24px clamp(32px, 5vw, 48px)' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <div className="brand-caps" style={{ marginBottom: '16px', color: 'var(--accent)' }}>* Blog</div>
          <h1 className="font-serif" style={{
            fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 600,
            letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '20px',
          }}>
            Conteúdo sobre tráfego <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>e crescimento.</em>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            Estratégias diretas sobre tráfego pago, Google Ads, Meta Ads e geração de leads — para você decidir melhor onde investir.
          </p>
        </div>
      </section>

      {/* Lista de posts */}
      <section style={{ padding: '0 24px clamp(60px, 10vw, 100px)' }}>
        <div data-reveal-stagger style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '20px' }}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="card-hover" style={{
              display: 'block', background: 'var(--bg-card)', border: '1px solid var(--line)',
              borderRadius: '8px', padding: 'clamp(24px, 4vw, 36px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <span className="brand-caps" style={{ color: 'var(--accent)', marginBottom: 0 }}>{post.category}</span>
                <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                  {formatDate(post.date)} · {post.readingMinutes} min de leitura
                </span>
              </div>
              <h2 className="font-serif" style={{
                fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 600,
                letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '12px',
              }}>
                {post.title}
              </h2>
              <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '16px' }}>
                {post.description}
              </p>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)' }}>
                Ler artigo →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
      <MicroInteractions />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
    </main>
  )
}
