import type { CollectionConfig } from 'payload'

import { anyone } from '@/access'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

/**
 * Perguntas frequentes.
 *
 * Categorizadas para permitir mostrar só o que interessa em cada contexto —
 * as perguntas de quarto na página de Acomodações, as de estrutura na home.
 * A resposta é rich text porque uma delas (novas regras de hospedagem) tem
 * vários parágrafos e subtítulos.
 */
export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'Dúvida frequente', plural: 'Dúvidas frequentes' },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'order'],
    group: 'Conteúdo',
  },
  access: { read: anyone, create: anyone, update: anyone, delete: anyone },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'question',
      label: 'Pergunta',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'answer',
      label: 'Resposta',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          label: 'Categoria',
          type: 'select',
          defaultValue: 'geral',
          options: [
            { label: 'Geral', value: 'geral' },
            { label: 'Café da manhã', value: 'cafe' },
            { label: 'Acomodações', value: 'quartos' },
            { label: 'Localização', value: 'localizacao' },
            { label: 'Políticas', value: 'politicas' },
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
  ],
}
