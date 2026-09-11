import React from 'react'

import { Icon } from './Icons'
import {
  BookingBar,
  CookieNotice,
  MobileNav,
  type BookingConfig,
} from './Interactive'
import { PayloadForm, type PayloadFormDoc } from './PayloadForm'
import { imgProps, SIZES } from '@/utilities/image'
import {
  engineUrl,
  labelReservas,
  mediaUrl,
  splitHighlight,
  telUrl,
  telUrlReservas,
  waUrl,
} from '@/utilities/site'

type Any = Record<string, any>

/* ------------------------------- HEADER -------------------------------- */

export const SiteHeader = ({
  settings,
  header,
  booking,
  currentPath,
  sobreBanner = true,
}: {
  settings: Any
  header: Any
  booking: BookingConfig
  currentPath: string
  /** Falso quando a página não abre com banner: o topo ganha fundo sólido. */
  sobreBanner?: boolean
}) => {
  const nav: Any[] = header?.nav ?? []
  const bookHref = header?.bookUsesEngine ? engineUrl(booking) : '#reserva'
  const external = Boolean(header?.bookUsesEngine)

  /* Na gaveta não há espaço para menu suspenso: os subitens entram logo abaixo
     do pai, recuados, na ordem em que aparecem no admin. */
  const mobileItems = [
    ...nav.flatMap((n) => [
      { label: n.label, href: n.href },
      ...((n.children ?? []) as Any[]).map((f) => ({
        label: f.label,
        href: f.href,
        filho: true,
      })),
    ]),
    { label: header?.promoLabel ?? 'Promoções', href: header?.promoHref ?? '/promocoes' },
    { label: header?.bookLabel ?? 'Faça uma reserva', href: bookHref },
  ]

  return (
    <>
      <header className={`topbar${sobreBanner ? '' : ' topbar--solido'}`}>
        <div className="topbar__inner">
          <a className="brand" href="/">
            {settings?.logo ? (
              /* Logo do topo: 3 KB, acima da dobra. Fica fora do lazy e sem
                 srcset — a altura é fixa em 34px, não há corte a escolher. */
              <img
                className="brand__logo"
                src={mediaUrl(settings.logo)}
                alt={settings?.hotelName ?? 'Hotel'}
                decoding="async"
                fetchPriority="high"
              />
            ) : (
              <span className="brand__mark">N</span>
            )}
          </a>

          <nav className="nav">
            {nav.map((item) => {
              const filhos = (item.children ?? []) as Any[]
              /* O item com subitens continua sendo um link: quem já sabe onde
                 quer ir clica direto, e o suspenso é atalho, não obstáculo. */
              const ativo =
                item.href === currentPath || filhos.some((f) => f.href === currentPath)
              const link = (
                <a href={item.href} className={ativo ? 'is-active' : undefined}>
                  {item.label}
                </a>
              )

              if (!filhos.length) return <span key={item.href + item.label}>{link}</span>

              return (
                <span className="nav__grupo" key={item.href + item.label}>
                  {link}
                  <span className="nav__seta" aria-hidden="true" />
                  <span className="nav__sub">
                    {filhos.map((f) => (
                      <a
                        key={f.href + f.label}
                        href={f.href}
                        className={f.href === currentPath ? 'is-active' : undefined}
                      >
                        {f.label}
                      </a>
                    ))}
                  </span>
                </span>
              )
            })}
          </nav>

          <MobileNav items={mobileItems} />

          <div className="topbar__cta">
            <a href={header?.promoHref ?? '/promocoes'} className="btn btn--red">
              {header?.promoLabel ?? 'Promoções'}
            </a>
            <a
              href={bookHref}
              className="btn btn--dark"
              {...(external ? { target: '_blank', rel: 'noopener' } : {})}
            >
              {header?.bookLabel ?? 'Faça uma reserva'}
            </a>
          </div>
        </div>
      </header>
    </>
  )
}

/* ------------------------------- FOOTER -------------------------------- */

export const SiteFooter = ({ settings, footer }: { settings: Any; footer: Any }) => {
  const socials: Any[] = settings?.socials ?? []

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__top">
          <div className="footer__brand">
            <a className="brand" href="/">
              {settings?.logo ? (
                <img
                  className="brand__logo"
                  src={mediaUrl(settings.logo)}
                  alt={settings?.hotelName ?? 'Hotel'}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </a>
            {footer?.about ? <p>{footer.about}</p> : null}
          </div>

          <div className="footer__contact">
            <h3 className="footer__h">{footer?.contactTitle ?? 'Contato'}</h3>
            {/* Ordem: endereço, telefone, WhatsApp, e-mail, redes.
                A central de reservas só entra quando é um número diferente do
                da recepção — nesta pousada é o mesmo, e repeti-lo só confundia. */}
            <ul>
              {settings?.address ? (
                <li>
                  <Icon name="i-pin" />
                  <span>{settings.address}</span>
                </li>
              ) : null}
              {settings?.phoneLabel ? (
                <li>
                  <Icon name="i-phone" />
                  <a href={telUrl(settings)}>{settings.phoneLabel}</a>
                </li>
              ) : null}
              {settings?.reservationsLabel &&
              settings.reservationsLabel !== settings.phoneLabel ? (
                <li>
                  <Icon name="i-phone" />
                  <span>
                    <b className="footer__cap">
                      {footer?.reservationsCaption ?? 'Central de reservas'}:
                    </b>
                    <a href={telUrlReservas(settings)}>{settings.reservationsLabel}</a>
                  </span>
                </li>
              ) : null}
              {settings?.whatsapp ? (
                <li>
                  <Icon name="i-wa" />
                  <a href={waUrl(settings)} target="_blank" rel="noopener">
                    {settings.phoneLabel ?? 'WhatsApp'}
                  </a>
                </li>
              ) : null}
              {settings?.email ? (
                <li>
                  <Icon name="i-mail" />
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </li>
              ) : null}
            </ul>
            <div className="footer__social">
              {socials.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener"
                  aria-label={s.network}
                >
                  <Icon name={s.network === 'instagram' ? 'i-ig' : 'i-fb'} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer__cols">
          {(footer?.columns ?? []).map((col: Any, i: number) => (
            <div key={col.title ?? i}>
              <h3 className="footer__h">{col.title}</h3>
              <ul>
                {(col.links ?? []).map((link: Any) => (
                  <li key={link.href + link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Selos: discretos, acima da linha final. Em cinza, ganham cor ao
          passar o mouse — presença sem competir com o resto do rodapé. */}
      {(footer?.seals ?? []).length ? (
        <div className="shell footer__selos">
          {(footer.seals as Any[]).map((s) => {
            /* Sem arte oficial, o selo é composto com a letra do site. Dizer a
               certificação por escrito é honesto; desenhar um brasão parecido
               com o de um organismo certificador não seria. */
            const selo =
              s.style === 'text' ? (
                <span className="footer__selo footer__selo--texto">{s.label}</span>
              ) : (
                <img
                  className="footer__selo"
                  src={mediaUrl(s.image)}
                  alt={s.label}
                  loading="lazy"
                  decoding="async"
                />
              )
            return s.href ? (
              <a className="footer__selo-link" key={s.label} href={s.href} target="_blank" rel="noopener">
                {selo}
              </a>
            ) : (
              <span className="footer__selo-link" key={s.label}>{selo}</span>
            )
          })}
        </div>
      ) : null}

      {footer?.bottomText ? <div className="footer__bar">{footer.bottomText}</div> : null}
    </footer>
  )
}

/* --------------------------- SEÇÕES FIXAS ------------------------------ */

export const TestimonialsSectionView = ({
  section,
  items,
}: {
  section: Any
  items: Any[]
}) => {
  if (!items.length) return null
  const { head, tail } = splitHighlight(section?.title ?? 'O que dizem nossos hóspedes')

  return (
    <section className="reviews">
      <div className="shell">
        {/* O sobretítulo, o texto de apoio e o botão existem no layout do
            cliente e são opcionais: sem eles a seção volta ao formato simples
            de três cards, que é o das páginas internas. */}
        <div className="section-head">
          {section?.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
          <h2 className="h-section">
            {head} <strong>{tail}</strong>
          </h2>
          {section?.lead ? <p className="reviews__lead">{section.lead}</p> : null}
          {section?.ctaLabel ? (
            <a className="btn btn--ghost reviews__cta" href={section.ctaHref || '#'}>
              {section.ctaLabel}
            </a>
          ) : null}
        </div>
        <div className="reviews__grid">
          {items.map((t) => (
            <article className="review" key={t.id}>
              {/* No layout do cliente as estrelas abrem o card, antes do título. */}
              <div className="stars">
                {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                  <Icon key={i} name="i-star" />
                ))}
              </div>
              <h3 className="review__title">{t.title}</h3>
              <p className="review__text">&ldquo;{t.quote}&rdquo;</p>
              <span className="review__author">
                {t.author}
                {t.source ? ` — ${sourceLabel(t.source)}` : ''}
              </span>
            </article>
          ))}
        </div>
        <div className="dots">
          {items.map((t, i) => (
            <span key={t.id} className={i === 0 ? 'is-active' : undefined} />
          ))}
        </div>
      </div>
    </section>
  )
}

const sourceLabel = (value: string) =>
  ({ tripadvisor: 'Tripadvisor', google: 'Google', booking: 'Booking', direto: '' })[
    value
  ] ?? ''

export const NewsletterView = ({
  section,
  variant,
}: {
  section: Any
  variant: 'home' | 'inner'
}) => {
  const title = variant === 'home' ? section?.homeTitle : section?.innerTitle
  const subtitle = variant === 'home' ? section?.homeSubtitle : section?.innerSubtitle

  return (
    <section className="news" id="newsletter">
      {section?.background ? (
        <img
          className="img news__bg"
          {...imgProps(mediaUrl(section.background), { sizes: SIZES.full })}
          alt=""
        />
      ) : null}
      <div className="news__scrim" />
      <div className="news__inner shell">
        <h2>{title}</h2>
        {subtitle ? <p className="news__sub">{subtitle}</p> : null}

        {/* Com formulário ligado, o envio grava no Payload e segue o redirect
            configurado. Sem ele, o markup fica inerte — útil só para prévia. */}
        {typeof section?.form === 'object' && section?.form ? (
          <PayloadForm
            form={section.form as PayloadFormDoc}
            variant="news"
            consentText={section?.consentText}
            botao="btn--ambar"
          />
        ) : (
          <form className="news__form">
            <div className="news__row">
              <input
                type="text"
                placeholder={section?.namePlaceholder ?? 'Nome'}
                aria-label={section?.namePlaceholder ?? 'Nome'}
              />
              <input
                type="email"
                placeholder={section?.emailPlaceholder ?? 'Email'}
                aria-label={section?.emailPlaceholder ?? 'Email'}
              />
              <input
                type="tel"
                placeholder={section?.phonePlaceholder ?? 'Telefone'}
                aria-label={section?.phonePlaceholder ?? 'Telefone'}
              />
            </div>
            <label className="news__check">
              <input type="checkbox" />
              <span>{section?.consentText}</span>
            </label>
            <button type="submit" className="btn btn--ambar btn--block">
              {section?.submitLabel ?? 'Cadastrar'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export const FloatingActionsView = ({
  actions,
  settings,
  booking,
}: {
  actions: Any
  settings: Any
  booking: BookingConfig
}) => {
  const hrefFor = (item: Any) => {
    if (item.action === 'phone') return telUrl(settings)
    if (item.action === 'reservations') return telUrlReservas(settings)
    if (item.action === 'whatsapp') return waUrl(settings)
    if (item.action === 'engine') return engineUrl(booking)
    return item.href ?? '#'
  }

  /* O ícone escolhido no admin vence; sem ele, cada ação tem o seu padrão. */
  const iconFor = (item: Any) =>
    item.icon ||
    ({ phone: 'i-phone', reservations: 'i-phone', whatsapp: 'i-wa', engine: 'i-cal', link: 'i-tag' })[
      item.action as string
    ] ||
    'i-tag'

  return (
    <>
      {actions?.showWhatsapp ? (
        <a
          className="wa"
          href={waUrl(settings)}
          target="_blank"
          rel="noopener"
          aria-label="Fale conosco pelo WhatsApp"
        >
          <Icon name="i-wa" />
        </a>
      ) : null}

      {actions?.showActionBar ? (
        <nav className="actionbar">
          {(actions.actionBar ?? []).map((item: Any, i: number) => (
            <a
              key={item.label + i}
              href={hrefFor(item)}
              {...(item.action === 'whatsapp' || item.action === 'engine'
                ? { target: '_blank', rel: 'noopener' }
                : {})}
            >
              <Icon name={iconFor(item)} />
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}

      {actions?.showCookie ? (
        <CookieNotice
          text={actions.cookieText}
          moreLabel={actions.cookieMoreLabel ?? 'Saiba Mais'}
          moreHref={actions.cookieMoreHref ?? '#'}
          acceptLabel={actions.cookieAcceptLabel ?? 'Aceitar'}
        />
      ) : null}
    </>
  )
}

export { BookingBar }
