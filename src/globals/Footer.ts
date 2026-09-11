import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

/**
 * Rodapé.
 *
 * Os dados de contato NÃO ficam aqui — vêm de Configurações do site, para não
 * existirem em dois lugares. Este global guarda só o que é do rodapé: o texto
 * da marca, as colunas de links e a linha de copyright.
 */
export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Rodapé',
  admin: { group: 'Configuração' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'about',
      label: 'Texto da marca',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Duas ou três linhas sobre o hotel. Aparece na primeira coluna do rodapé.',
      },
    },
    {
      name: 'contactTitle',
      label: 'Título da coluna de contato',
      type: 'text',
      localized: true,
      defaultValue: 'Contato',
    },
    {
      type: 'collapsible',
      label: 'Rótulos dos telefones',
      admin: {
        description:
          'Com dois números no rodapé, o rótulo é o que diz ao hóspede para onde cada um liga.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'phoneCaption',
              label: 'Telefone do hotel',
              type: 'text',
              localized: true,
              defaultValue: 'Contato do Hotel',
              admin: { width: '50%' },
            },
            {
              name: 'reservationsCaption',
              label: 'Central de reservas',
              type: 'text',
              localized: true,
              defaultValue: 'Central de reservas',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      name: 'columns',
      label: 'Colunas de links',
      type: 'array',
      maxRows: 4,
      labels: { singular: 'Coluna', plural: 'Colunas' },
      fields: [
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'links',
          label: 'Links',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'label',
                  label: 'Rótulo',
                  type: 'text',
                  required: true,
                  localized: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'href',
                  label: 'Destino',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'seals',
      label: 'Selos e certificações',
      type: 'array',
      labels: { singular: 'Selo', plural: 'Selos' },
      admin: {
        description:
          'Aparecem discretos acima da linha final. Use PNG com fundo transparente; a altura é padronizada em 34px.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'image',
              label: 'Imagem',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { width: '40%' },
            },
            {
              name: 'label',
              label: 'Descrição',
              type: 'text',
              required: true,
              localized: true,
              admin: { width: '30%', description: 'Lida por leitor de tela.' },
            },
            {
              name: 'href',
              label: 'Link',
              type: 'text',
              admin: { width: '30%', description: 'Opcional.' },
            },
          ],
        },
      ],
    },
    {
      name: 'bottomText',
      label: 'Linha final',
      type: 'text',
      localized: true,
      defaultValue:
        'Pousada Recanto do Jabaquara © 2026 — Todos os direitos reservados · Desenvolvido por Reprotel',
    },
  ],
}
