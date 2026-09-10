import { getPayload, type Where } from 'payload'
import config from '@payload-config'

import { publicHeaders } from '@/utilities/discovery'

export const dynamic = 'force-dynamic'

const allowedResources = ['pages', 'suites', 'offers', 'posts'] as const
type Resource = (typeof allowedResources)[number]

const isResource = (value: string | null): value is Resource =>
  allowedResources.includes(value as Resource)

export async function GET(request: Request) {
  const url = new URL(request.url)
  const resource = url.searchParams.get('resource')
  const slug = url.searchParams.get('slug')
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 20, 1), 50)

  if (!isResource(resource)) {
    return Response.json(
      { error: 'Use resource=pages, suites, offers ou posts.' },
      { status: 400, headers: publicHeaders('application/json; charset=utf-8') },
    )
  }

  const payload = await getPayload({ config })
  const now = new Date().toISOString()
  const baseWhere: Where = { _status: { equals: 'published' } }
  const slugWhere: Where[] = slug ? [{ slug: { equals: slug } }] : []
  const where: Where =
    resource === 'offers'
      ? {
          and: [
            baseWhere,
            { or: [{ startsAt: { exists: false } }, { startsAt: { less_than_equal: now } }] },
            { or: [{ endsAt: { exists: false } }, { endsAt: { greater_than: now } }] },
            ...slugWhere,
          ],
        }
      : { and: [baseWhere, ...slugWhere] }

  const result = await payload.find({
    collection: resource,
    locale: 'pt-BR',
    depth: 1,
    limit,
    page: 1,
    sort: resource === 'posts' ? '-publishedAt' : 'title',
    where,
  })

  return Response.json(
    {
      resource,
      docs: result.docs,
      totalDocs: result.totalDocs,
      limit: result.limit,
      hasNextPage: result.hasNextPage,
    },
    { headers: publicHeaders('application/json; charset=utf-8') },
  )
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Methods': 'GET, OPTIONS', ...publicHeaders('text/plain') },
  })
}
