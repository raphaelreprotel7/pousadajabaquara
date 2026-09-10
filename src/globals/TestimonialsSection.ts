import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

/**
 * Seção de depoimentos — presente em todas as páginas.
 *
 * Guarda só a apresentação (título e quais depoimentos). O conteúdo vem da
 * collection Testimonials.
 */
export const TestimonialsSection: GlobalConfig = {
  slug: 'testimonials-section',
  label: 'Seção de depoimentos',
  admin: { group: 'Seções fixas' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'eyebrow',
      label: 'Sobretítulo',
      type: 'text',
      localized: true,
      admin: { description: 'Vazio esconde a linha. Ex.: "Avaliações".' },
    },
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      localized: true,
      defaultValue: 'O que dizem nossos hóspedes',
      admin: {
        description:
          'A última palavra sai em vermelho automaticamente, como no layout.',
      },
    },
    {
      name: 'lead',
      label: 'Texto de apoio',
      type: 'textarea',
      localized: true,
      admin: { description: 'Parágrafo abaixo do título. Vazio esconde.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ctaLabel',
          label: 'Botão',
          type: 'text',
          localized: true,
          admin: { width: '50%', description: 'Vazio esconde o botão.' },
        },
        {
          name: 'ctaHref',
          label: 'Link do botão',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          label: 'Quais depoimentos',
          type: 'select',
          required: true,
          defaultValue: 'auto',
          options: [
            { label: 'Os primeiros da lista (por ordem)', value: 'auto' },
            { label: 'Escolher manualmente', value: 'manual' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'limit',
          label: 'Quantidade',
          type: 'number',
          defaultValue: 3,
          min: 1,
          max: 12,
          admin: {
            width: '50%',
            condition: (_, sibling) => sibling?.source !== 'manual',
          },
        },
      ],
    },
    {
      name: 'items',
      label: 'Depoimentos',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
      admin: { condition: (_, sibling) => sibling?.source === 'manual' },
    },
  ],
}
