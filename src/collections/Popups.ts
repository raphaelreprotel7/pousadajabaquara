import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

/**
 * Pop-ups do site.
 *
 * O layout não é livre: o editor escolhe uma das três variantes (só texto,
 * com imagem ou com formulário) e o pop-up se monta com os tokens do design
 * system — mesma tipografia, mesmo vermelho, mesmos botões do resto do site.
 * Isso evita que cada campanha invente um visual próprio.
 *
 * Vigência e gatilho ficam no mesmo documento: quem cria a campanha define
 * quando ela aparece e quando sai do ar, sem depender de alguém lembrar de
 * desligar depois.
 */
export const Popups: CollectionConfig = {
  slug: 'popups',
  labels: { singular: 'Pop-up', plural: 'Pop-ups' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'variant', 'trigger', 'endsAt', 'isActive'],
    group: 'Conversão',
    description:
      'Aparecem sobre o site conforme o gatilho. Fora da vigência somem sozinhos.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: false, maxPerDoc: 20 },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          label: 'Nome interno',
          type: 'text',
          required: true,
          admin: {
            width: '70%',
            placeholder: 'Ex.: Campanha de inverno — newsletter',
            description: 'Só para você identificar na lista. Não aparece no site.',
          },
        },
        {
          name: 'isActive',
          label: 'Ativo',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '30%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },

    {
      type: 'tabs',
      tabs: [
        /* ----------------------------- CONTEÚDO ---------------------------- */
        {
          label: 'Conteúdo',
          fields: [
            {
              name: 'variant',
              label: 'Tipo de pop-up',
              type: 'select',
              required: true,
              defaultValue: 'text',
              options: [
                { label: 'Só texto', value: 'text' },
                { label: 'Com imagem', value: 'image' },
                { label: 'Com formulário', value: 'form' },
              ],
              admin: {
                description: 'Define como o pop-up se monta. O visual segue o design system.',
              },
            },
            {
              name: 'eyebrow',
              label: 'Sobretítulo',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Ex.: Oferta por tempo limitado' },
            },
            {
              name: 'heading',
              label: 'Título',
              type: 'text',
              required: true,
              localized: true,
              admin: { description: 'A última palavra sai em vermelho, como no resto do site.' },
            },
            {
              name: 'text',
              label: 'Texto',
              type: 'textarea',
              localized: true,
            },

            /* imagem */
            {
              name: 'image',
              label: 'Imagem',
              type: 'upload',
              relationTo: 'media',
              admin: {
                condition: (_, s) => s?.variant === 'image',
              },
            },
            {
              name: 'imagePosition',
              label: 'Posição da imagem',
              type: 'select',
              defaultValue: 'side',
              options: [
                { label: 'Ao lado do texto', value: 'side' },
                { label: 'Acima do texto', value: 'top' },
              ],
              admin: {
                condition: (_, s) => s?.variant === 'image',
                description: 'No celular a imagem sempre vai para cima.',
              },
            },

            /* formulário */
            {
              name: 'form',
              label: 'Formulário',
              type: 'relationship',
              relationTo: 'forms',
              admin: {
                condition: (_, s) => s?.variant === 'form',
                description:
                  'Criado em Formulários. O redirect de sucesso dele vale aqui também.',
              },
            },
            {
              name: 'consentText',
              label: 'Texto de consentimento',
              type: 'textarea',
              localized: true,
              admin: { condition: (_, s) => s?.variant === 'form' },
            },

            /* botão */
            {
              type: 'row',
              admin: { condition: (_, s) => s?.variant !== 'form' },
              fields: [
                {
                  name: 'ctaLabel',
                  label: 'Botão',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Faça uma reserva',
                  admin: { width: '40%' },
                },
                {
                  name: 'ctaType',
                  label: 'Ação',
                  type: 'select',
                  defaultValue: 'engine',
                  options: [
                    { label: 'Abrir motor de reservas', value: 'engine' },
                    { label: 'Motor de reservas com data específica', value: 'engineDates' },
                    { label: 'Ir para um link', value: 'link' },
                    { label: 'Só fechar', value: 'close' },
                  ],
                  admin: { width: '35%' },
                },
                {
                  name: 'ctaHref',
                  label: 'Link',
                  type: 'text',
                  admin: {
                    width: '25%',
                    condition: (_, s) => s?.ctaType === 'link',
                  },
                },
              ],
            },

            /* datas fixas para o motor — campanhas do tipo "feriado de 7/9" */
            {
              type: 'row',
              admin: { condition: (_, s) => s?.ctaType === 'engineDates' },
              fields: [
                {
                  name: 'ctaCheckIn',
                  label: 'Check-in',
                  type: 'date',
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
                    description: 'O motor abre já com esta data preenchida.',
                  },
                  validate: (value: unknown, { siblingData }: any) => {
                    if (siblingData?.ctaType !== 'engineDates') return true
                    if (!value) return 'Informe a data de check-in.'
                    return true
                  },
                },
                {
                  name: 'ctaCheckOut',
                  label: 'Check-out',
                  type: 'date',
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
                    description:
                      'Datas no passado levam a uma busca vazia — alinhe com a expiração do pop-up.',
                  },
                  validate: (value: unknown, { siblingData }: any) => {
                    if (siblingData?.ctaType !== 'engineDates') return true
                    if (!value) return 'Informe a data de check-out.'
                    const entrada = siblingData?.ctaCheckIn
                    if (entrada && String(value).slice(0, 10) <= String(entrada).slice(0, 10)) {
                      return 'O check-out precisa ser depois do check-in.'
                    }
                    return true
                  },
                },
              ],
            },
          ],
        },

        /* ----------------------------- GATILHOS ---------------------------- */
        {
          label: 'Gatilhos',
          description: 'Quando o pop-up aparece e com que frequência.',
          fields: [
            {
              name: 'trigger',
              label: 'Aparece',
              type: 'select',
              required: true,
              defaultValue: 'delay',
              options: [
                { label: 'Depois de alguns segundos', value: 'delay' },
                { label: 'Ao rolar a página', value: 'scroll' },
                { label: 'Quando o visitante vai sair (intenção de saída)', value: 'exit' },
                { label: 'Assim que a página abre', value: 'immediate' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'delaySeconds',
                  label: 'Segundos de espera',
                  type: 'number',
                  defaultValue: 8,
                  min: 0,
                  max: 300,
                  admin: {
                    width: '50%',
                    condition: (_, s) => s?.trigger === 'delay',
                  },
                },
                {
                  name: 'scrollPercent',
                  label: 'Percentual da página rolado',
                  type: 'number',
                  defaultValue: 50,
                  min: 1,
                  max: 100,
                  admin: {
                    width: '50%',
                    condition: (_, s) => s?.trigger === 'scroll',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'frequency',
                  label: 'Frequência',
                  type: 'select',
                  required: true,
                  defaultValue: 'session',
                  options: [
                    { label: 'Uma vez por visita', value: 'session' },
                    { label: 'Uma vez a cada X dias', value: 'days' },
                    { label: 'Toda vez (para testes)', value: 'always' },
                  ],
                  admin: { width: '50%' },
                },
                {
                  name: 'frequencyDays',
                  label: 'A cada quantos dias',
                  type: 'number',
                  defaultValue: 7,
                  min: 1,
                  max: 365,
                  admin: {
                    width: '50%',
                    condition: (_, s) => s?.frequency === 'days',
                  },
                },
              ],
            },
            {
              name: 'hideAfterConvert',
              label: 'Não mostrar mais para quem já converteu',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'Quem enviou o formulário ou clicou no botão não vê o pop-up de novo.',
              },
            },
          ],
        },

        /* ---------------------------- EXIBIÇÃO ----------------------------- */
        {
          label: 'Exibição',
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
                    description: 'Passada a data, some do site sozinho.',
                  },
                },
              ],
            },
            {
              name: 'showOn',
              label: 'Em quais páginas',
              type: 'select',
              required: true,
              defaultValue: 'all',
              options: [
                { label: 'Todas as páginas', value: 'all' },
                { label: 'Apenas nas escolhidas', value: 'only' },
                { label: 'Em todas, exceto as escolhidas', value: 'except' },
              ],
            },
            {
              name: 'pages',
              label: 'Páginas',
              type: 'relationship',
              relationTo: 'pages',
              hasMany: true,
              admin: { condition: (_, s) => s?.showOn !== 'all' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'position',
                  label: 'Posição',
                  type: 'select',
                  defaultValue: 'center',
                  options: [
                    { label: 'Centro da tela', value: 'center' },
                    { label: 'Canto inferior direito', value: 'corner' },
                  ],
                  admin: { width: '33%' },
                },
                {
                  name: 'size',
                  label: 'Tamanho',
                  type: 'select',
                  defaultValue: 'md',
                  options: [
                    { label: 'Pequeno', value: 'sm' },
                    { label: 'Médio', value: 'md' },
                    { label: 'Grande', value: 'lg' },
                  ],
                  admin: { width: '33%' },
                },
                {
                  name: 'theme',
                  label: 'Tema',
                  type: 'select',
                  defaultValue: 'light',
                  options: [
                    { label: 'Claro', value: 'light' },
                    { label: 'Escuro', value: 'dark' },
                  ],
                  admin: { width: '34%' },
                },
              ],
            },
            {
              name: 'priority',
              label: 'Prioridade',
              type: 'number',
              defaultValue: 0,
              admin: {
                description:
                  'Só um pop-up aparece por página. Havendo mais de um elegível, ganha o de maior prioridade.',
              },
            },
          ],
        },
      ],
    },
  ],
}
