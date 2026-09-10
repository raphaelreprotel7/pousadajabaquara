import type { CollectionConfig } from 'payload'

import { anyone, authenticatedOrPublished } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

/**
 * Blog.
 *
 * As relações no final não são enfeite: são o que leva o leitor do artigo para
 * a página que converte. "5 motivos" fala de acomodações e de localização —
 * ligar o post a esses documentos permite montar chamadas contextuais sem que
 * alguém precise lembrar de atualizar links à mão.
 */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Artigo', plural: 'Artigos' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    group: 'Blog',
  },
  access: {
    read: authenticatedOrPublished,
    create: anyone,
    update: anyone,
    delete: anyone,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  defaultSort: '-publishedAt',
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField('title'),
    {
      name: 'publishedAt',
      label: 'Publicado em',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'category',
      label: 'Categoria',
      type: 'relationship',
      relationTo: 'post-categories',
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Conteúdo',
          fields: [
            {
              name: 'lead',
              label: 'Linha de apoio',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Destacada com a barra vermelha no topo do artigo. Opcional.',
              },
            },
            {
              name: 'excerpt',
              label: 'Resumo',
              type: 'textarea',
              required: true,
              localized: true,
              admin: { description: 'Usado no card da listagem e nos relacionados.' },
            },
            {
              name: 'image',
              label: 'Imagem destacada',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'content',
              label: 'Texto',
              type: 'richText',
              required: true,
              localized: true,
            },
          ],
        },
        {
          label: 'Relacionados',
          description: 'O que este artigo menciona. Alimenta chamadas para conversão.',
          fields: [
            {
              name: 'relatedSuites',
              label: 'Acomodações citadas',
              type: 'relationship',
              relationTo: 'suites',
              hasMany: true,
            },
            {
              name: 'relatedAttractions',
              label: 'Pontos de interesse citados',
              type: 'relationship',
              relationTo: 'attractions',
              hasMany: true,
            },
            {
              name: 'relatedPosts',
              label: 'Artigos relacionados',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
              admin: {
                description:
                  'Vazio: o site mostra os artigos mais recentes automaticamente.',
              },
            },
          ],
        },
      ],
    },
  ],
}
