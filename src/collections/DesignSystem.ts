import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { revalidateAfterChange } from '@/hooks/revalidate'

/**
 * Design System — a fonte da verdade visual do site.
 *
 * É uma COLLECTION e não um global de propósito: permite manter mais de um tema
 * (sazonal, campanha, teste) e alternar qual está no ar. `isActive` elege o
 * vigente e o hook garante que só exista um por vez.
 *
 * Os tokens viram CSS custom properties injetadas no <head> pelo componente
 * DesignTokens, sobrescrevendo o :root do styles.css.
 *
 * Os defaults abaixo são uma BASE NEUTRA de propósito — grafite, sem cor de
 * marca. Quem manda é o tema criado a partir da home do cliente: é ele que traz
 * a paleta, a tipografia e as medidas reais. Um site que suba cinza é sinal de
 * que o tema não foi cadastrado ou não está ativo.
 */
export const DesignSystem: CollectionConfig = {
  slug: 'design-system',
  labels: { singular: 'Design System', plural: 'Design System' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'isActive', 'updatedAt'],
    group: 'Design',
    description: 'Cores, tipografia, espaçamento e formas. Só um documento fica ativo por vez.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: false, maxPerDoc: 20 },
  hooks: {
    afterChange: [
      revalidateAfterChange,
      // Garante um único tema ativo: ao ligar este, desliga os demais.
      async ({ doc, req, previousDoc, operation }) => {
        if (!doc?.isActive) return doc
        if (operation === 'update' && previousDoc?.isActive) return doc

        const others = await req.payload.find({
          collection: 'design-system',
          limit: 100,
          depth: 0,
          where: { and: [{ isActive: { equals: true } }, { id: { not_equals: doc.id } }] },
          req,
        })

        for (const other of others.docs) {
          await req.payload.update({
            collection: 'design-system',
            id: other.id,
            data: { isActive: false },
            context: { disableRevalidate: true },
            req,
          })
        }

        return doc
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          label: 'Nome do tema',
          type: 'text',
          required: true,
          admin: { width: '70%', placeholder: 'Ex.: Pousada Recanto do Jabaquara — padrão' },
        },
        {
          name: 'isActive',
          label: 'Ativo no site',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '30%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        /* ------------------------------ CORES ------------------------------ */
        {
          label: 'Cores',
          description: 'Cada cor vira uma CSS custom property de mesmo nome.',
          fields: [
            {
              name: 'colors',
              label: false,
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'brand',
                      label: 'Marca (botões, destaques)',
                      type: 'text',
                      required: true,
                      defaultValue: '#3A3A3A',
                      admin: { width: '50%', description: '--red' },
                    },
                    {
                      name: 'brandDark',
                      label: 'Marca — hover',
                      type: 'text',
                      required: true,
                      defaultValue: '#1F1F1F',
                      admin: { width: '50%', description: '--red-dark' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ink',
                      label: 'Texto principal',
                      type: 'text',
                      required: true,
                      defaultValue: '#1E1E1E',
                      admin: { width: '33%', description: '--ink' },
                    },
                    {
                      name: 'inkSoft',
                      label: 'Texto secundário',
                      type: 'text',
                      required: true,
                      defaultValue: '#6E6E6E',
                      admin: { width: '33%', description: '--gray-text' },
                    },
                    {
                      name: 'inkMute',
                      label: 'Texto discreto',
                      type: 'text',
                      required: true,
                      defaultValue: '#9A9A9A',
                      admin: { width: '34%', description: '--gray-soft' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'surface',
                      label: 'Fundo de seção',
                      type: 'text',
                      required: true,
                      defaultValue: '#F4F4F4',
                      admin: { width: '25%', description: '--gray-bg' },
                    },
                    {
                      name: 'line',
                      label: 'Bordas',
                      type: 'text',
                      required: true,
                      defaultValue: '#E2E2E2',
                      admin: { width: '25%', description: '--gray-line' },
                    },
                    {
                      name: 'footer',
                      label: 'Fundo do rodapé',
                      type: 'text',
                      required: true,
                      defaultValue: '#2A2A2A',
                      admin: { width: '25%', description: '--ink-2' },
                    },
                    {
                      name: 'dark',
                      label: 'Fundo escuro (banners)',
                      type: 'text',
                      required: true,
                      defaultValue: '#141414',
                      admin: { width: '25%', description: '--ink-3' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'accent',
                      label: 'Rosa decorativo',
                      type: 'text',
                      required: true,
                      defaultValue: '#E4E4E4',
                      admin: { width: '50%', description: '--pink' },
                    },
                    {
                      name: 'whatsapp',
                      label: 'Verde do WhatsApp',
                      type: 'text',
                      required: true,
                      defaultValue: '#25D366',
                      admin: { width: '50%', description: '--wa' },
                    },
                  ],
                },
              ],
            },
          ],
        },

        /* --------------------------- TIPOGRAFIA --------------------------- */
        {
          label: 'Tipografia',
          fields: [
            {
              name: 'typography',
              label: false,
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'displayFamily',
                      label: 'Fonte de títulos',
                      type: 'text',
                      required: true,
                      defaultValue:
                        "'Montserrat',system-ui,-apple-system,'Segoe UI',sans-serif",
                      admin: { width: '50%', description: '--ff-head' },
                    },
                    {
                      name: 'bodyFamily',
                      label: 'Fonte de texto',
                      type: 'text',
                      required: true,
                      defaultValue: "'Lato','Montserrat',system-ui,sans-serif",
                      admin: { width: '50%', description: '--ff-body' },
                    },
                  ],
                },
                {
                  name: 'webfontUrl',
                  label: 'URL do provedor de fontes',
                  type: 'text',
                  defaultValue:
                    'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Lato:wght@300;400;700&display=swap',
                  admin: {
                    description:
                      'Carregada no <head>. Deixe vazio se as fontes forem auto-hospedadas.',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'baseSize',
                      label: 'Tamanho base (px)',
                      type: 'number',
                      required: true,
                      defaultValue: 16.5,
                      min: 10,
                      max: 24,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'baseLineHeight',
                      label: 'Entrelinha base',
                      type: 'number',
                      required: true,
                      defaultValue: 1.75,
                      min: 1,
                      max: 3,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'headingSize',
                      label: 'Tamanho de título de seção (px)',
                      type: 'number',
                      required: true,
                      defaultValue: 28.5,
                      min: 16,
                      max: 96,
                      admin: { width: '34%' },
                    },
                  ],
                },
              ],
            },
          ],
        },

        /* ---------------------------- LAYOUT ------------------------------ */
        {
          label: 'Layout',
          fields: [
            {
              name: 'layout',
              label: false,
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'container',
                      label: 'Largura do container (px)',
                      type: 'number',
                      required: true,
                      defaultValue: 1180,
                      admin: { width: '50%', description: '--shell' },
                    },
                    {
                      name: 'sectionSpacing',
                      label: 'Respiro entre seções (px)',
                      type: 'number',
                      required: true,
                      defaultValue: 92,
                      min: 0,
                      max: 240,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'heroHeight',
                      label: 'Altura do banner da home (px)',
                      type: 'number',
                      required: true,
                      defaultValue: 640,
                      min: 240,
                      max: 1200,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'pageHeroHeight',
                      label: 'Altura do banner interno (px)',
                      type: 'number',
                      required: true,
                      defaultValue: 400,
                      min: 200,
                      max: 900,
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
          ],
        },

        /* ---------------------------- FORMAS ------------------------------ */
        {
          label: 'Formas',
          fields: [
            {
              name: 'shape',
              label: false,
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'buttonRadius',
                      label: 'Raio dos botões (px)',
                      type: 'number',
                      required: true,
                      defaultValue: 0,
                      min: 0,
                      max: 60,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'cardRadius',
                      label: 'Raio dos cards (px)',
                      type: 'number',
                      required: true,
                      defaultValue: 0,
                      min: 0,
                      max: 60,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'cardShadow',
                  label: 'Sombra dos cards',
                  type: 'text',
                  defaultValue: 'none',
                  admin: { description: 'Valor CSS de box-shadow. "none" para desligar.' },
                },
              ],
            },
          ],
        },

        /* -------------------------- PROMOÇÕES ---------------------------- */
        {
          label: 'Promoções',
          description: 'Medidas do template de detalhe das promoções.',
          fields: [
            {
              name: 'promotion',
              label: false,
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'galleryHeight',
                      label: 'Altura da galeria (px)',
                      type: 'number',
                      required: true,
                      defaultValue: 520,
                      min: 280,
                      max: 900,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'galleryGap',
                      label: 'Espaço entre fotos (px)',
                      type: 'number',
                      required: true,
                      defaultValue: 2,
                      min: 0,
                      max: 24,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'contentGap',
                      label: 'Espaço entre colunas (px)',
                      type: 'number',
                      required: true,
                      defaultValue: 72,
                      min: 16,
                      max: 160,
                      admin: { width: '34%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'relatedColumns',
                      label: 'Cards relacionados por linha',
                      type: 'number',
                      required: true,
                      defaultValue: 3,
                      min: 2,
                      max: 4,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'detailMaxWidth',
                      label: 'Largura máxima do texto (px)',
                      type: 'number',
                      required: true,
                      defaultValue: 860,
                      min: 560,
                      max: 1180,
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
          ],
        },

        /* ------------------------------ CSS ------------------------------- */
        {
          label: 'CSS extra',
          description: 'Escape hatch. Use com parcimônia — o certo é criar um token.',
          fields: [
            {
              name: 'customCss',
              label: 'CSS adicional',
              type: 'code',
              admin: { language: 'css' },
            },
          ],
        },
      ],
    },
  ],
}
