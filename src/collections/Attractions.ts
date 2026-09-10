import type { CollectionConfig } from 'payload'

import { anyone } from '@/access'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

/**
 * Pontos de interesse próximos.
 *
 * Distância em metros num campo numérico, não em texto: assim a lista ordena
 * por proximidade sozinha e o valor pode alimentar dados estruturados de SEO
 * local. A exibição ("1,7 km") é formatada na renderização.
 */
export const Attractions: CollectionConfig = {
  slug: 'attractions',
  labels: { singular: 'Ponto de interesse', plural: 'Pontos de interesse' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'distanceMeters', 'kind'],
    group: 'Conteúdo',
    description: 'Alimentam a lista da página Localização.',
  },
  access: { read: anyone, create: anyone, update: anyone, delete: anyone },
  defaultSort: 'distanceMeters',
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'title',
      label: 'Nome',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'distanceMeters',
          label: 'Distância (metros)',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            width: '50%',
            description: 'Exibido como "450 metros" ou "1,7 km" conforme o valor.',
          },
        },
        {
          name: 'kind',
          label: 'Tipo',
          type: 'select',
          defaultValue: 'geral',
          options: [
            { label: 'Geral', value: 'geral' },
            { label: 'Compras', value: 'compras' },
            { label: 'Cultura', value: 'cultura' },
            { label: 'Eventos', value: 'eventos' },
            { label: 'Transporte', value: 'transporte' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
  ],
}
