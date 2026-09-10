import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

/** Menu e CTAs do topo. Mesmo conteúdo no menu desktop e no menu mobile. */
export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Cabeçalho',
  admin: { group: 'Configuração' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'nav',
      label: 'Itens do menu',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Item', plural: 'Itens' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              label: 'Rótulo',
              type: 'text',
              required: true,
              localized: true,
              admin: { width: '40%' },
            },
            {
              name: 'href',
              label: 'Destino',
              type: 'text',
              required: true,
              admin: { width: '60%', placeholder: '/acomodacoes' },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Botões',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'promoLabel',
              label: 'Botão vermelho',
              type: 'text',
              localized: true,
              defaultValue: 'Promoções',
              admin: { width: '25%' },
            },
            {
              name: 'promoHref',
              label: 'Destino',
              type: 'text',
              defaultValue: '/promocoes',
              admin: { width: '25%' },
            },
            {
              name: 'bookLabel',
              label: 'Botão escuro',
              type: 'text',
              localized: true,
              defaultValue: 'Faça uma reserva',
              admin: { width: '25%' },
            },
            {
              name: 'bookUsesEngine',
              label: 'Abre o motor',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                width: '25%',
                description: 'Desmarcado, rola até a barra de reserva da página.',
              },
            },
          ],
        },
      ],
    },
  ],
}
