import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { OfferPage } from '@/components/OfferPage'
import { mediaUrl } from '@/utilities/site'

type Args = { params: Promise<{ slug: string }> }

const getOffer = async (slug: string) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'offers',
    locale: 'pt-BR',
    depth: 2,
    limit: 1,
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] as Record<string, any> | undefined
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const offer = await getOffer(slug)
  if (!offer) return {}
  const meta = offer.meta ?? {}
  return {
    title: meta.title || offer.title,
    description: meta.description || offer.summary || undefined,
    openGraph: {
      title: meta.title || offer.title,
      description: meta.description || offer.summary || undefined,
      images: meta.image ? [mediaUrl(meta.image)] : offer.image ? [mediaUrl(offer.image)] : [],
    },
  }
}

export default async function PromotionDetailPage({ params }: Args) {
  const { slug } = await params
  const offer = await getOffer(slug)
  if (!offer) notFound()
  return <OfferPage offer={offer} locale="pt-BR" />
}
