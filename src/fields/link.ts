import type { Field } from 'payload'

type LinkOptions = {
  /** Nome do grupo. Padrão: "link". */
  name?: string
  /** Rótulo exibido no admin. */
  label?: string
  /** Inclui o campo de rótulo do botão. Padrão: true. */
  withLabel?: boolean
  /** Torna o rótulo obrigatório. */
  required?: boolean
}

/**
 * Campo de link reutilizável: aponta para um documento interno (Página/Suíte)
 * ou para uma URL externa. Usado no menu, nos CTAs e no rodapé.
 */
export const linkField = ({
  name = 'link',
  label = 'Link',
  withLabel = true,
  required = false,
}: LinkOptions = {}): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    ...(withLabel
      ? ([
          {
            name: 'label',
            label: 'Rótulo',
            type: 'text',
            required,
            localized: true,
          },
        ] as Field[])
      : []),
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          label: 'Tipo',
          type: 'radio',
          defaultValue: 'reference',
          options: [
            { label: 'Documento interno', value: 'reference' },
            { label: 'URL externa', value: 'custom' },
          ],
          admin: { layout: 'horizontal', width: '50%' },
        },
        {
          name: 'newTab',
          label: 'Abrir em nova aba',
          type: 'checkbox',
          admin: { width: '50%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },
    {
      name: 'reference',
      label: 'Documento',
      type: 'relationship',
      relationTo: ['pages', 'suites'],
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
        placeholder: 'https://…  ou  #ancora  ou  /caminho',
      },
    },
  ],
})
