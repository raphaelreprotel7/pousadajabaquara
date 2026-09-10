import React from 'react'
import { getPayload, type Where } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import config from '@payload-config'

import { IconSprite, Icon } from '@/components/Icons'
import {
  FloatingActionsView,
  NewsletterView,
  SiteFooter,
  SiteHeader,
  TestimonialsSectionView,
} from '@/components/Chrome'
import type { BookingConfig } from '@/components/Interactive'
import { PromotionTabs } from '@/components/PromotionTabs'
import { imgProps, SIZES } from '@/utilities/image'
import { engineUrl, mediaAlt, mediaUrl, waUrl } from '@/utilities/site'

type Any = Record<string, any>

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(value))
    : null

const activeWhere = (now: string, currentId?: unknown): Where => {
  const and: Where[] = [
    { or: [{ startsAt: { exists: false } }, { startsAt: { less_than_equal: now } }] },
    { or: [{ endsAt: { exists: false } }, { endsAt: { greater_than_equal: now } }] },
  ]
  if (currentId !== undefined && currentId !== null) and.push({ id: { not_equals: currentId } })
  return { and }
}

const OfferCard = ({ offer }: { offer: Any }) => (
  <article className="promo-related__card">
    <a href={`/promocoes/${offer.slug}`}>
      <img
        className="img"
        {...imgProps(mediaUrl(offer.image), { sizes: SIZES.card })}
        alt={mediaAlt(offer.image, offer.title)}
      />
      <div>
        <h3>{offer.title}</h3>
        <span>Ver promoção →</span>
      </div>
    </a>
  </article>
)

export const OfferPage = async ({ offer, locale }: { offer: Any; locale: 'pt-BR' | 'en' }) => {
  const payload = await getPayload({ config })

  const [header, footer, settings, booking, newsletter, testimonialsCfg, floating, pageCfg] =
    await Promise.all([
      payload.findGlobal({ slug: 'header', locale, depth: 1 }),
      payload.findGlobal({ slug: 'footer', locale, depth: 1 }),
      payload.findGlobal({ slug: 'site-settings', locale, depth: 1 }),
      payload.findGlobal({ slug: 'booking-bar', locale, depth: 0 }),
      payload.findGlobal({ slug: 'newsletter-section', locale, depth: 1 }),
      payload.findGlobal({ slug: 'testimonials-section', locale, depth: 1 }),
      payload.findGlobal({ slug: 'floating-actions', locale, depth: 0 }),
      payload.findGlobal({ slug: 'promotion-page', locale, depth: 0 }),
    ])

  const cfg = pageCfg as Any
  const site = settings as Any
  const book = booking as unknown as BookingConfig
  const now = new Date().toISOString()

  let related = (offer.relatedOffers ?? []).filter((item: unknown) => typeof item === 'object')
  if (!related.length) {
    const result = await payload.find({
      collection: 'offers',
      locale,
      depth: 1,
      limit: 3,
      sort: '-startsAt',
      where: activeWhere(now, offer.id),
    })
    related = result.docs as Any[]
  }
  related = related.slice(0, 3)

  let testimonials: Any[] = []
  if (cfg.showTestimonials) {
    const result = await payload.find({
      collection: 'testimonials',
      locale,
      depth: 0,
      limit: (testimonialsCfg as Any)?.limit ?? 3,
      sort: 'order',
    })
    testimonials = result.docs as Any[]
  }

  const gallery = (offer.gallery ?? []).map((item: Any) => item.image).filter(Boolean)
  if (!gallery.length && offer.image) gallery.push(offer.image)
  const start = formatDate(offer.startsAt)
  const end = formatDate(offer.endsAt)
  const dateLabel = start && end ? `De ${start} até ${end}` : start ? `A partir de ${start}` : end ? `Até ${end}` : null
  const titleToken = (value: string) => value?.replaceAll('{title}', offer.title) ?? ''
  const nights = cfg.minimumNightsTemplate?.replace('{n}', String(offer.minimumNights))
  const whatsapp = `${waUrl(site)}?text=${encodeURIComponent(titleToken(cfg.whatsappMessage))}`
  const email = `mailto:${site.email}?subject=${encodeURIComponent(titleToken(cfg.emailSubject))}`

  return (
    <>
      <IconSprite />
      <SiteHeader settings={site} header={header as Any} booking={book} currentPath="/promocoes" />

      <main className="promo-page">
        <section className="promo-hero">
          <div className="shell promo-hero__grid">
            <div className={`promo-gallery promo-gallery--${Math.min(gallery.length, 4)}`}>
              {gallery.slice(0, 4).map((image: Any, index: number) => (
                <img
                  key={`${mediaUrl(image)}-${index}`}
                  className="img"
                  {...imgProps(mediaUrl(image), {
                    sizes: SIZES.half,
                    // Primeira foto da galeria é o LCP da página de promoção.
                    priority: index === 0,
                  })}
                  alt={mediaAlt(image, `${offer.title} — foto ${index + 1}`)}
                />
              ))}
            </div>

            <div className="promo-summary">
              <p className="eyebrow">Promoção</p>
              <h1>{offer.title}</h1>
              {dateLabel ? <p className="promo-summary__dates">{dateLabel}</p> : null}
              {offer.highlight ? <p className="promo-summary__highlight">{offer.highlight}</p> : null}
              {offer.minimumNights ? <p className="promo-summary__nights">{nights}</p> : null}

              <div className="promo-summary__actions">
                {cfg.showWhatsapp !== false ? (
                  <a href={whatsapp} target="_blank" rel="noopener" className="promo-action">
                    {offer.whatsappLabel || cfg.whatsappLabel} <Icon name="i-wa" />
                  </a>
                ) : null}
                {cfg.showEmail !== false ? (
                  <a href={email} className="promo-action">
                    {offer.emailLabel || cfg.emailLabel} <Icon name="i-mail" />
                  </a>
                ) : null}
                {cfg.showEngine !== false ? (
                  <a href={engineUrl(book)} target="_blank" rel="noopener" className="promo-action promo-action--primary">
                    {offer.engineLabel || cfg.engineLabel} <Icon name="i-cal" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {offer.description ? (
          <section className="promo-description shell">
            <RichText data={offer.description} />
          </section>
        ) : null}

        {offer.conditions || offer.validityRules ? (
          <section className="promo-rules shell">
            <h2>{cfg.regulationTitle || 'Regulamento'}</h2>
            <PromotionTabs
              tabs={[
                {
                  id: 'conditions',
                  label: cfg.conditionsLabel || 'Condições',
                  content: offer.conditions ? <RichText data={offer.conditions} /> : null,
                },
                {
                  id: 'validity',
                  label: cfg.validityLabel || 'Validade',
                  content: offer.validityRules ? <RichText data={offer.validityRules} /> : null,
                },
              ]}
            />
          </section>
        ) : null}

        {related.length ? (
          <section className="promo-related">
            <div className="shell">
              <h2>{cfg.relatedTitle || 'Outras promoções'}</h2>
              <div className="promo-related__grid">
                {related.map((item: Any) => <OfferCard key={item.id} offer={item} />)}
              </div>
            </div>
          </section>
        ) : null}

        {cfg.showTestimonials ? (
          <TestimonialsSectionView section={testimonialsCfg as Any} items={testimonials} />
        ) : null}
        {cfg.showNewsletter !== false ? (
          <NewsletterView section={newsletter as Any} variant="inner" />
        ) : null}
      </main>

      <SiteFooter settings={site} footer={footer as Any} />
      <FloatingActionsView actions={floating as Any} settings={site} booking={book} />
    </>
  )
}
