'use client'

import { useEffect } from 'react'

/**
 * Animação de entrada das seções.
 *
 * Em vez de marcar `.reveal` bloco a bloco no JSX, este componente monta uma
 * vez por página, encontra os elementos que valem animar e os observa. Assim
 * qualquer bloco novo do page builder entra na regra sem precisar lembrar.
 *
 * Nada depende disto para ser legível: a classe `.reveal` só é aplicada aqui,
 * no cliente. Sem JS a página aparece inteira, como antes.
 */
const ALVOS = [
  '.mosaic__tiles',
  '.mosaic__body',
  '.suites__intro',
  '.suites__rail',
  '.regioncard__card',
  '.igstrip__head',
  '.igstrip__viewport',
  '.reviews .section-head',
  '.review',
  '.faq__item',
  '.news__inner',
  '.room',
  '.fcard',
  '.perk',
  '.split__media',
  '.split__body',
  '.gcard',
  '.post',
].join(',')

export const Motion = () => {
  useEffect(() => {
    const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduzir || typeof IntersectionObserver === 'undefined') return

    const elementos = Array.from(document.querySelectorAll<HTMLElement>(ALVOS))
    if (!elementos.length) return

    // Escalona os irmãos: cards da mesma fileira entram em cascata, não juntos.
    const porPai = new Map<Element, number>()
    for (const el of elementos) {
      const pai = el.parentElement ?? document.body
      const n = porPai.get(pai) ?? 0
      porPai.set(pai, n + 1)
      if (n > 0) el.style.transitionDelay = `${Math.min(n, 4) * 90}ms`
      el.classList.add('reveal')
    }

    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-visible')
          obs.unobserve(e.target) // anima uma vez só
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.06 },
    )
    for (const el of elementos) obs.observe(el)

    // O que já está na tela no primeiro quadro aparece sem esperar.
    requestAnimationFrame(() => {
      for (const el of elementos) {
        const r = el.getBoundingClientRect()
        if (r.top < window.innerHeight * 0.9) {
          el.classList.add('is-visible')
          obs.unobserve(el)
        }
      }
    })

    return () => obs.disconnect()
  }, [])

  return null
}
