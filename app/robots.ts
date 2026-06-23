import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/sistema/'],
    },
    sitemap: 'https://leadboss.com.br/sitemap.xml',
    host: 'https://leadboss.com.br',
  }
}
