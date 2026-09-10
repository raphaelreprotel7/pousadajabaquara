'use client'

import { useEffect } from 'react'

type ToolDefinition = {
  name: string
  title: string
  description: string
  inputSchema: Record<string, unknown>
  annotations?: Record<string, boolean>
  execute: (input: Record<string, unknown>) => string | Promise<string>
}

type ModelContextAPI = {
  provideContext?: (context: { tools: ToolDefinition[] }) => void | Promise<void>
  registerTool?: (
    tool: ToolDefinition,
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>
}

declare global {
  interface Navigator {
    modelContext?: ModelContextAPI
  }

  interface Document {
    modelContext?: ModelContextAPI
  }
}

type Props = {
  hotel: {
    name: string
    address: string
    email: string
    phone: string
    whatsapp: string
  }
  booking: {
    engineBaseUrl: string
    hotelChain: string
    hotelId: string
    currencyId: string
    language: string
    maxGuests: number
  }
}

const engineDate = (iso: string) => {
  const [year, month, day] = iso.split('-')
  return `${day}${month}${year}`
}

/**
 * Expõe ações de leitura do hotel para navegadores compatíveis com WebMCP.
 * Nenhuma ferramenta efetua uma compra ou envia dados: a reserva devolve a
 * URL pronta para o agente apresentar ao hóspede.
 */
export function HotelAgentTools({ hotel, booking }: Props) {
  useEffect(() => {
    const tools: ToolDefinition[] = [
      {
        name: 'consultar_contato_recanto_do_jabaquara',
        title: 'Consultar contato da Pousada Recanto do Jabaquara',
        description:
          'Retorna endereço, telefone, WhatsApp e e-mail oficiais da Pousada Recanto do Jabaquara em Paraty.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true },
        execute: () => JSON.stringify(hotel),
      },
      {
        name: 'montar_consulta_de_reserva',
        title: 'Montar consulta de reserva',
        description:
          'Cria uma URL do motor oficial de reservas com check-in, check-out e número de adultos. Não conclui nem cobra a reserva.',
        inputSchema: {
          type: 'object',
          properties: {
            checkIn: {
              type: 'string',
              format: 'date',
              description: 'Data de entrada no formato AAAA-MM-DD.',
            },
            checkOut: {
              type: 'string',
              format: 'date',
              description: 'Data de saída no formato AAAA-MM-DD.',
            },
            adults: {
              type: 'integer',
              minimum: 1,
              maximum: booking.maxGuests,
              description: 'Quantidade de hóspedes adultos.',
            },
          },
          required: ['checkIn', 'checkOut', 'adults'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: (input) => {
          const checkIn = String(input.checkIn ?? '')
          const checkOut = String(input.checkOut ?? '')
          const adults = Number(input.adults)
          const datePattern = /^\d{4}-\d{2}-\d{2}$/

          if (
            !datePattern.test(checkIn) ||
            !datePattern.test(checkOut) ||
            checkOut <= checkIn ||
            !Number.isInteger(adults) ||
            adults < 1 ||
            adults > booking.maxGuests
          ) {
            throw new Error('Informe datas válidas e uma quantidade de adultos permitida.')
          }

          const url = new URL(booking.engineBaseUrl)
          url.searchParams.set('c', booking.hotelChain)
          url.searchParams.set('q', booking.hotelId)
          url.searchParams.set('currencyId', booking.currencyId)
          url.searchParams.set('lang', booking.language)
          url.searchParams.set('CheckIn', engineDate(checkIn))
          url.searchParams.set('CheckOut', engineDate(checkOut))
          url.searchParams.set('NRooms', '1')
          url.searchParams.set('ad', String(adults))
          url.searchParams.set('ch', '0')

          return JSON.stringify({
            bookingUrl: url.toString(),
            notice: 'Abra esta URL para conferir disponibilidade e preço no motor oficial.',
          })
        },
      },
    ]

    // A versão inicialmente disponibilizada pelo Chrome usava navigator e
    // provideContext. O rascunho atual do padrão usa document/registerTool.
    // O fallback mantém o site compatível durante essa transição.
    const legacyContext = navigator.modelContext
    if (legacyContext?.provideContext) {
      void legacyContext.provideContext({ tools })
      return
    }

    const currentContext = document.modelContext
    if (currentContext?.registerTool) {
      const controller = new AbortController()
      for (const tool of tools) {
        void currentContext.registerTool(tool, { signal: controller.signal })
      }
      return () => controller.abort()
    }
  }, [booking, hotel])

  return null
}
