import type { CollectionConfig } from 'payload'

import { anyone } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

/**
 * Categorias da galeria de fotos.
 *
 * São os botões de filtro da página Fotos ("Todas", "Acomodações", "Café da
 * Manhã", "Áreas Comuns"). Criar uma categoria nova cria o filtro sozinho —
 * no site estático era preciso editar o HTML e o JS.
 */
export const PhotoCategories: CollectionConfig = {
  slug: 'photo-categories',
  labels: { singular: 'Categoria de foto', plural: 'Categorias de foto' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order'],
    group: 'Conteúdo',
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
    slugField('title'),
  ],
}
