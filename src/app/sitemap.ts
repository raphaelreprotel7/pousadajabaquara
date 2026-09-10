import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

import { canonicalOrigin } from '@/utilities/discovery'

export const revalidate = 3600

type PublicDoc = {
  slug?: string | null
  updatedAt?: string | null
  startsAt?: string | null
  endsAt?: string | null
}

const modified = (doc: PublicDoc): Date =>
  doc.updatedAt ? new Date(doc.updatedAt) : new Date('2026-01-01T00:00:00.000Z')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const origin = canonicalOrigin()
  const now = new Date().toISOString()

  const [pages, posts, offers] = await Promise.all([
    payload.find({
      collection: 'pages',
      limit: 200,
      pagination: false,
      select: { slug: true, updatedAt: true },
      where: { _status: { equals: 'published' } },
    }),
    payload.find({
      collection: 'posts',
      limit: 200,
      pagination: false,
      select: { slug: true, updatedAt: true },
      where: { _status: { equals: 'published' } },
    }),
    payload.find({
      collection: 'offers',
      limit: 200,
      pagination: false,
      select: { slug: true, updatedAt: true, startsAt: true, endsAt: true },
      where: {
        and: [
          { _status: { equals: 'published' } },
          { or: [{ startsAt: { exists: false } }, { startsAt: { less_than_equal: now } }] },
          { or: [{ endsAt: { exists: false } }, { endsAt: { greater_than: now } }] },
        ],
      },
    }),
  ])

  const entries: MetadataRoute.Sitemap = []

  for (const page of pages.docs as PublicDoc[]) {
    if (!page.slug) continue
    entries.push({
      url: page.slug === 'home' ? origin : `${origin}/${page.slug}`,
      lastModified: modified(page),
      changeFrequency: page.slug === 'home' ? 'weekly' : 'monthly',
      priority: page.slug === 'home' ? 1 : 0.8,
    })
  }

  for (const post of posts.docs as PublicDoc[]) {
    if (!post.slug) continue
    entries.push({
      url: `${origin}/blog/${post.slug}`,
      lastModified: modified(post),
      changeFrequency: 'monthly',
      priority: 0.65,
    })
  }

  for (const offer of offers.docs as PublicDoc[]) {
    if (!offer.slug) continue
    entries.push({
      url: `${origin}/promocoes/${offer.slug}`,
      lastModified: modified(offer),
      changeFrequency: 'weekly',
      priority: 0.75,
    })
  }

  return entries.sort((a, b) => a.url.localeCompare(b.url))
}
