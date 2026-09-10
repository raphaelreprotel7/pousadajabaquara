import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'
import { iconField } from '@/fields/icon'

/** Botão flutuante de WhatsApp, barra fixa do mobile e aviso de cookies. */
export const FloatingActions: GlobalConfig = {
  slug: 'floating-actions',
  label: 'Ações flutuantes',
  admin: { group: 'Seções fixas' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'showWhatsapp',
          label: 'Botão flutuante de WhatsApp',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%' },
        },
        {
          name: 'showActionBar',
          label: 'Barra fixa no mobile',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'actionBar',
      label: 'Itens da barra fixa',
      type: 'array',
      maxRows: 4,
      admin: {
        condition: (data) => Boolean(data?.showActionBar),
        description: 'O último item sai destacado em vermelho.',
      },
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
              admin: { width: '30%' },
            },
            {
              name: 'action',
              label: 'Ação',
              type: 'select',
              required: true,
              defaultValue: 'link',
              options: [
                { label: 'Telefone do hotel', value: 'phone' },
                { label: 'Central de reservas', value: 'reservations' },
                { label: 'WhatsApp', value: 'whatsapp' },
                { label: 'Motor de reservas', value: 'engine' },
                { label: 'Link interno', value: 'link' },
              ],
              admin: { width: '35%' },
            },
            {
              name: 'href',
              label: 'Destino',
              type: 'text',
              admin: {
                width: '35%',
                condition: (_, sibling) => sibling?.action === 'link',
              },
            },
          ],
        },
        /* Cada ação já tem um ícone padrão; este campo só entra quando o
           editor quer outro — foi assim que Promoções ganhou a etiqueta com
           "%" no lugar da etiqueta genérica. */
        iconField({ description: 'Opcional. Vazio, usa o ícone da ação.' }),
      ],
    },
    {
      type: 'collapsible',
      label: 'Aviso de cookies',
      fields: [
        {
          name: 'showCookie',
          label: 'Exibir',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'cookieText',
          label: 'Texto',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Utilizamos cookies para melhorar sua experiência de navegação. Ao continuar, você concorda com a nossa Política de Privacidade.',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'cookieMoreLabel',
              label: 'Botão secundário',
              type: 'text',
              localized: true,
              defaultValue: 'Saiba Mais',
              admin: { width: '33%' },
            },
            {
              name: 'cookieMoreHref',
              label: 'Destino',
              type: 'text',
              defaultValue: '/politica-de-privacidade',
              admin: { width: '33%' },
            },
            {
              name: 'cookieAcceptLabel',
              label: 'Botão principal',
              type: 'text',
              localized: true,
              defaultValue: 'Aceitar',
              admin: { width: '34%' },
            },
          ],
        },
      ],
    },
  ],
}
