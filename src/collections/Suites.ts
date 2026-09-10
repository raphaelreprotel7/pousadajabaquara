import type { CollectionConfig } from 'payload'

import { anyone, authenticatedOrPublished } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

/**
 * Acomodações.
 *
 * Cada tipo de quarto é um documento. A mesma suíte alimenta três lugares do
 * site sem ser reescrita: o carrossel da home, a listagem de Acomodações e o
 * carrossel de fotos dentro do card. As comodidades vêm por relação — "Wi-Fi de
 * alta velocidade" é escrito uma vez em Amenities e referenciado por todas.
 */
export const Suites: CollectionConfig = {
  slug: 'suites',
  labels: { singular: 'Acomodação', plural: 'Acomodações' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'updatedAt'],
    group: 'Conteúdo',
    description: 'Tipos de quarto. A ordem controla a sequência na home e na listagem.',
  },
  access: {
    read: authenticatedOrPublished,
    create: anyone,
    update: anyone,
    delete: anyone,
  },
  versions: { drafts: true, maxPerDoc: 20 },
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
      admin: { placeholder: 'Ex.: Quarto Casal' },
    },
    slugField('title'),
    {
      name: 'shortName',
      label: 'Nome curto (carrossel da home)',
      type: 'text',
      localized: true,
      admin: {
        description: 'Aparece no card da home. Ex.: "Casal". Vazio usa o nome completo.',
      },
    },
    {
      name: 'order',
      label: 'Ordem',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Conteúdo',
          fields: [
            {
              name: 'summary',
              label: 'Resumo',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Uma linha, usada no card do carrossel da home.',
              },
            },
            {
              name: 'description',
              label: 'Descrição',
              type: 'richText',
              localized: true,
            },
            {
              name: 'photos',
              label: 'Fotos',
              type: 'array',
              minRows: 1,
              labels: { singular: 'Foto', plural: 'Fotos' },
              admin: {
                description:
                  'Viram o carrossel do card na página de Acomodações. As setas e os pontinhos são gerados pela quantidade.',
              },
              fields: [
                {
                  name: 'image',
                  label: 'Imagem',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Características',
          fields: [
            {
              name: 'amenities',
              label: 'Comodidades',
              type: 'relationship',
              relationTo: 'amenities',
              hasMany: true,
              admin: {
                description:
                  'Aparecem com ícone no card. A ordem escolhida aqui é a ordem exibida.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'maxGuests',
                  label: 'Ocupação máxima',
                  type: 'number',
                  min: 1,
                  max: 10,
                  admin: { width: '50%' },
                },
                {
                  name: 'engineCode',
                  label: 'Código no motor de reservas',
                  type: 'text',
                  admin: {
                    width: '50%',
                    description: 'Opcional. Permite linkar direto para o quarto no Omnibees.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
