import { MetadataRoute } from 'next'
import { GAME_META } from '@/lib/gameMeta'
import { TOPIC_META } from '@/lib/topicMeta'

const BASE = 'https://kawaiicouple.roastlabai.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const core: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/games`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/auth`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
  const games: MetadataRoute.Sitemap = GAME_META.map((g) => ({
    url: `${BASE}/games/${g.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))
  const topics: MetadataRoute.Sitemap = TOPIC_META.map((t) => ({
    url: `${BASE}/play/${t.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.85,
  }))
  return [...core, ...games, ...topics]
}
