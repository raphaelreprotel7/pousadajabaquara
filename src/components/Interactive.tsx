'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Icon } from './Icons'
import { imgProps, SIZES } from '@/utilities/image'

/* ===================================================================== */
/* BARRA DE RESERVA                                                      */
/* ===================================================================== */

export type BookingConfig = {
  engineBaseUrl: string
  hotelChain: string
  hotelId: string
  currencyId: string
  language: string
  checkInLabel?: string | null
  checkOutLabel?: string | null
  guestsLabel?: string | null
  submitLabel?: string | null
  maxGuests?: number | null
  defaultGuests?: number | null
}

const isoLocal = (d: Date) => {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + n)
  return isoLocal(date)
}

/** yyyy-mm-dd → ddmmyyyy, formato exigido pelo Omnibees. */
const toEngineDate = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return `${d}${m}${y}`
}

export const BookingBar = ({ config }: { config: BookingConfig }) => {
  /* Ao rolar, a barra desgruda do herói e acompanha o topo. A âncora é um
     elemento vazio no lugar original: quando ele sai da tela, a barra fixa.
     Sem IntersectionObserver (ou sem JS) a barra fica onde sempre esteve. */
  const ancora = useRef<HTMLDivElement | null>(null)
  const forma = useRef<HTMLFormElement | null>(null)
  const [fixa, setFixa] = useState(false)
  const [alturaBarra, setAlturaBarra] = useState(0)
  useEffect(() => {
    /* Um IntersectionObserver não serve aqui: a âncora tem altura zero e,
       com a raiz colapsada numa linha, ele nunca chega a trocar de estado.
       Ler a posição na rolagem é previsível e barato o bastante. */
    /* No celular a barra NÃO gruda: empilhada ela tem quase 470px e, fixa no
       topo, cobria a tela inteira. Lá ela simplesmente rola junto com o herói
       e some — quem quiser reservar tem a barra de ações no rodapé. */
    const noDesktop = window.matchMedia('(min-width: 901px)')

    const aoRolar = () => {
      const a = ancora.current
      if (!a) return
      const passou = noDesktop.matches && a.getBoundingClientRect().top < 0
      setFixa(passou)
      if (!passou && forma.current) setAlturaBarra(forma.current.offsetHeight)
    }
    if (forma.current) setAlturaBarra(forma.current.offsetHeight)
    aoRolar()
    noDesktop.addEventListener('change', aoRolar)
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRolar)
    return () => {
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
      noDesktop.removeEventListener('change', aoRolar)
    }
  }, [])

  const today = useMemo(() => isoLocal(new Date()), [])
  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(() => addDays(today, 1))
  const [guests, setGuests] = useState(String(config.defaultGuests ?? 2))

  const onCheckIn = (value: string) => {
    setCheckIn(value)
    if (value && checkOut <= value) setCheckOut(addDays(value, 1))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkIn || !checkOut) return

    const url =
      `${config.engineBaseUrl}?c=${config.hotelChain}&q=${config.hotelId}` +
      `&currencyId=${config.currencyId}&lang=${config.language}` +
      `&CheckIn=${toEngineDate(checkIn)}&CheckOut=${toEngineDate(checkOut)}` +
      `&NRooms=1&ad=${guests}&ch=0`

    window.open(url, '_blank', 'noopener')
  }

  const max = config.maxGuests ?? 5

  return (
    <>
    <div
      ref={ancora}
      className="booking__ancora"
      aria-hidden="true"
      style={fixa ? { height: alturaBarra } : undefined}
    />
    <form
      ref={forma}
      className={`booking${fixa ? ' booking--fixa' : ''}`}
      id="reserva"
      onSubmit={submit}
    >
      <div className="booking__field">
        <label htmlFor="ci">{config.checkInLabel ?? 'Check-in'}</label>
        <input
          className="value"
          id="ci"
          type="date"
          required
          min={today}
          value={checkIn}
          onChange={(e) => onCheckIn(e.target.value)}
        />
      </div>
      <div className="booking__field">
        <label htmlFor="co">{config.checkOutLabel ?? 'Check-out'}</label>
        <input
          className="value"
          id="co"
          type="date"
          required
          min={addDays(checkIn, 1)}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
        />
      </div>
      <div className="booking__field">
        <label htmlFor="hosp">{config.guestsLabel ?? 'Hóspedes'}</label>
        <select
          className="value"
          id="hosp"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
        >
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'Adulto' : 'Adultos'}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn--red booking__btn">
        {config.submitLabel ?? 'Reservar'}
      </button>
    </form>
    </>
  )
}

/* ===================================================================== */
/* MENU MOBILE                                                           */
/* ===================================================================== */

type NavItem = { label: string; href: string; filho?: boolean }

export const MobileNav = ({ items }: { items: NavItem[] }) => {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const menu = (
    <nav id="mobile-navigation" className={`mobilenav${open ? ' is-open' : ''}`} aria-label="Menu principal">
      <button
        className="mobilenav__close"
        aria-label="Fechar menu"
        onClick={() => setOpen(false)}
      >
        &times;
      </button>
      {items.map((item) => (
        <a
          key={item.href + item.label}
          href={item.href}
          className={item.filho ? 'mobilenav__filho' : undefined}
          onClick={() => setOpen(false)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )

  return (
    <>
      <button
        className="burger"
        aria-label="Abrir menu"
        aria-controls="mobile-navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
        <span />
      </button>
      {mounted ? createPortal(menu, document.body) : null}
    </>
  )
}

/* ===================================================================== */
/* CARROSSEL DE SUÍTES (home)                                            */
/* ===================================================================== */

export const SuitesTrack = ({ children }: { children: React.ReactNode[] }) => {
  const [items, setItems] = useState(children)

  const next = () => setItems((prev) => [...prev.slice(1), prev[0]])
  const prev = () => setItems((p) => [p[p.length - 1], ...p.slice(0, -1)])

  return (
    <div className="suites__rail">
      <div className="rail__nav">
        {/* O layout do cliente traz esta dica ao lado das setas. */}
        <span className="rail__hint" aria-hidden="true">
          Deslize para ver mais
        </span>
        <button type="button" aria-label="Anterior" onClick={prev}>
          ‹
        </button>
        <button type="button" aria-label="Próxima" onClick={next}>
          ›
        </button>
      </div>
      <div className="suites__track">{items}</div>
    </div>
  )
}

/* ===================================================================== */
/* CARROSSEL DE FOTOS DO QUARTO                                          */
/* ===================================================================== */

export const RoomGallery = ({
  photos,
}: {
  photos: { src: string; alt: string }[]
}) => {
  const [index, setIndex] = useState(0)
  const startX = useRef<number | null>(null)
  const total = photos.length

  const go = (n: number) => setIndex(((n % total) + total) % total)

  return (
    <div
      className="room__gallery"
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (startX.current === null) return
        const dx = e.changedTouches[0].clientX - startX.current
        if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1)
        startX.current = null
      }}
    >
      <div
        className="room__slides"
        style={{ transform: `translateX(${-index * 100}%)` }}
      >
        {photos.map((p, i) => (
          <img
            key={p.src}
            className="img"
            {...imgProps(p.src, { sizes: SIZES.half, priority: i === 0 })}
            alt={p.alt}
          />
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            className="gnav gnav--prev"
            aria-label="Foto anterior"
            onClick={() => go(index - 1)}
          >
            &lsaquo;
          </button>
          <button
            type="button"
            className="gnav gnav--next"
            aria-label="Próxima foto"
            onClick={() => go(index + 1)}
          >
            &rsaquo;
          </button>
          <div className="gdots">
            {photos.map((p, i) => (
              <span
                key={p.src}
                className={i === index ? 'is-active' : undefined}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ===================================================================== */
/* ACORDEÃO DE DÚVIDAS                                                   */
/* ===================================================================== */

export const FaqList = ({
  items,
}: {
  items: { id: string; question: string; answer: React.ReactNode }[]
}) => {
  // tipo explícito: sem ele o TS infere `string` pelo valor inicial e recusa
  // o `null` usado para fechar o item aberto
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null)

  return (
    <div className="faq__list">
      {items.map((item) => (
        <div
          key={item.id}
          className={`faq__item${open === item.id ? ' is-open' : ''}`}
        >
          <button
            className="faq__q"
            type="button"
            onClick={() => setOpen(open === item.id ? null : item.id)}
          >
            {item.question}
          </button>
          <div className="faq__a">{item.answer}</div>
        </div>
      ))}
    </div>
  )
}

/* ===================================================================== */
/* GALERIA COM FILTROS                                                   */
/* ===================================================================== */

export const GalleryGrid = ({
  categories,
  photos,
  allLabel = 'Todas',
  showFilters = true,
}: {
  categories: { id: string; title: string }[]
  photos: { src: string; alt: string; category: string | null }[]
  allLabel?: string
  showFilters?: boolean
}) => {
  const [filter, setFilter] = useState('todas')

  return (
    <>
      {showFilters && (
        <div className="filters">
          <button
            type="button"
            className={filter === 'todas' ? 'is-active' : undefined}
            onClick={() => setFilter('todas')}
          >
            {allLabel}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={filter === cat.id ? 'is-active' : undefined}
              onClick={() => setFilter(cat.id)}
            >
              {cat.title}
            </button>
          ))}
        </div>
      )}
      <div className="gallery">
        {photos.map((p) => (
          <img
            key={p.src}
            className="img g"
            {...imgProps(p.src, { sizes: SIZES.card })}
            alt={p.alt}
            hidden={filter !== 'todas' && p.category !== filter}
          />
        ))}
      </div>
    </>
  )
}

/* ===================================================================== */
/* AVISO DE COOKIES                                                      */
/* ===================================================================== */

export const CookieNotice = ({
  text,
  moreLabel,
  moreHref,
  acceptLabel,
}: {
  text: string
  moreLabel: string
  moreHref: string
  acceptLabel: string
}) => {
  const [hidden, setHidden] = useState(true)

  // Só aparece se ainda não foi aceito. Ler no efeito evita divergência
  // entre o HTML do servidor e o do cliente.
  useEffect(() => {
    setHidden(window.localStorage.getItem('cookie-ok') === '1')
  }, [])

  if (hidden) return null

  return (
    <div className="cookie">
      {text}
      <div className="cookie__actions">
        <a href={moreHref} className="btn btn--ghost">
          {moreLabel}
        </a>
        <button
          type="button"
          className="btn btn--red"
          onClick={() => {
            window.localStorage.setItem('cookie-ok', '1')
            setHidden(true)
          }}
        >
          {acceptLabel}
        </button>
      </div>
    </div>
  )
}

/* ===================================================================== */
/* MAPA (OpenStreetMap via Leaflet)                                      */
/* ===================================================================== */

export const MapView = ({
  lat,
  lon,
  zoom,
  tileUrl,
  attribution,
  hotelName,
  address,
}: {
  lat: number
  lon: number
  zoom: number
  tileUrl: string
  attribution: string
  hotelName: string
  address: string
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    let map: any

    // Leaflet só no cliente e só quando a seção existe. A folha de estilo vem
    // no mesmo import: antes era um <link> para o unpkg.com no layout global,
    // render-blocking em todas as páginas por causa deste único mapa.
    const boot = async () => {
      await import('leaflet/dist/leaflet.css')
      const L = (await import('leaflet')).default
      if (cancelled || !ref.current) return

      map = L.map(ref.current, {
        center: [lat, lon],
        zoom,
        scrollWheelZoom: false,
      })

      L.tileLayer(tileUrl, { maxZoom: 19, subdomains: 'abcd', attribution }).addTo(map)

      const pin = L.divIcon({
        className: 'mapa-pin',
        html:
          '<svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
          '<path fill="#C8102E" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0Z"/>' +
          '<circle cx="12" cy="12" r="4.6" fill="#fff"/></svg>',
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -38],
      })

      L.marker([lat, lon], { icon: pin, title: hotelName })
        .addTo(map)
        .bindPopup(`<b>${hotelName}</b>${address}`)

      map.on('click', () => map.scrollWheelZoom.enable())
      map.on('mouseout', () => map.scrollWheelZoom.disable())
    }

    boot()
    return () => {
      cancelled = true
      if (map) map.remove()
    }
  }, [lat, lon, zoom, tileUrl, attribution, hotelName, address])

  return (
    <div
      className="mapa__canvas"
      id="mapa"
      ref={ref}
      role="img"
      aria-label={`Mapa da localização do ${hotelName} — ${address}`}
    />
  )
}


/* ===================================================================== */

/**
 * Faixa do Instagram como carrossel.
 *
 * Mostra 4 fotos por vez (2 no tablet, 1 no telefone) e desliza de uma em
 * uma. Com 4 ou menos, os controles somem — a faixa vira grade estática,
 * que é o caso das páginas internas.
 */
export const IgTrack = ({ children }: { children: React.ReactNode[] }) => {
  const [pos, setPos] = useState(0)
  const [porVez, setPorVez] = useState(4)
  const total = children.length

  useEffect(() => {
    const medir = () => {
      const l = window.innerWidth
      setPorVez(l <= 900 ? 1 : l <= 1100 ? 2 : 4)
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  const max = Math.max(0, total - porVez)
  const atual = Math.min(pos, max)
  const temControles = total > porVez

  return (
    <>
      <div className="igstrip__viewport">
        <div
          className="igstrip__track"
          style={{ transform: `translateX(calc(-${atual} * (100% + 5px) / ${porVez}))` }}
        >
          {children}
        </div>
      </div>
      {temControles ? (
        <div className="igstrip__nav">
          <button type="button" aria-label="Fotos anteriores"
            onClick={() => setPos((p) => Math.max(0, p - 1))}>‹</button>
          <button type="button" aria-label="Próximas fotos"
            onClick={() => setPos((p) => Math.min(max, p + 1))}>›</button>
        </div>
      ) : null}
    </>
  )
}


/* ===================================================================== */

/**
 * Carrossel da coluna de mídia do bloco "texto + lista + imagem".
 *
 * Antes a seção mostrava uma foto grande ao lado do texto e jogava as demais
 * numa fileira solta embaixo. Agora todas entram aqui, uma por vez.
 */
export const MidiaCarrossel = ({ children }: { children: React.ReactNode[] }) => {
  const [i, setI] = useState(0)
  const total = children.length
  if (!total) return null

  return (
    <div className="carrossel">
      <div
        className="carrossel__pista"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {children.map((c, n) => (
          <div className="carrossel__slide" key={n}>
            {c}
          </div>
        ))}
      </div>
      {total > 1 ? (
        <>
          <button
            type="button"
            className="carrossel__seta carrossel__seta--ant"
            aria-label="Foto anterior"
            onClick={() => setI((v) => (v - 1 + total) % total)}
          >
            ‹
          </button>
          <button
            type="button"
            className="carrossel__seta carrossel__seta--prox"
            aria-label="Próxima foto"
            onClick={() => setI((v) => (v + 1) % total)}
          >
            ›
          </button>
          <div className="carrossel__pontos">
            {children.map((_, n) => (
              <button
                type="button"
                key={n}
                className={n === i ? 'is-active' : undefined}
                aria-label={`Foto ${n + 1} de ${total}`}
                onClick={() => setI(n)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
