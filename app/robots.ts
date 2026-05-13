import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/game/', '/lobby/', '/results/', '/setup'],
    },
    sitemap: 'https://kawaiicouple.roastlabai.com/sitemap.xml',
  }
}
