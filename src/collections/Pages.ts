import type { CollectionConfig } from 'payload'

import { anyone, authenticatedOrPublished } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { pageBlocks } from '@/blocks/configs'

/**
 * Páginas com page builder.
 *
 * O layout é uma lista de blocos na ordem em que o editor montar. As seções
 * fixas (barra de reserva, depoimentos, newsletter, cabeçalho e rodapé) não
 * entram aqui — são montadas pelo template a partir dos globals, e os
 * interruptores abaixo permitem esconder alguma numa página específica.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Página', plural: 'Páginas' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Conteúdo',
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL}/${data?.slug === 'home' ? '' : data?.slug ?? ''}`,
    },
  },
  access: {
    read: authenticatedOrPublished,
    create: anyone,
    update: anyone,
    delete: anyone,
  },
  versions: { drafts: true, maxPerDoc: 30 },
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
      type: 'tabs',
      tabs: [
        {
          label: 'Layout',
          fields: [
            {
              name: 'layout',
              label: 'Blocos',
              type: 'blocks',
              blocks: pageBlocks,
              admin: {
                initCollapsed: true,
                description: 'Arraste para reordenar. Cada bloco é uma seção da página.',
              },
            },
          ],
        },
        {
          label: 'Seções fixas',
          description:
            'Aparecem em todas as páginas. Desmarque para esconder só nesta.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'showBookingBar',
                  label: 'Barra de reserva',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { width: '33%' },
                },
                {
                  name: 'showTestimonials',
                  label: 'Depoimentos',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { width: '33%' },
                },
                {
                  name: 'testimonialsAfterBlock',
                  label: 'Depoimentos após o bloco nº',
                  type: 'number',
                  min: 1,
                  admin: {
                    width: '33%',
                    description:
                      'Vazio = no fim da página, depois de todos os blocos. ' +
                      'Informe o número do bloco (1 = primeiro) para inserir a ' +
                      'seção logo depois dele — a home do cliente coloca os ' +
                      'depoimentos antes das dúvidas frequentes.',
                    condition: (_: unknown, irmaos: { showTestimonials?: boolean }) =>
                      irmaos?.showTestimonials !== false,
                  },
                },
                {
                  name: 'showNewsletter',
                  label: 'Newsletter',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { width: '34%' },
                },
              ],
            },
            {
              name: 'newsletterVariant',
              label: 'Variante da newsletter',
              type: 'select',
              defaultValue: 'inner',
              options: [
                { label: 'Home', value: 'home' },
                { label: 'Páginas internas', value: 'inner' },
              ],
              admin: { condition: (data) => Boolean(data?.showNewsletter) },
            },
          ],
        },
      ],
    },
  ],
}
