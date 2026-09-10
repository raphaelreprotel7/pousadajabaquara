import type { CollectionConfig } from 'payload'

import { anyone } from '@/access'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

/**
 * Depoimentos.
 *
 * A seção aparece em todas as páginas do site. Aqui os depoimentos ficam num
 * lugar só: trocar uma avaliação é editar um documento, não sete páginas.
 */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Depoimento', plural: 'Depoimentos' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'source', 'rating', 'order'],
    group: 'Conteúdo',
  },
  access: { read: anyone, create: anyone, update: anyone, delete: anyone },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'title',
      label: 'Título da avaliação',
      type: 'text',
      required: true,
      localized: true,
      admin: { placeholder: 'Ex.: Hotel de primeira' },
    },
    {
      name: 'quote',
      label: 'Depoimento',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'Sem aspas — o layout já as coloca.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'author',
          label: 'Autor',
          type: 'text',
          required: true,
          admin: { width: '40%', placeholder: 'Ex.: F.L.' },
        },
        {
          name: 'source',
          label: 'Origem',
          type: 'select',
          defaultValue: 'tripadvisor',
          options: [
            { label: 'Tripadvisor', value: 'tripadvisor' },
            { label: 'Google', value: 'google' },
            { label: 'Booking', value: 'booking' },
            { label: 'Direto', value: 'direto' },
          ],
          admin: { width: '30%' },
        },
        {
          name: 'rating',
          label: 'Nota',
          type: 'number',
          required: true,
          defaultValue: 5,
          min: 1,
          max: 5,
          admin: { width: '30%', description: 'Quantidade de estrelas exibidas.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'url',
          label: 'Link da avaliação original',
          type: 'text',
          admin: { width: '70%' },
        },
        {
          name: 'order',
          label: 'Ordem',
          type: 'number',
          defaultValue: 0,
          admin: { width: '30%' },
        },
      ],
    },
  ],
}
