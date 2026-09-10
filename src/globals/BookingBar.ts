import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

/**
 * Barra de reserva — presente em todas as páginas.
 *
 * Global e não bloco: os parâmetros do motor não variam por página, e deixá-los
 * num só lugar evita que uma página fique apontando para um `q` antigo depois
 * de uma troca de contrato.
 *
 * Os nomes dos parâmetros abaixo foram conferidos no HTML do próprio motor:
 * CheckIn/CheckOut em ddMMyyyy, `ad` adultos, `ch` crianças, `NRooms` quartos.
 */
export const BookingBar: GlobalConfig = {
  slug: 'booking-bar',
  label: 'Barra de reserva',
  admin: { group: 'Configuração' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'collapsible',
      label: 'Motor de reservas',
      fields: [
        {
          name: 'engineBaseUrl',
          label: 'URL base',
          type: 'text',
          required: true,
          defaultValue: 'https://book.omnibees.com/hotelresults',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'hotelChain',
              label: 'Código da rede (c)',
              type: 'text',
              required: true,
              defaultValue: '5467',
              admin: { width: '25%' },
            },
            {
              name: 'hotelId',
              label: 'Código do hotel (q)',
              type: 'text',
              required: true,
              defaultValue: '9527',
              admin: { width: '25%' },
            },
            {
              name: 'currencyId',
              label: 'Moeda',
              type: 'text',
              required: true,
              defaultValue: '16',
              admin: { width: '25%' },
            },
            {
              name: 'language',
              label: 'Idioma',
              type: 'text',
              required: true,
              defaultValue: 'pt-BR',
              admin: { width: '25%' },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Rótulos',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'checkInLabel',
              label: 'Check-in',
              type: 'text',
              localized: true,
              defaultValue: 'Check-in',
              admin: { width: '25%' },
            },
            {
              name: 'checkOutLabel',
              label: 'Check-out',
              type: 'text',
              localized: true,
              defaultValue: 'Check-out',
              admin: { width: '25%' },
            },
            {
              name: 'guestsLabel',
              label: 'Hóspedes',
              type: 'text',
              localized: true,
              defaultValue: 'Hóspedes',
              admin: { width: '25%' },
            },
            {
              name: 'submitLabel',
              label: 'Botão',
              type: 'text',
              localized: true,
              defaultValue: 'Reservar',
              admin: { width: '25%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'maxGuests',
              label: 'Máximo de adultos',
              type: 'number',
              required: true,
              defaultValue: 5,
              min: 1,
              max: 10,
              admin: { width: '50%' },
            },
            {
              name: 'defaultGuests',
              label: 'Adultos pré-selecionados',
              type: 'number',
              required: true,
              defaultValue: 2,
              min: 1,
              max: 10,
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
  ],
}
