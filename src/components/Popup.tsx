'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { PayloadForm, type PayloadFormDoc } from './PayloadForm'

type Any = Record<string, any>

export type PopupDoc = {
  id: string | number
  variant: 'text' | 'image' | 'form'
  eyebrow?: string | null
  heading: string
  text?: string | null
  image?: Any | null
  imagePosition?: 'side' | 'top'
  form?: Any | null
  consentText?: string | null
  ctaLabel?: string | null
  ctaType?: 'engine' | 'engineDates' | 'link' | 'close'
  ctaHref?: string | null
  ctaCheckIn?: string | null
  ctaCheckOut?: string | null
  trigger: 'delay' | 'scroll' | 'exit' | 'immediate'
  delaySeconds?: number | null
  scrollPercent?: number | null
  frequency: 'session' | 'days' | 'always'
  frequencyDays?: number | null
  hideAfterConvert?: boolean | null
  position?: 'center' | 'corner'
  size?: 'sm' | 'md' | 'lg'
  theme?: 'light' | 'dark'
}

const chave = (id: PopupDoc['id']) => `popup-${id}`

/** Frequência: decide se este visitante ainda pode ver o pop-up. */
const podeMostrar = (popup: PopupDoc): boolean => {
  try {
    if (popup.frequency === 'always') return true

    if (popup.frequency === 'session') {
      return window.sessionStorage.getItem(chave(popup.id)) !== 'visto'
    }

    const gravado = window.localStorage.getItem(chave(popup.id))
    if (!gravado) return true
    const dias = popup.frequencyDays ?? 7
    return Date.now() - Number(gravado) > dias * 86_400_000
  } catch {
    return true
  }
}

const registrar = (popup: PopupDoc) => {
  try {
    if (popup.frequency === 'session') {
      window.sessionStorage.setItem(chave(popup.id), 'visto')
    } else if (popup.frequency === 'days') {
      window.localStorage.setItem(chave(popup.id), String(Date.now()))
    }
  } catch {
    /* navegação privada: sem persistência, o pop-up volta na próxima visita */
  }
}

/** Quem já converteu não vê de novo, independentemente da frequência. */
const converteu = (popup: PopupDoc): boolean => {
  try {
    return window.localStorage.getItem(`${chave(popup.id)}-conv`) === '1'
  } catch {
    return false
  }
}

const marcarConversao = (popup: PopupDoc) => {
  try {
    window.localStorage.setItem(`${chave(popup.id)}-conv`, '1')
  } catch {
    /* ignora */
  }
}

const destaqueFinal = (titulo: string) => {
  const partes = (titulo ?? '').trim().split(' ')
  if (partes.length < 2) return { inicio: '', fim: titulo ?? '' }
  const fim = partes.pop() as string
  return { inicio: partes.join(' '), fim }
}

export const Popup = ({
  popup,
  engineHref,
}: {
  popup: PopupDoc
  engineHref: string
}) => {
  const [aberto, setAberto] = useState(false)

  const fechar = useCallback(() => {
    setAberto(false)
    registrar(popup)
  }, [popup])

  useEffect(() => {
    if (!podeMostrar(popup)) return
    if (popup.hideAfterConvert !== false && converteu(popup)) return

    let timer: ReturnType<typeof setTimeout>
    const abrir = () => setAberto(true)

    if (popup.trigger === 'immediate') {
      abrir()
      return
    }

    if (popup.trigger === 'delay') {
      timer = setTimeout(abrir, (popup.delaySeconds ?? 8) * 1000)
      return () => clearTimeout(timer)
    }

    if (popup.trigger === 'scroll') {
      const alvo = popup.scrollPercent ?? 50
      const onScroll = () => {
        const total = document.body.scrollHeight - window.innerHeight
        const pct = total > 0 ? (window.scrollY / total) * 100 : 100
        if (pct >= alvo) {
          abrir()
          window.removeEventListener('scroll', onScroll)
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
      return () => window.removeEventListener('scroll', onScroll)
    }

    // intenção de saída: mouse cruzando o topo da janela.
    // No toque não existe esse gesto, então lá vale um tempo de segurança.
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        abrir()
        document.removeEventListener('mouseout', onLeave)
      }
    }
    document.addEventListener('mouseout', onLeave)
    const semMouse = window.matchMedia('(pointer: coarse)').matches
    if (semMouse) timer = setTimeout(abrir, 25_000)

    return () => {
      document.removeEventListener('mouseout', onLeave)
      clearTimeout(timer)
    }
  }, [popup])

  // Esc fecha; enquanto aberto no centro, a página não rola atrás.
  useEffect(() => {
    if (!aberto || popup.position === 'corner') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar()
    }
    document.addEventListener('keydown', onKey)
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = anterior
    }
  }, [aberto, popup.position, fechar])

  if (!aberto) return null

  const { inicio, fim } = destaqueFinal(popup.heading)
  const canto = popup.position === 'corner'
  const comImagem = popup.variant === 'image' && popup.image
  const imagemLado = comImagem && popup.imagePosition !== 'top' && !canto

  const classes = [
    'popup',
    `popup--${popup.size ?? 'md'}`,
    popup.theme === 'dark' ? 'popup--dark' : '',
    imagemLado ? 'popup--img-side' : '',
    comImagem && !imagemLado ? 'popup--img-top' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const onCta = () => {
    marcarConversao(popup)
    registrar(popup)
    // engineHref já vem montado pelo servidor: com datas quando o pop-up
    // define uma temporada, sem elas no caso comum.
    if (popup.ctaType === 'engine' || popup.ctaType === 'engineDates') {
      window.open(engineHref, '_blank', 'noopener')
      setAberto(false)
    } else if (popup.ctaType === 'link' && popup.ctaHref) {
      window.location.href = popup.ctaHref
    } else {
      setAberto(false)
    }
  }

  const corpo = (
    <div className="popup__body">
      {popup.eyebrow ? <p className="popup__eyebrow">{popup.eyebrow}</p> : null}
      <h2 className="popup__title">
        {inicio} <strong>{fim}</strong>
      </h2>
      {popup.text ? <p className="popup__text">{popup.text}</p> : null}

      {popup.variant === 'form' && popup.form ? (
        <div className="popup__form">
          <PayloadForm
            form={popup.form as PayloadFormDoc}
            variant="popup"
            consentText={popup.consentText}
            onSuccess={() => marcarConversao(popup)}
          />
        </div>
      ) : popup.ctaLabel ? (
        <div className="popup__actions">
          <button type="button" className="btn btn--red" onClick={onCta}>
            {popup.ctaLabel}
          </button>
        </div>
      ) : null}
    </div>
  )

  return (
    <div
      className={`popup-layer popup-layer--${canto ? 'corner' : 'center'}`}
      onClick={canto ? undefined : (e) => {
        if (e.target === e.currentTarget) fechar()
      }}
    >
      <div className={classes} role="dialog" aria-modal={!canto} aria-label={popup.heading}>
        <button className="popup__close" type="button" aria-label="Fechar" onClick={fechar}>
          &times;
        </button>

        {comImagem ? (
          <img
            className="popup__media"
            src={typeof popup.image === 'object' ? popup.image?.url : ''}
            alt={typeof popup.image === 'object' ? (popup.image?.alt ?? '') : ''}
          />
        ) : null}

        {corpo}
      </div>
    </div>
  )
}
