import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

import { Icon, IconSprite } from '@/components/Icons'
import { WhatsappRedirect } from '@/components/WhatsappRedirect'

/**
 * Páginas de passagem para o WhatsApp, uma por origem de tráfego:
 * /whatsapp-crm-organico, /whatsapp-crm-facebook e /whatsapp-crm-google.
 *
 * O chat do CRM manda a pessoa para a página da origem dela; o GTM reconhece a
 * origem pela URL e dispara os eventos e conversões; depois de 3 segundos a
 * página abre o WhatsApp de Configurações do site com a mensagem da origem.
 */
export type WhatsappOrigem = 'organico' | 'facebook' | 'google'

const MENSAGENS: Record<WhatsappOrigem, string> = {
  organico: 'Oi, vim pelo site e gostaria de mais informações.',
  facebook: 'Olá, vim dos anúncios e quero mais informações.',
  google: 'Olá, vim dos anúncios e quero mais informações.',
}

/** Fora do Google e do sitemap: é página de passagem, não conteúdo. */
export const whatsappCrmMetadata: Metadata = {
  title: 'Redirecionando para o WhatsApp | Pousada Recanto do Jabaquara',
  robots: { index: false, follow: false },
}

export const WhatsappCrmPage = async ({ origem }: { origem: WhatsappOrigem }) => {
  const payload = await getPayload({ config })
  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as Record<string, any>
  const numero = String(settings?.whatsapp ?? '').replace(/\D/g, '')
  const href = `https://wa.me/${numero}?text=${encodeURIComponent(MENSAGENS[origem])}`

  return (
    <>
      <IconSprite />
      <main className="wa-redirect">
        <div className="wa-redirect__box">
          <span className="wa-redirect__icon" aria-hidden="true">
            <Icon name="i-wa" />
          </span>
          <p className="eyebrow">{settings?.hotelName || 'Pousada Recanto do Jabaquara'}</p>
          <h1 className="wa-redirect__title">Aguarde, estamos te levando para o nosso WhatsApp</h1>
          <p className="wa-redirect__text">Se a conversa não abrir em alguns segundos, toque no botão abaixo.</p>
          <a className="btn btn--wa" href={href}>
            <Icon name="i-wa" /> Abrir o WhatsApp
          </a>
        </div>
        <WhatsappRedirect href={href} />
      </main>
    </>
  )
}
