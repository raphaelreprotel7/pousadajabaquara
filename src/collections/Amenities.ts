import type { CollectionConfig } from 'payload'

import { anyone } from '@/access'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { iconField } from '@/fields/icon'

/**
 * Comodidades e serviços — vocabulário único.
 *
 * "Wi-Fi de alta velocidade" existe uma vez e é referenciado por cada suíte e
 * pela lista de serviços da página Hotel. Renomear aqui muda em todo o site;
 * no HTML estático isso exigiria editar cinco cards à mão.
 */
export const Amenities: CollectionConfig = {
  slug: 'amenities',
  labels: { singular: 'Comodidade', plural: 'Comodidades' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'icon', 'scope', 'order'],
    group: 'Conteúdo',
    description: 'Itens reutilizados pelas acomodações e pela página do hotel.',
  },
  access: { read: anyone, create: anyone, update: anyone, delete: anyone },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          label: 'Nome',
          type: 'text',
          required: true,
          localized: true,
          admin: { width: '60%' },
        },
        iconField({ width: '40%' }),
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'scope',
          label: 'Onde aparece',
          type: 'select',
          defaultValue: 'quarto',
          options: [
            { label: 'No quarto', value: 'quarto' },
            { label: 'Estrutura do hotel', value: 'hotel' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'order',
          label: 'Ordem',
          type: 'number',
          defaultValue: 0,
          admin: { width: '50%' },
        },
      ],
    },
  ],
}
