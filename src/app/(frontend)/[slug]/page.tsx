import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

import { PageView, buildMetadata } from '../PageView'

type Args = { params: Promise<{ slug: string }> }

/** Pré-renderiza as páginas publicadas. 'home' tem rota própria. */
export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    limit: 200,
    pagination: false,
    select: { slug: true },
    where: { _status: { equals: 'published' } },
  })

  return (docs ?? [])
    .map((doc) => ({ slug: String(doc.slug) }))
    .filter(({ slug }) => slug && slug !== 'home')
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  return buildMetadata(slug, 'pt-BR')
}

export default async function DynamicPage({ params }: Args) {
  const { slug } = await params
  return <PageView slug={slug} locale="pt-BR" />
}
