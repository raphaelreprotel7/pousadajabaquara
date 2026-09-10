import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

/**
 * Newsletter — presente em todas as páginas.
 *
 * A home usa uma chamada e as páginas internas outra ("Receba as melhores
 * ofertas no seu email"), então os dois textos moram aqui e a página escolhe
 * qual variante exibe.
 */
export const NewsletterSection: GlobalConfig = {
  slug: 'newsletter-section',
  label: 'Newsletter',
  admin: { group: 'Seções fixas' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'background',
      label: 'Imagem de fundo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      type: 'collapsible',
      label: 'Variante da home',
      fields: [
        {
          name: 'homeTitle',
          label: 'Título',
          type: 'text',
          localized: true,
          defaultValue: 'Descubra experiências exclusivas',
        },
        {
          name: 'homeSubtitle',
          label: 'Subtítulo',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Receba em primeira mão ofertas especiais, novidades e inspirações para sua próxima estadia.',
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Variante das páginas internas',
      fields: [
        {
          name: 'innerTitle',
          label: 'Título',
          type: 'text',
          localized: true,
          defaultValue: 'Receba as melhores ofertas no seu email',
        },
        {
          name: 'innerSubtitle',
          label: 'Subtítulo',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Cadastre-se e receba em primeira mão promoções e novidades da Pousada Recanto do Jabaquara.',
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Formulário',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'namePlaceholder',
              label: 'Nome',
              type: 'text',
              localized: true,
              defaultValue: 'Nome',
              admin: { width: '25%' },
            },
            {
              name: 'emailPlaceholder',
              label: 'E-mail',
              type: 'text',
              localized: true,
              defaultValue: 'Email',
              admin: { width: '25%' },
            },
            {
              name: 'phonePlaceholder',
              label: 'Telefone',
              type: 'text',
              localized: true,
              defaultValue: 'Telefone',
              admin: { width: '25%' },
            },
            {
              name: 'submitLabel',
              label: 'Botão',
              type: 'text',
              localized: true,
              defaultValue: 'Cadastrar',
              admin: { width: '25%' },
            },
          ],
        },
        {
          name: 'consentText',
          label: 'Texto do consentimento',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Concordo em receber conteúdos e ofertas da Pousada Recanto do Jabaquara e li a Política de Privacidade.',
        },
        {
          name: 'form',
          label: 'Formulário que recebe os envios',
          type: 'relationship',
          relationTo: 'forms',
          admin: {
            description:
              'Criado em Formulários. Sem ele o cadastro não é gravado em lugar nenhum.',
          },
        },
      ],
    },
  ],
}
