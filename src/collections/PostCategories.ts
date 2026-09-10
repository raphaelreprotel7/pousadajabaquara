import type { CollectionConfig } from 'payload'

import { anyone } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

/** Taxonomia do blog. É o rótulo vermelho no topo do card do artigo. */
export const PostCategories: CollectionConfig = {
  slug: 'post-categories',
  labels: { singular: 'Categoria', plural: 'Categorias' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    group: 'Blog',
  },
  access: { read: anyone, create: anyone, update: anyone, delete: anyone },
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
    slugField('title'),
  ],
}
