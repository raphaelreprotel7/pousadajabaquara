import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

import { Icon, IconSprite } from '@/components/Icons'
import { WhatsappChatOpener } from '@/components/WhatsappChat'

/**
 * Destino dos botões de WhatsApp do site: página em branco onde o chat do CRM
 * (carregado pelo GTM) se abre. Fora do Google e do sitemap.
 */
export const metadata: Metadata = {
  title: 'WhatsApp | Pousada Recanto do Jabaquara',
  robots: { index: false, follow: false },
}

/** O número do botão de reserva vem de Configurações do site; revalida para pegar uma troca. */
export const revalidate = 3600

const MENSAGEM = 'Oi, vim pelo site e gostaria de mais informações.'

export default async function Page() {
  const payload = await getPayload({ config })
  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as Record<string, any>
  const numero = String(settings?.whatsapp ?? '').replace(/\D/g, '')
  const href = `https://wa.me/${numero}?text=${encodeURIComponent(MENSAGEM)}`

  return (
    <>
      <IconSprite />
      <main className="wa-redirect">
        <WhatsappChatOpener>
          <span className="wa-redirect__icon" aria-hidden="true">
            <Icon name="i-wa" />
          </span>
          <p className="eyebrow">{settings?.hotelName || 'Pousada Recanto do Jabaquara'}</p>
          <h1 className="wa-redirect__title">Fale com a gente pelo WhatsApp</h1>
          <p className="wa-redirect__text">O chat não abriu por aqui. Toque no botão para conversar direto no WhatsApp.</p>
          <a className="btn btn--wa" href={href}>
            <Icon name="i-wa" /> Abrir o WhatsApp
          </a>
        </WhatsappChatOpener>
      </main>
    </>
  )
}
