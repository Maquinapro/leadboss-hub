import type { Metadata } from 'next'
import { Fraunces, Inter_Tight } from 'next/font/google'
import './globals.css'
import DeferredScripts from '@/components/DeferredScripts'

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: 'variable',
  axes: ['opsz', 'SOFT', 'WONK'],
  display: 'swap',
})

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://leadboss.com.br'),
  title: {
    default: 'Leadboss Ads — Tráfego pago para negócios locais',
    template: '%s · Leadboss Ads',
  },
  description:
    'Agência de tráfego pago focada em faturamento. Gestão de anúncios em Meta, Google, LinkedIn e TikTok + landing pages que convertem, para negócios locais em todo o Brasil.',
  keywords: [
    'tráfego pago',
    'agência de tráfego pago',
    'gestão de anúncios',
    'Google Ads',
    'Meta Ads',
    'geração de leads',
    'marketing para negócios locais',
    'landing pages que convertem',
  ],
  authors: [{ name: 'Leadboss Ads' }],
  creator: 'Leadboss Ads',
  alternates: { canonical: 'https://leadboss.com.br' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://leadboss.com.br',
    siteName: 'Leadboss Ads',
    title: 'Leadboss Ads — Tráfego pago para negócios locais',
    description:
      'Gestão de tráfego em Meta, Google, LinkedIn e TikTok + landing pages que convertem. Marketing de performance focado no seu faturamento.',
    images: [{ url: '/leadboss-logo.png', alt: 'Leadboss Ads' }],
  },
  twitter: {
    card: 'summary',
    title: 'Leadboss Ads — Tráfego pago para negócios locais',
    description:
      'Marketing de performance focado em faturamento. Meta, Google, LinkedIn, TikTok e landing pages que convertem.',
    images: ['/leadboss-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  verification: {
    google: 'vnLNRAQ2OXCIA9yQiqwSdYsYm4xdPmVYbjBo7DIpRF4',
  },
}

// Dados estruturados: a IA do Google e os buscadores leem isto para entender o negócio
const businessSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': 'https://leadboss.com.br/#business',
  name: 'Leadboss Ads',
  description:
    'Agência de tráfego pago para negócios locais. Gestão de anúncios em Meta, Google, LinkedIn e TikTok e criação de landing pages, com foco em faturamento.',
  url: 'https://leadboss.com.br',
  logo: 'https://leadboss.com.br/leadboss-logo.png',
  image: 'https://leadboss.com.br/leadboss-logo.png',
  telephone: '+55-11-91713-9765',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Alameda Rio Negro, 503, Sala 2020 — Alphaville Centro Industrial e Empresarial',
    addressLocality: 'Barueri',
    addressRegion: 'SP',
    postalCode: '06454-000',
    addressCountry: 'BR',
  },
  areaServed: { '@type': 'Country', name: 'Brasil' },
  sameAs: [
    'https://www.instagram.com/leadboss.ads',
    'https://www.youtube.com/@leadboss_ads',
  ],
  knowsAbout: [
    'Tráfego pago',
    'Google Ads',
    'Meta Ads',
    'LinkedIn Ads',
    'TikTok Ads',
    'Geração de leads',
    'Landing pages',
    'Marketing de performance',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    bestRating: '5',
    ratingCount: '3',
    reviewCount: '3',
  },
  review: [
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Igor Sottani' },
      datePublished: '2026-06-09',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Agência excelente com atendimento personalizado e muito focado no crescimento e desenvolvimento do seu negócio. Super indico.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Luciana da Cunha' },
      datePublished: '2026-06-02',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Depois que conheci o Gustavo, abriu minha mente para detalhes que nunca tinha observado, me ajudou a faturar mais.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Antonio Ferraço Junior' },
      datePublished: '2026-05-26',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Agência de respeito e compromisso com cliente!',
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${interTight.variable}`}>
      <head>
        {/* Dados estruturados do negócio (Schema.org) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />

      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N2R38654"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {children}
        <DeferredScripts />
      </body>
    </html>
  )
}