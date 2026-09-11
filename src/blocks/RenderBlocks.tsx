import React from 'react'
import type { Payload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { Icon } from '@/components/Icons'
import {
  BookingBar,
  FaqList,
  GalleryGrid,
  MapView,
  IgTrack,
  MidiaCarrossel,
  RoomGallery,
  SuitesTrack,
  type BookingConfig,
} from '@/components/Interactive'
import { PayloadForm, type PayloadFormDoc } from '@/components/PayloadForm'
import { imgProps, SIZES } from '@/utilities/image'
import {
  engineUrl,
  formatDistance,
  mediaAlt,
  mediaUrl,
  labelReservas,
  splitHighlight,
  telUrl,
  telUrlReservas,
  waUrl,
} from '@/utilities/site'

type Any = Record<string, any>

type Ctx = {
  payload: Payload
  locale: 'pt-BR' | 'en'
  settings: Any
  booking: BookingConfig
  showBookingBar: boolean
}

/** Classe de fundo da seção. No verde da marca o texto inverte para branco. */
const fundoSecao = (valor?: string | null) =>
  valor === 'gray' ? ' sec--gray' : valor === 'brand' ? ' sec--verde' : ''

const Head = ({ title }: { title?: string | null }) => {
  if (!title) return null
  const { head, tail } = splitHighlight(title)
  return (
    <div className="section-head">
      <h2 className="h-section">
        {head} <strong>{tail}</strong>
      </h2>
    </div>
  )
}

const Cta = ({
  label,
  useEngine,
  booking,
  href,
}: {
  label?: string | null
  useEngine?: boolean | null
  booking: BookingConfig
  href?: string
}) => {
  if (!label) return null
  const target = useEngine ? engineUrl(booking) : (href ?? '#reserva')
  return (
    <a
      href={target}
      className="btn btn--red"
      {...(useEngine ? { target: '_blank', rel: 'noopener' } : {})}
    >
      {label}
    </a>
  )
}

/**
 * Renderiza os blocos na ordem montada no admin.
 *
 * A marcação emitida é a mesma do site estático — as classes do styles.css não
 * mudaram. Blocos que precisam consultar o banco (suítes, dúvidas, galeria)
 * fazem isso aqui, no servidor.
 */
export const RenderBlocks = async ({
  blocks,
  ctx,
}: {
  blocks?: Any[] | null
  ctx: Ctx
}) => {
  if (!blocks?.length) return null
  const { payload, locale, settings, booking, showBookingBar } = ctx

  const rendered = await Promise.all(
    blocks.map(async (b, i) => {
      const key = b.id ?? `${b.blockType}-${i}`

      switch (b.blockType) {
        /* ------------------------------ BANNERS ------------------------- */
        case 'hero':
          return (
            <section className="hero" id="inicio" key={key}>
              {/* Elemento LCP da home: única imagem que sai do lazy. */}
              <img
                className="img hero__media"
                {...imgProps(mediaUrl(b.image), { sizes: SIZES.full, priority: true })}
                alt={mediaAlt(b.image)}
              />
              <div className="hero__scrim" />
              {showBookingBar && <BookingBar config={booking} />}
            </section>
          )

        case 'pageHero': {
          const isArticle = b.variant === 'article'
          return (
            <section className="pagehero" key={key}>
              {/* LCP das páginas internas. */}
              <img
                className="img pagehero__media"
                {...imgProps(mediaUrl(b.image), { sizes: SIZES.full, priority: true })}
                alt={mediaAlt(b.image)}
              />
              <div className="pagehero__scrim" />
              <div className="pagehero__inner">
                <h1
                  className={`pagehero__title${isArticle ? ' pagehero__title--artigo' : ''}`}
                >
                  {b.title}
                </h1>
                {!isArticle && b.showTagline !== false && settings?.tagline ? (
                  <p className="pagehero__tag">{settings.tagline}</p>
                ) : null}
              </div>
              {showBookingBar && <BookingBar config={booking} />}
            </section>
          )
        }

        /* ----------------------------- CONTEÚDO ------------------------- */
        case 'about':
          return (
            <section className="about" key={key}>
              <div className="shell about__grid">
                <img
                  className="img about__media"
                  {...imgProps(mediaUrl(b.image), { sizes: SIZES.half })}
                  alt={mediaAlt(b.image)}
                />
                <div className="about__body">
                  {b.eyebrow ? <p className="eyebrow">{b.eyebrow}</p> : null}
                  <h2 className="about__title">{b.title}</h2>
                  {b.text ? <p>{b.text}</p> : null}
                  <Cta label={b.ctaLabel} useEngine={b.ctaUsesEngine} booking={booking} />
                </div>
              </div>
            </section>
          )

        /* --- Sobre com mosaico de 4 fotos (home da Pousada Recanto do Jabaquara) --- */
        case 'aboutMosaic': {
          const imgs: Any[] = b.images ?? []
          const paras = String(b.text ?? '')
            .split(/\n\s*\n/)
            .map((p: string) => p.trim())
            .filter(Boolean)

          return (
            <section className="mosaic" key={key}>
              <div className={`shell mosaic__grid${b.reverse ? ' mosaic__grid--rev' : ''}`}>
                {/* Duas colunas independentes, não uma grade 2x2: numa grade a
                    altura da linha é ditada pela foto mais alta, e sobra um vão
                    embaixo da menor. Coluna 1 = fotos 1 e 3; coluna 2 = 2 e 4. */}
                <div className="mosaic__tiles">
                  {[
                    [0, 2],
                    [1, 3],
                  ].map((indices, coluna) => (
                    <div
                      key={coluna}
                      className={`mosaic__col${coluna === 1 ? ' mosaic__col--baixa' : ''}`}
                    >
                      {indices
                        .map((i) => imgs[i])
                        .filter(Boolean)
                        .map((it, n) => (
                          /* A moldura fixa a caixa e recorta o zoom: no hover a
                             foto aproxima por dentro, sem empurrar o layout. */
                          <span
                            key={n}
                            className={`mosaic__moldura mosaic__moldura--${n === 0 ? 'a' : 'b'}`}
                          >
                            <img
                              className="img mosaic__tile"
                              {...imgProps(mediaUrl(it.image), { sizes: SIZES.half })}
                              alt={mediaAlt(it.image)}
                            />
                          </span>
                        ))}
                    </div>
                  ))}
                </div>
                <div className="mosaic__body">
                  {b.eyebrow ? <p className="eyebrow">{b.eyebrow}</p> : null}
                  <h2 className="mosaic__title">{b.title}</h2>
                  {paras.map((p: string, n: number) => (
                    <p key={n}>{p}</p>
                  ))}
                  <Cta label={b.ctaLabel} useEngine={b.ctaUsesEngine} booking={booking} />
                </div>
              </div>
            </section>
          )
        }

        /* --- Região: foto sangrada com card flutuante --- */
        case 'regionCard':
          return (
            <section className="regioncard" key={key}>
              <img
                className="img regioncard__media"
                {...imgProps(mediaUrl(b.image), { sizes: SIZES.full })}
                alt={mediaAlt(b.image)}
              />
              <div
                className={`shell regioncard__shell regioncard__shell--${b.align ?? 'right'}`}
              >
                <div className="regioncard__card">
                  {b.eyebrow ? <p className="eyebrow">{b.eyebrow}</p> : null}
                  <h2 className="regioncard__title">{b.title}</h2>
                  {b.text ? <p>{b.text}</p> : null}
                  <Cta label={b.ctaLabel} booking={booking} href={b.ctaHref ?? undefined} />
                </div>
              </div>
            </section>
          )

        /* --- Faixa do Instagram --- */
        case 'instagramStrip': {
          const imgs: Any[] = b.images ?? []
          const ig: Any | undefined = (settings?.socials ?? []).find(
            (s: Any) => s.network === 'instagram',
          )
          const handle = b.handle || ig?.handle || null

          return (
            <section className="igstrip" key={key}>
              <div className="shell">
                <div className="igstrip__head">
                  <span className="igstrip__rule" />
                  <h2 className="igstrip__title">{b.title}</h2>
                </div>
                <IgTrack>
                  {imgs.map((it, n) => (
                    <span key={n} className="igstrip__moldura">
                      <img
                        className="img igstrip__photo"
                        {...imgProps(mediaUrl(it.image), { sizes: SIZES.collage })}
                        alt={mediaAlt(it.image)}
                      />
                    </span>
                  ))}
                </IgTrack>
              </div>
              {handle ? (
                <a
                  className="igstrip__handle"
                  href={ig?.url ?? `https://instagram.com/${String(handle).replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener"
                >
                  <Icon name="i-ig" />
                  {handle}
                </a>
              ) : null}
            </section>
          )
        }

        case 'splitContent': {
          let amenities: Any[] = []
          if (b.amenitiesScope && b.amenitiesScope !== 'none') {
            const res = await payload.find({
              collection: 'amenities',
              locale,
              depth: 0,
              limit: 50,
              sort: 'order',
              where: { scope: { equals: b.amenitiesScope } },
            })
            amenities = res.docs as Any[]
          }

          const images: Any[] = b.images ?? []
          /* A coluna de mídia mostra tudo num carrossel: a foto principal e as
             que antes ficavam jogadas numa fileira solta abaixo da seção. */
          const midias: Any[] = [...images, ...((b.gallery ?? []) as Any[])]
          const { head, tail } = splitHighlight(b.title ?? '')

          return (
            <section
              className={`sec${fundoSecao(b.background)}`}
              key={key}
            >
              <div className={`shell split${b.reverse ? ' split--rev' : ''}`}>
                {b.reverse && midias.length > 0 ? (
                  <div className="split__media">
                    <MidiaCarrossel>
                      {midias.map((im) => (
                        <img
                          key={mediaUrl(im.image)}
                          className="img"
                          {...imgProps(mediaUrl(im.image), { sizes: SIZES.half })}
                          alt={mediaAlt(im.image)}
                        />
                      ))}
                    </MidiaCarrossel>
                  </div>
                ) : null}

                <div>
                  {b.eyebrow ? <p className="eyebrow">{b.eyebrow}</p> : null}
                  <h2 className="h-block">
                    {head} <strong>{tail}</strong>
                  </h2>
                  {b.text ? <p className="body-text">{b.text}</p> : null}
                  {amenities.length > 0 && (
                    <ul className="amen">
                      {amenities.map((a) => (
                        /* Cada comodidade mostra o próprio ícone; sem ícone
                           cadastrado, cai no losango genérico do CSS. */
                        <li key={a.id} className={a.icon ? 'amen__com-icone' : undefined}>
                          {a.icon ? <Icon name={a.icon} /> : null}
                          <span>{a.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {b.note ? <p className="note">{b.note}</p> : null}
                  <Cta label={b.ctaLabel} useEngine booking={booking} />
                </div>

                {!b.reverse && midias.length > 0 ? (
                  <div className="split__media">
                    <MidiaCarrossel>
                      {midias.map((im) => (
                        <img
                          key={mediaUrl(im.image)}
                          className="img"
                          {...imgProps(mediaUrl(im.image), { sizes: SIZES.half })}
                          alt={mediaAlt(im.image)}
                        />
                      ))}
                    </MidiaCarrossel>
                  </div>
                ) : null}
              </div>

            </section>
          )
        }

        /* --------------------------- DIFERENCIAIS ----------------------- */
        case 'differentials': {
          // No Payload, `limit: 0` significa SEM limite — o oposto do que o
          // editor quer dizer ao zerar o campo. Zero aqui é "nenhum": a home
          // usa só a faixa de fotos, e a página da pousada só as caixas.
          const nCards = b.cardsLimit ?? 3
          const nPerks = b.perksLimit ?? 6
          const vazio = { docs: [] as Any[] }
          const [cards, perks] = await Promise.all([
            nCards === 0
              ? vazio
              : payload.find({
                  collection: 'differentials',
                  locale,
                  depth: 1,
                  limit: nCards,
                  sort: 'order',
                  where: { kind: { equals: 'destaque' } },
                }),
            nPerks === 0
              ? vazio
              : payload.find({
                  collection: 'differentials',
                  locale,
                  depth: 0,
                  limit: nPerks,
                  sort: 'order',
                  where: { kind: { equals: 'venda' } },
                }),
          ])

          return (
            <section className="features" key={key}>
              <div className="shell">
                {b.title ? (
                  <div className="section-head">
                    <h2 className="h-section">{b.title}</h2>
                  </div>
                ) : null}

                <div className="features__cards">
                  {(cards.docs as Any[]).map((d) => (
                    <article className="fcard" key={d.id}>
                      <img
                        className="img"
                        {...imgProps(mediaUrl(d.image), { sizes: SIZES.card })}
                        alt={mediaAlt(d.image, d.title)}
                      />
                      <div className="fcard__veil" />
                      <h3 className="fcard__label">{d.title}</h3>
                    </article>
                  ))}
                </div>

                <div className="features__perks">
                  {(perks.docs as Any[]).map((d) => (
                    <div className="perk" key={d.id}>
                      <Icon name={d.icon} className="perk__icon" />
                      <span className="perk__label">{d.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        /* ------------------------------ SUÍTES -------------------------- */
        case 'suitesCarousel': {
          const res = await payload.find({
            collection: 'suites',
            locale,
            depth: 1,
            limit: 12,
            sort: 'order',
          })

          const cards = (res.docs as Any[]).map((s) => (
            <article className="suite" key={s.id}>
              <img
                className="img suite__media"
                {...imgProps(mediaUrl(s.photos?.[0]?.image), { sizes: SIZES.card })}
                alt={mediaAlt(s.photos?.[0]?.image, s.title)}
              />
              <div className="suite__body">
                <div className="suite__top">
                  <h3 className="suite__name">{s.shortName || s.title}</h3>
                </div>
                {s.summary ? <p className="suite__text">{s.summary}</p> : null}
                {/* Capacidade escrita, e o resto em ícones: no card não cabe a
                    lista inteira, e o ícone diz "tem ar-condicionado" mais
                    rápido do que a frase. A lista por extenso está a um clique,
                    em /acomodacoes. */}
                <div className="suite__chips">
                  {s.maxGuests ? (
                    <span className="suite__chip">
                      <Icon name="i-bed" />
                      {s.maxGuests} {s.maxGuests === 1 ? 'pessoa' : 'pessoas'}
                    </span>
                  ) : null}
                  {((s.amenities ?? []) as Any[])
                    /* `i-bed` fora: é o ícone do chip de capacidade, e dois
                       desenhos de cama lado a lado só confundem. */
                    .filter((a) => typeof a === 'object' && a?.icon && a.icon !== 'i-bed')
                    .slice(0, 6)
                    .map((a) => (
                      <span className="suite__icone" key={a.id ?? a.icon} title={a.title}>
                        <Icon name={a.icon} />
                        <span className="visualmente-oculto">{a.title}</span>
                      </span>
                    ))}
                </div>
                <a
                  href={`/acomodacoes#${s.slug}`}
                  className="link-arrow link-arrow--sm"
                >
                  Ver detalhes <span>→</span>
                </a>
              </div>
            </article>
          ))

          return (
            <section className="suites" id="acomodacoes" key={key}>
              <div className="shell suites__grid">
                <div className="suites__intro">
                  {b.eyebrow ? <p className="eyebrow">{b.eyebrow}</p> : null}
                  <h2>{b.title}</h2>
                  {b.text ? <p>{b.text}</p> : null}
                  {b.linkLabel ? (
                    <a href={b.linkHref ?? '/acomodacoes'} className="link-arrow">
                      {b.linkLabel} <span>→</span>
                    </a>
                  ) : null}
                </div>
                <SuitesTrack>{cards}</SuitesTrack>
              </div>
            </section>
          )
        }

        case 'roomList': {
          const res = await payload.find({
            collection: 'suites',
            locale,
            depth: 2,
            limit: 20,
            sort: 'order',
          })

          const temAbertura = Boolean(b.intro?.title || b.intro?.text)

          return (
            <React.Fragment key={key}>
              {temAbertura ? (
                <section className="sec sec--tight">
                  {/* Título de um lado, texto do outro. Empilhado e centrado
                      a abertura ocupava uma tela inteira antes do primeiro
                      quarto. Sem estilo em linha: tamanhos vêm do sistema. */}
                  <div className="shell roomintro">
                    {b.intro?.title ? <h2 className="h-block">{b.intro.title}</h2> : null}
                    <div className="roomintro__lado">
                      {b.intro?.text ? <p className="body-text">{b.intro.text}</p> : null}
                      <Cta label={b.intro?.ctaLabel} useEngine booking={booking} />
                    </div>
                  </div>
                </section>
              ) : null}

              {/* Sem estilo em linha: com abertura a lista encosta nela; sem
                  abertura ela precisa do respiro normal de seção. */}
              <section className={`sec${temAbertura ? ' sec--sem-topo' : ''}`}>
                <div className="shell">
                  {(res.docs as Any[]).map((s) => (
                    <article className="room" id={s.slug} key={s.id}>
                      <RoomGallery
                        photos={(s.photos ?? []).map((p: Any) => ({
                          src: mediaUrl(p.image),
                          alt: mediaAlt(p.image, s.title),
                        }))}
                      />
                      <div className="room__body">
                        <h3 className="room__name">{s.title}</h3>
                        <ul className="room__amen">
                          {(s.amenities ?? []).map((a: Any) => (
                            <li key={a.id ?? a}>
                              <Icon name={a.icon} />
                              {a.title}
                            </li>
                          ))}
                        </ul>
                        <a
                          href={engineUrl(booking)}
                          target="_blank"
                          rel="noopener"
                          className="btn btn--red"
                        >
                          Faça uma reserva
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </React.Fragment>
          )
        }

        /* ------------------------------ CIDADE -------------------------- */
        case 'cityBand':
          return (
            <React.Fragment key={key}>
              <section className="city">
                <div className="shell city__grid">
                  <div>
                    <h2 className="city__title">{b.title}</h2>
                    <p className="city__ghost">{b.ghost}</p>
                  </div>
                  {b.text ? <p className="city__text">{b.text}</p> : null}
                </div>
              </section>
              {b.image ? (
                <section className="cityband">
                  <img
                    className="img cityband__media"
                    {...imgProps(mediaUrl(b.image), { sizes: SIZES.full })}
                    alt={mediaAlt(b.image)}
                  />
                </section>
              ) : null}
            </React.Fragment>
          )

        /* ------------------------------ OFERTAS ------------------------- */
        case 'offers': {
          const now = new Date().toISOString()
          const res = await payload.find({
            collection: 'offers',
            locale,
            depth: 1,
            limit: b.limit ?? 2,
            where: {
              and: [
                { or: [{ startsAt: { exists: false } }, { startsAt: { less_than_equal: now } }] },
                { or: [{ endsAt: { exists: false } }, { endsAt: { greater_than_equal: now } }] },
              ],
            },
          })

          const { head, tail } = splitHighlight(b.title ?? '')

          return (
            <section className="offers" id="ofertas" key={key}>
              <div className="shell offers__grid">
                <div className="offers__intro">
                  {b.eyebrow ? <p className="eyebrow">{b.eyebrow}</p> : null}
                  <h2>
                    {head} <strong>{tail}</strong>
                  </h2>
                  {b.text ? <p>{b.text}</p> : null}
                  {b.linkLabel ? (
                    <a href="/promocoes" className="link-arrow">
                      {b.linkLabel} <span>→</span>
                    </a>
                  ) : null}
                </div>
                <div className="offers__cards">
                  {(res.docs as Any[]).map((o) => (
                    <article className="ocard" key={o.id}>
                      <img
                        className="img ocard__media"
                        {...imgProps(mediaUrl(o.image), { sizes: SIZES.card })}
                        alt={mediaAlt(o.image, o.title)}
                      />
                      <div className="ocard__body">
                        <h3 className="ocard__title">{o.title}</h3>
                        {o.summary ? <p className="ocard__text">{o.summary}</p> : null}
                        <div className="ocard__foot">
                          <a href={`/promocoes/${o.slug}`} className="link-arrow link-arrow--sm">
                            Saiba mais <span>→</span>
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        /* ------------------------------ SOCIAL -------------------------- */
        case 'social': {
          const { head, tail } = splitHighlight(b.title ?? '')
          const imgs: Any[] = b.images ?? []
          const socials: Any[] = settings?.socials ?? []

          return (
            <section className="social" id="fotos" key={key}>
              <div className="shell social__grid">
                <div className="collage">
                  <span className="shape shape--1" />
                  <span className="shape shape--2" />
                  <span className="shape shape--3" />
                  <span className="shape shape--4" />
                  {imgs[0] ? (
                    <img
                      className="img collage__a"
                      {...imgProps(mediaUrl(imgs[0].image), { sizes: SIZES.collage })}
                      alt={mediaAlt(imgs[0].image)}
                    />
                  ) : null}
                  {imgs[1] ? (
                    <img
                      className="img collage__b"
                      {...imgProps(mediaUrl(imgs[1].image), { sizes: SIZES.collage })}
                      alt={mediaAlt(imgs[1].image)}
                    />
                  ) : null}
                </div>
                <div className="social__body">
                  {b.lead ? (
                    <p className="lede" style={{ marginBottom: 18 }}>
                      {b.lead}
                    </p>
                  ) : null}
                  <h2>
                    {head} <strong>{tail}</strong>
                  </h2>
                  <div className="social__links">
                    {socials.map((s) => (
                      <a
                        className="slink"
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener"
                      >
                        <Icon name={s.network === 'instagram' ? 'i-ig' : 'i-fb'} />
                        {s.handle}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )
        }

        /* -------------------------------- FAQ --------------------------- */
        case 'faq': {
          const where =
            b.category && b.category !== 'todas'
              ? { category: { equals: b.category } }
              : undefined

          const res = await payload.find({
            collection: 'faqs',
            locale,
            depth: 0,
            limit: 50,
            sort: 'order',
            ...(where ? { where } : {}),
          })

          return (
            <section className="faq" key={key}>
              <div className="shell">
                <Head title={b.title} />
                <FaqList
                  items={(res.docs as Any[]).map((f) => ({
                    id: String(f.id),
                    question: f.question,
                    answer: <RichText data={f.answer} />,
                  }))}
                />
              </div>
            </section>
          )
        }

        /* ------------------------------ GALERIA ------------------------- */
        case 'gallery': {
          const [cats, photos] = await Promise.all([
            payload.find({
              collection: 'photo-categories',
              locale,
              depth: 0,
              limit: 20,
              sort: 'order',
            }),
            payload.find({
              collection: 'media',
              depth: 0,
              limit: 200,
              where: { category: { exists: true } },
            }),
          ])

          return (
            <section className="sec" key={key}>
              <div className="shell">
                <Head title={b.title} />
                <GalleryGrid
                  showFilters={b.showFilters !== false}
                  allLabel={b.allLabel ?? 'Todas'}
                  categories={(cats.docs as Any[]).map((c) => ({
                    id: String(c.id),
                    title: c.title,
                  }))}
                  photos={(photos.docs as Any[]).map((m) => ({
                    /* mediaUrl e obrigatorio: o Payload devolve `url` absoluta
                       (com NEXT_PUBLIC_SERVER_URL na frente) e o /_next/image
                       responde 400 para host que nao esta em remotePatterns.
                       Usar m.url cru quebra a pagina de fotos inteira. */
                    src: mediaUrl(m),
                    alt: m.alt ?? '',
                    category: m.category ? String(m.category) : null,
                  }))}
                />
              </div>
            </section>
          )
        }

        /* ---------------------------- LOCALIZAÇÃO ----------------------- */
        case 'location': {
          const res = await payload.find({
            collection: 'attractions',
            locale,
            depth: 0,
            limit: b.poiLimit ?? 9,
            sort: 'distanceMeters',
          })
          const { head, tail } = splitHighlight(b.title ?? '')

          return (
            <React.Fragment key={key}>
              <section className="sec">
                <div className="shell split">
                  <div>
                    {b.eyebrow ? <p className="eyebrow">{b.eyebrow}</p> : null}
                    <h2 className="h-block">
                      {head} <strong>{tail}</strong>
                    </h2>
                    {b.text ? <p className="body-text">{b.text}</p> : null}
                    <div className="loc__actions">
                      <a
                        href={engineUrl(booking)}
                        target="_blank"
                        rel="noopener"
                        className="btn btn--red"
                      >
                        Fazer reserva
                      </a>
                      <a
                        href={waUrl(settings)}
                        target="_blank"
                        rel="noopener"
                        className="btn btn--wa"
                      >
                        <Icon name="i-wa" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                  <div>
                    {b.poiTitle ? <p className="eyebrow">{b.poiTitle}</p> : null}
                    <ul className="poi">
                      {(res.docs as Any[]).map((a) => (
                        <li key={a.id}>
                          <b>{a.title}</b>
                          <span>{formatDistance(a.distanceMeters)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {b.showContactCards ? (
                <section className="sec sec--verde">
                  <div className="shell info3">
                    <div className="icard">
                      <Icon name="i-phone" />
                      <h3>Telefone</h3>
                      <p>
                        <a href={telUrl(settings)}>{settings?.phoneLabel}</a>
                      </p>
                    </div>
                    <div className="icard">
                      <Icon name="i-pin" />
                      <h3>Endereço</h3>
                      <p>{settings?.address}</p>
                    </div>
                    <div className="icard">
                      <Icon name="i-mail" />
                      <h3>Email</h3>
                      <p>
                        <a href={`mailto:${settings?.email}`}>{settings?.email}</a>
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              {b.showMap ? (
                <section className="mapa">
                  <MapView
                    lat={settings?.latitude ?? -23.5401686}
                    lon={settings?.longitude ?? -46.6377418}
                    zoom={settings?.mapZoom ?? 16}
                    tileUrl={settings?.tileUrl}
                    attribution={settings?.tileAttribution}
                    hotelName={settings?.hotelName ?? 'Hotel'}
                    address={settings?.address ?? ''}
                  />
                  <a
                    className="mapa__link"
                    href={`https://www.openstreetmap.org/?mlat=${settings?.latitude}&mlon=${settings?.longitude}`}
                    target="_blank"
                    rel="noopener"
                  >
                    Ver mapa maior
                  </a>
                </section>
              ) : null}
            </React.Fragment>
          )
        }

        /* ------------------------------- BLOG --------------------------- */
        case 'postList': {
          const res = await payload.find({
            collection: 'posts',
            locale,
            depth: 1,
            limit: b.limit ?? 9,
            sort: '-publishedAt',
          })

          return (
            <section className="sec" key={key}>
              <div className="shell">
                <Head title={b.title} />
                <div className="posts">
                  {(res.docs as Any[]).map((p) => (
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
                        <a
                          href={`/blog/${p.slug}`}
                          className="link-arrow link-arrow--sm"
                        >
                          Saiba Mais »
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        /* --------------------------- ESTADO VAZIO ----------------------- */
        case 'emptyState': {
          if (b.onlyWhenEmpty) {
            const now = new Date().toISOString()
            const res = await payload.find({
              collection: 'offers',
              depth: 0,
              limit: 1,
              where: {
                and: [
                  { or: [{ startsAt: { exists: false } }, { startsAt: { less_than_equal: now } }] },
                  { or: [{ endsAt: { exists: false } }, { endsAt: { greater_than_equal: now } }] },
                ],
              },
            })
            if (res.totalDocs > 0) return null
          }

          return (
            <section className="sec" key={key}>
              <div className="shell">
                <div className="empty">
                  <div className="empty__mark">
                    <Icon name="i-tag" />
                  </div>
                  <h2>{b.title}</h2>
                  {b.text ? <p>{b.text}</p> : null}
                  {b.ctaLabel ? (
                    <a href={b.ctaHref ?? '#newsletter'} className="btn btn--red">
                      {b.ctaLabel}
                    </a>
                  ) : null}
                </div>
              </div>
            </section>
          )
        }

        /* ------------------------------ CONTATO ------------------------- */
        case 'contact': {
          const { head, tail } = splitHighlight(b.title ?? '')
          return (
            <section className="sec" key={key}>
              {/* Sem título de card lateral, a central de reservas some e o
                  formulário ocupa a largura toda — numa página de vagas, por
                  exemplo, telefone de reservas não tem o que fazer ali. */}
              <div className={`shell contact__grid${b.asideTitle ? '' : ' contact__grid--so-form'}`}>
                <div>
                  {b.eyebrow ? <p className="eyebrow">{b.eyebrow}</p> : null}
                  <h2 className="h-block">
                    {head} <strong>{tail}</strong>
                  </h2>
                  {b.text ? <p className="body-text">{b.text}</p> : null}

                  {typeof b.form === 'object' && b.form ? (
                    <PayloadForm
                      form={b.form as PayloadFormDoc}
                      variant="contact"
                      consentText={
                        b.consentText ||
                        `Concordo em receber conteúdos sobre o ${settings?.hotelName}.`
                      }
                    />
                  ) : (
                    <form className="cform">
                      <div className="field">
                        <label htmlFor="nome">Nome</label>
                        <input id="nome" type="text" />
                      </div>
                      <div className="field">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" />
                      </div>
                      <div className="field field--full">
                        <label htmlFor="mensagem">Mensagem</label>
                        <textarea id="mensagem" />
                      </div>
                      <div className="field--full">
                        <button type="submit" className="btn btn--red">
                          Enviar
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {b.asideTitle ? (
                <aside className="central">
                  <h2>{b.asideTitle}</h2>
                  <ul>
                    <li>
                      <Icon name="i-phone" />
                      <div>
                        <small>Reservas</small>
                        <span>
                          <a href={telUrlReservas(settings)}>{labelReservas(settings)}</a>
                        </span>
                      </div>
                    </li>
                    <li>
                      <Icon name="i-mail" />
                      <div>
                        <small>Email</small>
                        <span>
                          <a href={`mailto:${settings?.email}`}>{settings?.email}</a>
                        </span>
                      </div>
                    </li>
                    <li>
                      <Icon name="i-pin" />
                      <div>
                        <small>Endereço</small>
                        <span>{settings?.address}</span>
                      </div>
                    </li>
                  </ul>
                  <a
                    href={waUrl(settings)}
                    target="_blank"
                    rel="noopener"
                    className="btn btn--wa btn--block"
                  >
                    <Icon name="i-wa" />
                    WhatsApp
                  </a>
                </aside>
                ) : null}
              </div>
            </section>
          )
        }

        /* --------------------------- CONFIRMAÇÃO ------------------------ */
        case 'confirmation':
          return (
            <section className="sec" key={key}>
              <div className="shell">
                <div className="empty">
                  <div className="empty__mark">
                    <Icon name={b.icon ?? 'i-mail'} />
                  </div>
                  <h2>{b.title}</h2>
                  {b.text ? <p>{b.text}</p> : null}
                  {b.ctaLabel ? (
                    <div className="loc__actions" style={{ justifyContent: 'center' }}>
                      <a
                        href={engineUrl(booking)}
                        target="_blank"
                        rel="noopener"
                        className="btn btn--red"
                      >
                        {b.ctaLabel}
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          )

        case 'richText':
          return (
            <section
              className={`sec${fundoSecao(b.background)}`}
              key={key}
            >
              <div className="shell">
                <div className="artigo__corpo">
                  <RichText data={b.content} />
                </div>
              </div>
            </section>
          )

        default:
          return null
      }
    }),
  )

  return <>{rendered}</>
}
