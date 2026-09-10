import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

/** Textos e ações compartilhados por todas as páginas de promoção. */
export const PromotionPage: GlobalConfig = {
  slug: 'promotion-page',
  label: 'Página de promoção',
  admin: { group: 'Configuração' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Textos',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'regulationTitle',
                  label: 'Título do regulamento',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Regulamento',
                  admin: { width: '50%' },
                },
                {
                  name: 'relatedTitle',
                  label: 'Título das relacionadas',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Outras promoções',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'conditionsLabel',
                  label: 'Aba Condições',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Condições',
                  admin: { width: '50%' },
                },
                {
                  name: 'validityLabel',
                  label: 'Aba Validade',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Validade',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'minimumNightsTemplate',
              label: 'Texto do mínimo de noites',
              type: 'text',
              localized: true,
              defaultValue: 'Mínimo de {n} noite(s)',
              admin: { description: 'Use {n} no lugar da quantidade.' },
            },
          ],
        },
        {
          label: 'CTAs',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'showWhatsapp',
                  label: 'Mostrar WhatsApp',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { width: '33%' },
                },
                {
                  name: 'showEmail',
                  label: 'Mostrar e-mail',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { width: '33%' },
                },
                {
                  name: 'showEngine',
                  label: 'Mostrar motor',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { width: '34%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'whatsappLabel',
                  label: 'Botão WhatsApp',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Reserve pelo WhatsApp',
                  admin: { width: '33%' },
                },
                {
                  name: 'emailLabel',
                  label: 'Botão e-mail',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Reserve pelo e-mail',
                  admin: { width: '33%' },
                },
                {
                  name: 'engineLabel',
                  label: 'Botão motor',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Reserve agora',
                  admin: { width: '34%' },
                },
              ],
            },
            {
              name: 'whatsappMessage',
              label: 'Mensagem do WhatsApp',
              type: 'textarea',
              localized: true,
              defaultValue: 'Olá! Gostaria de reservar a promoção: {title}',
              admin: { description: 'Use {title} para inserir o nome da promoção.' },
            },
            {
              name: 'emailSubject',
              label: 'Assunto do e-mail',
              type: 'text',
              localized: true,
              defaultValue: 'Reserva da promoção: {title}',
              admin: { description: 'Use {title} para inserir o nome da promoção.' },
            },
          ],
        },
        {
          label: 'Seções fixas',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'showTestimonials',
                  label: 'Depoimentos',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: { width: '50%' },
                },
                {
                  name: 'showNewsletter',
                  label: 'Newsletter',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
