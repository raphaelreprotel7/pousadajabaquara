import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import config from '@payload-config'

import { IconSprite } from '@/components/Icons'
import {
  FloatingActionsView,
  NewsletterView,
  SiteFooter,
  SiteHeader,
} from '@/components/Chrome'
import { BookingBar, type BookingConfig } from '@/components/Interactive'
import { imgProps, SIZES } from '@/utilities/image'
import { mediaAlt, mediaUrl, splitHighlight } from '@/utilities/site'

type Args = { params: Promise<{ slug: string }> }
type Any = Record<string, any>

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    limit: 200,
    pagination: false,
    select: { slug: true },
    where: { _status: { equals: 'published' } },
  })
  return (docs ?? []).map((d) => ({ slug: String(d.slug) }))
}

const load = async (slug: string) => {
  const payload = await getPayload({ config })

  const [posts, header, footer, settings, booking, newsletter, floating] =
    await Promise.all([
      payload.find({
        collection: 'posts',
        locale: 'pt-BR',
        depth: 2,
        limit: 1,
        pagination: false,
        where: { slug: { equals: slug } },
      }),
      payload.findGlobal({ slug: 'header', locale: 'pt-BR', depth: 1 }),
      payload.findGlobal({ slug: 'footer', locale: 'pt-BR', depth: 1 }),
      payload.findGlobal({ slug: 'site-settings', locale: 'pt-BR', depth: 1 }),
      payload.findGlobal({ slug: 'booking-bar', locale: 'pt-BR', depth: 0 }),
      payload.findGlobal({ slug: 'newsletter-section', locale: 'pt-BR', depth: 1 }),
      payload.findGlobal({ slug: 'floating-actions', locale: 'pt-BR', depth: 0 }),
    ])

  return {
    payload,
    post: posts.docs?.[0] as Any | undefined,
    header: header as Any,
    footer: footer as Any,
    settings: settings as Any,
    booking: booking as unknown as BookingConfig,
    newsletter: newsletter as Any,
    floating: floating as Any,
  }
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const { post } = await load(slug)
  if (!post) return {}
  return {
    title: post.meta?.title || post.title,
    description: post.meta?.description || post.excerpt,
  }
}

/**
 * Página de artigo.
 *
 * Mesmo esqueleto das demais (banner, seções fixas, rodapé), com o corpo do
 * texto em coluna única e a faixa "Você também pode gostar". Os relacionados
 * saem do campo do post; vazio, cai nos mais recentes.
 */
export default async function ArticlePage({ params }: Args) {
  const { slug } = await params
  const { payload, post, header, footer, settings, booking, newsletter, floating } =
    await load(slug)

  if (!post) notFound()

  let related: Any[] = (post.relatedPosts ?? []).filter(
    (p: unknown) => typeof p === 'object' && p !== null,
  )

  if (!related.length) {
    const res = await payload.find({
      collection: 'posts',
      locale: 'pt-BR',
      depth: 1,
      limit: 3,
      sort: '-publishedAt',
      where: { id: { not_equals: post.id } },
    })
    related = res.docs as Any[]
  }

  const { head, tail } = splitHighlight('Você também pode gostar')

  return (
    <>
      <IconSprite />

      <SiteHeader
        settings={settings}
        header={header}
        booking={booking}
        currentPath="/blog"
      />

      <main>
        <section className="pagehero">
          <img
            className="img pagehero__media"
            {...imgProps(mediaUrl(post.image), { sizes: SIZES.full, priority: true })}
            alt={mediaAlt(post.image, post.title)}
          />
          <div className="pagehero__scrim" />
          <div className="pagehero__inner">
            <h1 className="pagehero__title pagehero__title--artigo">{post.title}</h1>
          </div>
          <BookingBar config={booking} />
        </section>

        <section className="sec">
          <div className="shell">
            <article className="artigo">
              <img
                className="img artigo__media"
                {...imgProps(mediaUrl(post.image), { sizes: SIZES.half })}
                alt={mediaAlt(post.image, post.title)}
              />
              {post.lead ? <p className="artigo__lead">{post.lead}</p> : null}
              <div className="artigo__corpo">
                <RichText data={post.content} />
              </div>
            </article>
          </div>
        </section>

        {related.length > 0 && (
          <section className="sec sec--gray">
            <div className="shell">
              <div className="section-head">
                <h2 className="h-section">
                  {head} <strong>{tail}</strong>
                </h2>
              </div>
              <div className="posts">
                {related.map((p) => (
                  <article className="post" key={p.id}>
                    <a href={`/blog/${p.slug}`}>
                      <img
                        className="img post__media"
                        {...imgProps(mediaUrl(p.image), { sizes: SIZES.card })}
                        alt={mediaAlt(p.image, p.title)}
                      />
                    </a>
                    <div className="post__body">
                      <p className="post__meta">
                        {typeof p.category === 'object' ? p.category?.title : 'Novidades'}
                      </p>
                      <h3 className="post__title">
                        <a href={`/blog/${p.slug}`}>{p.title}</a>
                      </h3>
                      <p className="post__text">{p.excerpt}</p>
                      <a href={`/blog/${p.slug}`} className="link-arrow link-arrow--sm">
                        Saiba Mais »
                      </a>
                    </div>
                  </article>
                ))}
              </div>
              <p style={{ textAlign: 'center', margin: '42px 0 0' }}>
                <a href="/blog" className="link-arrow">
                  Ver todos os artigos <span>→</span>
                </a>
              </p>
            </div>
          </section>
        )}

        <NewsletterView section={newsletter} variant="inner" />
      </main>

      <SiteFooter settings={settings} footer={footer} />
      <FloatingActionsView actions={floating} settings={settings} booking={booking} />
    </>
  )
}
