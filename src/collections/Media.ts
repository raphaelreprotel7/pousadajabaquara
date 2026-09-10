import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '@/access'

/**
 * Uploads.
 *
 * O campo `category` é o que transforma a galeria de fotos em conteúdo
 * gerenciável: no site estático o agrupamento existia só no nome do arquivo
 * ("quadruplo-banheiro-01"). Aqui a foto pertence a uma categoria de verdade,
 * e o bloco de galeria monta os filtros a partir dela — sem duplicar imagem.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Mídia', plural: 'Mídias' },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'category', 'updatedAt'],
    group: 'Sistema',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumb', width: 480, height: undefined, position: 'centre' },
      { name: 'card', width: 900, height: undefined, position: 'centre' },
      { name: 'wide', width: 1600, height: undefined, position: 'centre' },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Texto alternativo',
      type: 'text',
      required: true,
      admin: {
        description:
          'Descreve a imagem para leitores de tela e para quando ela não carrega.',
      },
    },
    {
      name: 'category',
      label: 'Categoria na galeria',
      type: 'relationship',
      relationTo: 'photo-categories',
      admin: {
        position: 'sidebar',
        description: 'Define em qual filtro a foto aparece na página Fotos.',
      },
    },
    {
      name: 'credit',
      label: 'Crédito',
      type: 'text',
      admin: { position: 'sidebar' },
    },
  ],
}
