import type { CollectionConfig } from 'payload'

import { anyone } from '@/access'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { iconField } from '@/fields/icon'

/**
 * Diferenciais do hotel.
 *
 * O bloco da home tem duas apresentações para o mesmo tipo de informação:
 * três cards com foto ("Café da manhã completo") e seis caixas com ícone
 * ("Café da manhã incluso"). Em vez de duas coleções quase iguais, o campo
 * `kind` diz qual formato o item serve — o bloco filtra por ele.
 */
export const Differentials: CollectionConfig = {
  slug: 'differentials',
  labels: { singular: 'Diferencial', plural: 'Diferenciais' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'order'],
    group: 'Conteúdo',
    description:
      'Vantagens do hotel. "Destaque" vira card com foto; "Apoio de venda" vira caixa com ícone.',
  },
  access: { read: anyone, create: anyone, update: anyone, delete: anyone },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'title',
      label: 'Texto',
      type: 'text',
      required: true,
      localized: true,
      admin: { placeholder: 'Ex.: Café da manhã completo' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          label: 'Formato',
          type: 'select',
          required: true,
          defaultValue: 'venda',
          options: [
            { label: 'Destaque (card com foto)', value: 'destaque' },
            { label: 'Apoio de venda (caixa com ícone)', value: 'venda' },
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
    {
      name: 'image',
      label: 'Foto',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) => siblingData?.kind === 'destaque',
        description: 'Usada no card grande.',
      },
    },
    iconField({ condition: (_, siblingData) => siblingData?.kind === 'venda' }),
  ],
}
