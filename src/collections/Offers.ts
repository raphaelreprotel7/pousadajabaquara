import type { CollectionConfig } from 'payload'

import { anyone, authenticatedOrPublished } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

/**
 * Promoções e pacotes.
 *
 * A janela de vigência é o ponto: a oferta sai do ar sozinha quando `endsAt`
 * passa, sem ninguém precisar lembrar de tirar o banner. A página Promoções
 * cai no estado vazio automaticamente quando não há nenhuma vigente — que é
 * exatamente o comportamento do site hoje.
 */
export const Offers: CollectionConfig = {
  slug: 'offers',
  labels: { singular: 'Promoção', plural: 'Promoções' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'endsAt', '_status'],
    group: 'Conteúdo',
    description: 'Fora da janela de vigência a promoção deixa de aparecer no site.',
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
      label: 'Título',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField('title'),
    {
      name: 'summary',
      label: 'Chamada',
      type: 'textarea',
      localized: true,
      admin: { description: 'Texto curto do card.' },
    },
    {
      name: 'image',
      label: 'Imagem principal / card',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'gallery',
      label: 'Galeria da página',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      admin: {
        description:
          'Até 4 imagens. Com 4 fotos, a página usa o mosaico 2×2 do modelo.',
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
    {
      name: 'description',
      label: 'Apresentação da promoção',
      type: 'richText',
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'highlight',
          label: 'Destaque',
          type: 'text',
          localized: true,
          admin: { width: '50%', placeholder: 'Ex.: Até 35% OFF' },
        },
        {
          name: 'minimumNights',
          label: 'Mínimo de noites',
          type: 'number',
          min: 1,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'suites',
      label: 'Acomodações incluídas',
      type: 'relationship',
      relationTo: 'suites',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Exibição',
          description: 'Defina quando a promoção entra e sai do site automaticamente.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'startsAt',
                  label: 'Começa em',
                  type: 'date',
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayAndTime' },
                    description: 'Vazio = já vale.',
                  },
                },
                {
                  name: 'endsAt',
                  label: 'Expira em',
                  type: 'date',
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayAndTime' },
                    description: 'Passada a data, some do site sozinho. Vazio = sem prazo.',
                  },
                  validate: (value: unknown, { siblingData }: any) => {
                    const inicio = siblingData?.startsAt
                    if (value && inicio && new Date(String(value)) <= new Date(String(inicio))) {
                      return 'A expiração precisa ser depois do início da promoção.'
                    }
                    return true
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Regulamento',
          fields: [
            {
              name: 'conditions',
              label: 'Condições',
              type: 'richText',
              localized: true,
            },
            {
              name: 'validityRules',
              label: 'Validade e períodos',
              type: 'richText',
              localized: true,
            },
          ],
        },
        {
          label: 'Botões',
          description:
            'O texto e a visibilidade padrão vêm da Configuração da página. Aqui você pode sobrescrever só esta promoção.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'whatsappLabel',
                  label: 'WhatsApp — rótulo personalizado',
                  type: 'text',
                  localized: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'emailLabel',
                  label: 'E-mail — rótulo personalizado',
                  type: 'text',
                  localized: true,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'engineLabel',
              label: 'Motor — rótulo personalizado',
              type: 'text',
              localized: true,
            },
          ],
        },
        {
          label: 'Relacionadas',
          fields: [
            {
              name: 'relatedOffers',
              label: 'Promoções relacionadas',
              type: 'relationship',
              relationTo: 'offers',
              hasMany: true,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
              admin: {
                description:
                  'Vazio: o site escolhe automaticamente até 3 promoções vigentes.',
              },
            },
          ],
        },
      ],
    },
  ],
}
