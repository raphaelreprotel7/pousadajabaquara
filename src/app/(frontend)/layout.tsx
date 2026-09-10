import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

import { DesignTokens } from '@/components/DesignTokens'
import { Motion } from '@/components/Motion'
import { HotelAgentTools } from '@/components/HotelAgentTools'
import { fontVariables } from '@/fonts'

import './styles.css'
import './popup.css'
import './promotions.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: 'Pousada Recanto do Jabaquara — Paraty',
  description: 'Pousada em Paraty, RJ com piscina aquecida e café da manhã. Sinta a calma do Jabaquara e reserve direto pelo site oficial.',
}

/**
 * Casca do site.
 *
 * O styles.css é a folha estrutural do template — layout, grid e componentes.
 * As cores, tipografia e medidas vêm do <DesignTokens />, que entra depois dele
 * e sobrescreve o :root com o tema ativo: o design system governa a aparência
 * sem que ninguém precise editar CSS.
 *
 * As fontes moram em src/fonts.ts (next/font, self-hospedadas) — é o único
 * arquivo a mexer para trocar a tipografia.
 *
 * O CSS do Leaflet não está aqui de propósito: era um <link> render-blocking
 * para o unpkg.com em toda página, por causa de um mapa que só existe na de
 * Localização. O MapView importa a folha local junto com a lib, no mesmo
 * import dinâmico.
 */
export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config })
  const [settings, booking] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', locale: 'pt-BR', depth: 0 }),
    payload.findGlobal({ slug: 'booking-bar', locale: 'pt-BR', depth: 0 }),
  ])

  return (
    <html lang="pt-BR" className={fontVariables}>
      <head>
        <DesignTokens />
        <Motion />
      </head>
      <body>
        <HotelAgentTools
          hotel={{
            name: settings.hotelName || 'Pousada Recanto do Jabaquara',
            address: settings.address || '',
            email: settings.email || '',
            phone: settings.reservationsLabel || settings.phoneLabel || '',
            whatsapp: settings.whatsapp ? `https://wa.me/${settings.whatsapp}` : '',
          }}
          booking={{
            engineBaseUrl: booking.engineBaseUrl || 'https://book.omnibees.com/hotelresults',
            hotelChain: booking.hotelChain || '5467',
            hotelId: booking.hotelId || '9527',
            currencyId: booking.currencyId || '16',
            language: booking.language || 'pt-BR',
            maxGuests: booking.maxGuests || 5,
          }}
        />
        {children}
      </body>
    </html>
  )
}
