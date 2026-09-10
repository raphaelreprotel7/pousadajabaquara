import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import config from '@payload-config'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { IconSprite } from '@/components/Icons'
import {
  FloatingActionsView,
  NewsletterView,
  SiteFooter,
  SiteHeader,
  TestimonialsSectionView,
} from '@/components/Chrome'
import type { BookingConfig } from '@/components/Interactive'
import { Popup, type PopupDoc } from '@/components/Popup'
import { engineUrl, engineUrlWithDates } from '@/utilities/site'

/**
 * Escolhe o pop-up desta página: ativo, dentro da vigência e com a segmentação
 * batendo. Havendo mais de um, ganha o de maior prioridade — só um por página,
 * porque dois pop-ups ao mesmo tempo não é campanha, é armadilha.
 */
const loadPopup = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  locale: Locale,
  pageId: unknown,
): Promise<PopupDoc | null> => {
  const agora = new Date().toISOString()

  const { docs } = await payload.find({
    collection: 'popups',
    locale,
    depth: 2,
    limit: 20,
    sort: '-priority',
    where: {
      and: [
        { isActive: { equals: true } },
        { or: [{ startsAt: { exists: false } }, { startsAt: { less_than_equal: agora } }] },
        { or: [{ endsAt: { exists: false } }, { endsAt: { greater_than_equal: agora } }] },
      ],
    },
  })

  const elegivel = (docs as Record<string, any>[]).find((p) => {
    if (p.showOn === 'all') return true
    const ids = (p.pages ?? []).map((x: any) => String(typeof x === 'object' ? x.id : x))
    const aqui = ids.includes(String(pageId))
    return p.showOn === 'only' ? aqui : !aqui
  })

  return (elegivel as PopupDoc) ?? null
}

export type Locale = 'pt-BR' | 'en'

/**
 * Carrega a página e tudo que é comum a todas elas.
 *
 * Cabeçalho, rodapé, barra de reserva, depoimentos, newsletter e ações
 * flutuantes vêm de globals — o editor não precisa (nem consegue) esquecer de
 * colocá-los em cada página.
 */
const load = async (slug: string, locale: Locale) => {
  const payload = await getPayload({ config })
  const { isEnabled: draft } = await draftMode()

  const [pages, header, footer, settings, booking, newsletter, testimonialsCfg, floating] =
    await Promise.all([
      payload.find({
        collection: 'pages',
        locale,
        draft,
        depth: 2,
        limit: 1,
        pagination: false,
        overrideAccess: draft,
        where: { slug: { equals: slug } },
      }),
      payload.findGlobal({ slug: 'header', locale, depth: 1 }),
      payload.findGlobal({ slug: 'footer', locale, depth: 1 }),
      payload.findGlobal({ slug: 'site-settings', locale, depth: 1 }),
      payload.findGlobal({ slug: 'booking-bar', locale, depth: 0 }),
      payload.findGlobal({ slug: 'newsletter-section', locale, depth: 1 }),
      payload.findGlobal({ slug: 'testimonials-section', locale, depth: 2 }),
      payload.findGlobal({ slug: 'floating-actions', locale, depth: 0 }),
    ])

  return {
    payload,
    page: pages.docs?.[0] as Record<string, any> | undefined,
    header: header as Record<string, any>,
    footer: footer as Record<string, any>,
    settings: settings as Record<string, any>,
    booking: booking as unknown as BookingConfig,
    newsletter: newsletter as Record<string, any>,
    testimonialsCfg: testimonialsCfg as Record<string, any>,
    floating: floating as Record<string, any>,
  }
}

export const buildMetadata = async (slug: string, locale: Locale): Promise<Metadata> => {
  const { page } = await load(slug, locale)
  if (!page) return {}

  const meta = page.meta ?? {}
  return {
    title: meta.title || page.title,
    description: meta.description || undefined,
    openGraph: {
      title: meta.title || page.title,
      description: meta.description || undefined,
    },
  }
}

/** Resolve os depoimentos exibidos: escolha manual ou os primeiros da lista. */
const loadTestimonials = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  cfg: Record<string, any>,
  locale: Locale,
) => {
  if (cfg?.source === 'manual') {
    return (cfg.items ?? []).filter((i: unknown) => typeof i === 'object' && i !== null)
  }

  const res = await payload.find({
    collection: 'testimonials',
    locale,
    depth: 0,
    limit: cfg?.limit ?? 3,
    sort: 'order',
  })
  return res.docs as Record<string, any>[]
}

export const PageView = async ({ slug, locale }: { slug: string; locale: Locale }) => {
  const {
    payload,
    page,
    header,
    footer,
    settings,
    booking,
    newsletter,
    testimonialsCfg,
    floating,
  } = await load(slug, locale)

  if (!page) notFound()

  const [testimonials, popup] = await Promise.all([
    page.showTestimonials ? loadTestimonials(payload, testimonialsCfg, locale) : [],
    loadPopup(payload, locale, page.id),
  ])

  const currentPath = slug === 'home' ? '/' : `/${slug}`

  return (
    <>
      <IconSprite />

      {/* O cabeçalho é transparente por cima do banner. Numa página que não
          começa com banner (contato, obrigado), o texto branco cairia sobre
          fundo branco e o menu sumia — nesse caso ele ganha fundo sólido. */}
      <SiteHeader
        settings={settings}
        header={header}
        booking={booking}
        currentPath={currentPath}
        sobreBanner={['hero', 'pageHero'].includes(
          (page.layout as Record<string, any>[] | undefined)?.[0]?.blockType,
        )}
      />

      <main>
        {/* Por padrão os depoimentos vêm depois de todos os blocos. A home do
            cliente os coloca antes das dúvidas frequentes, então a página pode
            dizer após qual bloco a seção entra. */}
        {(() => {
          const blocos: Record<string, any>[] = page.layout ?? []
          const corte = Number(page.testimonialsAfterBlock)
          const parte =
            page.showTestimonials !== false && Number.isFinite(corte) && corte >= 1
              ? Math.min(Math.trunc(corte), blocos.length)
              : null
          const ctx = {
            payload,
            locale,
            settings,
            booking,
            showBookingBar: page.showBookingBar !== false,
          }
          const depoimentos = page.showTestimonials !== false && (
            <TestimonialsSectionView section={testimonialsCfg} items={testimonials} />
          )

          if (parte === null) {
            return (
              <>
                <RenderBlocks blocks={blocos} ctx={ctx} />
                {depoimentos}
              </>
            )
          }
          return (
            <>
              <RenderBlocks blocks={blocos.slice(0, parte)} ctx={ctx} />
              {depoimentos}
              <RenderBlocks blocks={blocos.slice(parte)} ctx={ctx} />
            </>
          )
        })()}

        {page.showNewsletter !== false && (
          <NewsletterView
            section={newsletter}
            variant={page.newsletterVariant === 'home' ? 'home' : 'inner'}
          />
        )}
      </main>

      <SiteFooter settings={settings} footer={footer} />

      <FloatingActionsView actions={floating} settings={settings} booking={booking} />

      {popup ? (
        <Popup
          popup={popup}
          engineHref={
            popup.ctaType === 'engineDates' && popup.ctaCheckIn && popup.ctaCheckOut
              ? engineUrlWithDates(
                  booking,
                  popup.ctaCheckIn,
                  popup.ctaCheckOut,
                  booking?.defaultGuests ?? 2,
                )
              : engineUrl(booking)
          }
        />
      ) : null}
    </>
  )
}
