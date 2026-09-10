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
    /* Com o Blob ligado, o disco local não guarda nada — e é preciso dizer
       isso ao Payload. Sem esta linha ele ainda consulta `staticDir` para ver
       se o nome está livre: como a pasta local tem as imagens de quando o site
       rodou aqui, todo upload para produção saía renomeado (`logo-1.png`). Aí
       o seed, que casa mídia pelo nome do arquivo, nunca reencontrava o que
       tinha subido e criava uma cópia nova a cada execução. */
    disableLocalStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
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
