import type { Block } from 'payload'

/**
 * Blocos do page builder.
 *
 * Cada bloco corresponde a uma seção do site estático e emite exatamente a
 * mesma marcação — as classes do styles.css não mudam. O que muda é a origem
 * do conteúdo: em vez de HTML fixo, vem das collections.
 *
 * A barra de reserva, os depoimentos e a newsletter NÃO são blocos: aparecem em
 * todas as páginas e são montados pelo layout a partir dos globals. Colocá-los
 * aqui obrigaria o editor a lembrar de adicioná-los em cada página nova.
 */

const sectionBackground: Block['fields'][number] = {
  name: 'background',
  label: 'Fundo da seção',
  type: 'select',
  defaultValue: 'white',
  options: [
    { label: 'Branco', value: 'white' },
    { label: 'Cinza', value: 'gray' },
    /* Verde da marca: o texto da seção vira branco automaticamente. */
    { label: 'Verde da marca', value: 'brand' },
  ],
  admin: { width: '50%' },
}

/* ------------------------------- BANNERS -------------------------------- */

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Banner da home', plural: 'Banners da home' },
  imageAltText: 'Imagem cheia com a barra de reserva sobreposta',
  fields: [
    {
      name: 'image',
      label: 'Imagem',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}

export const PageHeroBlock: Block = {
  slug: 'pageHero',
  labels: { singular: 'Banner de página', plural: 'Banners de página' },
  fields: [
    {
      name: 'image',
      label: 'Imagem',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          localized: true,
          admin: { width: '60%', description: 'Vazio usa o título da página.' },
        },
        {
          name: 'variant',
          label: 'Estilo',
          type: 'select',
          defaultValue: 'page',
          options: [
            { label: 'Página (título grande + assinatura)', value: 'page' },
            { label: 'Artigo (título menor, sem assinatura)', value: 'article' },
          ],
          admin: { width: '40%' },
        },
        {
          name: 'showTagline',
          label: 'Mostrar a assinatura',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '100%',
            description:
              'A assinatura do hotel ("o melhor preço garantido") vem das configurações. Desmarque em páginas onde ela não faz sentido, como a de vagas.',
          },
        },
      ],
    },
  ],
}

/* ------------------------------ CONTEÚDO -------------------------------- */

export const AboutBlock: Block = {
  slug: 'about',
  labels: { singular: 'Imagem + texto', plural: 'Imagem + texto' },
  fields: [
    {
      name: 'image',
      label: 'Imagem',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          label: 'Sobretítulo',
          type: 'text',
          localized: true,
          admin: { width: '50%' },
        },
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          required: true,
          localized: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'text',
      label: 'Texto',
      type: 'textarea',
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ctaLabel',
          label: 'Botão',
          type: 'text',
          localized: true,
          defaultValue: 'Faça uma reserva',
          admin: { width: '50%' },
        },
        {
          name: 'ctaUsesEngine',
          label: 'Botão abre o motor',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%' },
        },
      ],
    },
  ],
}

export const SplitContentBlock: Block = {
  slug: 'splitContent',
  labels: { singular: 'Texto + lista + imagem', plural: 'Texto + lista + imagem' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          label: 'Sobretítulo',
          type: 'text',
          localized: true,
          admin: { width: '50%' },
        },
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          required: true,
          localized: true,
          admin: { width: '50%', description: 'A última palavra sai em vermelho.' },
        },
      ],
    },
    {
      name: 'text',
      label: 'Texto',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'note',
      label: 'Destaque',
      type: 'text',
      localized: true,
      admin: { description: 'Linha com barra vermelha. Ex.: horário do café.' },
    },
    {
      name: 'amenitiesScope',
      label: 'Listar comodidades',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'Não listar', value: 'none' },
        { label: 'Estrutura do hotel', value: 'hotel' },
        { label: 'Do quarto', value: 'quarto' },
      ],
      admin: { description: 'Puxa da collection Comodidades.' },
    },
    {
      name: 'images',
      label: 'Imagens',
      type: 'array',
      maxRows: 3,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
      admin: { description: '1 imagem = coluna. 2 = par lado a lado.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'reverse',
          label: 'Imagem à esquerda',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '50%' },
        },
        sectionBackground,
      ],
    },
    {
      name: 'ctaLabel',
      label: 'Botão',
      type: 'text',
      localized: true,
    },
    {
      name: 'gallery',
      label: 'Galeria abaixo (3 fotos)',
      type: 'array',
      maxRows: 3,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
  ],
}

export const DifferentialsBlock: Block = {
  slug: 'differentials',
  labels: { singular: 'Diferenciais', plural: 'Diferenciais' },
  fields: [
    {
      name: 'title',
      label: 'Título da seção',
      type: 'text',
      localized: true,
      defaultValue: 'O que torna sua estadia inesquecível',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'cardsLimit',
          label: 'Cards com foto',
          type: 'number',
          defaultValue: 3,
          min: 0,
          max: 6,
          admin: { width: '50%' },
        },
        {
          name: 'perksLimit',
          label: 'Caixas com ícone',
          type: 'number',
          defaultValue: 6,
          min: 0,
          max: 12,
          admin: { width: '50%' },
        },
      ],
    },
  ],
}

export const SuitesCarouselBlock: Block = {
  slug: 'suitesCarousel',
  labels: { singular: 'Carrossel de suítes', plural: 'Carrosséis de suítes' },
  fields: [
    {
      name: 'eyebrow',
      label: 'Sobretítulo',
      type: 'text',
      localized: true,
      admin: { description: 'Linha pequena acima do título. Vazio esconde.' },
    },
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      localized: true,
      defaultValue: 'Suítes',
    },
    {
      name: 'text',
      label: 'Texto',
      type: 'textarea',
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'linkLabel',
          label: 'Link',
          type: 'text',
          localized: true,
          defaultValue: 'Ver todas as suítes',
          admin: { width: '50%' },
        },
        {
          name: 'linkHref',
          label: 'Destino',
          type: 'text',
          defaultValue: '/acomodacoes',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'showPrice',
      label: 'Mostrar preço no card',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'O site atual não exibe preços.' },
    },
  ],
}

export const RoomListBlock: Block = {
  slug: 'roomList',
  labels: { singular: 'Lista de acomodações', plural: 'Listas de acomodações' },
  fields: [
    {
      name: 'intro',
      label: 'Introdução',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          localized: true,
        },
        {
          name: 'text',
          label: 'Texto',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'ctaLabel',
          label: 'Botão',
          type: 'text',
          localized: true,
          defaultValue: 'Faça uma reserva',
        },
      ],
    },
  ],
}

export const CityBandBlock: Block = {
  slug: 'cityBand',
  labels: { singular: 'Faixa da cidade', plural: 'Faixas da cidade' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          label: 'Título pequeno',
          type: 'text',
          localized: true,
          defaultValue: 'Encante-se com',
          admin: { width: '50%' },
        },
        {
          name: 'ghost',
          label: 'Palavra gigante',
          type: 'text',
          localized: true,
          defaultValue: 'Paraty',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'text',
      label: 'Texto',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'image',
      label: 'Foto da faixa',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}

export const OffersBlock: Block = {
  slug: 'offers',
  labels: { singular: 'Ofertas', plural: 'Ofertas' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          label: 'Sobretítulo',
          type: 'text',
          localized: true,
          defaultValue: 'Pacotes & ofertas',
          admin: { width: '50%' },
        },
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          localized: true,
          defaultValue: 'Nossas ofertas',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'text',
      label: 'Texto',
      type: 'textarea',
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'limit',
          label: 'Quantas exibir',
          type: 'number',
          defaultValue: 2,
          min: 1,
          max: 6,
          admin: { width: '50%' },
        },
        {
          name: 'linkLabel',
          label: 'Link',
          type: 'text',
          localized: true,
          defaultValue: 'Ver todas as ofertas',
          admin: { width: '50%' },
        },
      ],
    },
  ],
}

export const SocialBlock: Block = {
  slug: 'social',
  labels: { singular: 'Redes sociais', plural: 'Redes sociais' },
  fields: [
    {
      name: 'lead',
      label: 'Texto de apoio',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      localized: true,
      defaultValue: 'Siga a Pousada Recanto do Jabaquara nas redes sociais',
    },
    {
      name: 'images',
      label: 'Colagem',
      type: 'array',
      minRows: 2,
      maxRows: 2,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
  ],
}

export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'Dúvidas frequentes', plural: 'Dúvidas frequentes' },
  fields: [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      localized: true,
      defaultValue: 'Dúvidas frequentes',
    },
    {
      name: 'category',
      label: 'Filtrar por categoria',
      type: 'select',
      defaultValue: 'todas',
      options: [
        { label: 'Todas', value: 'todas' },
        { label: 'Geral', value: 'geral' },
        { label: 'Café da manhã', value: 'cafe' },
        { label: 'Acomodações', value: 'quartos' },
        { label: 'Localização', value: 'localizacao' },
        { label: 'Políticas', value: 'politicas' },
      ],
    },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Galeria de fotos', plural: 'Galerias de fotos' },
  fields: [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      localized: true,
      defaultValue: 'Galeria de fotos',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showFilters',
          label: 'Exibir filtros',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%' },
        },
        {
          name: 'allLabel',
          label: 'Rótulo do "todas"',
          type: 'text',
          localized: true,
          defaultValue: 'Todas',
          admin: { width: '50%' },
        },
      ],
    },
  ],
}

export const LocationBlock: Block = {
  slug: 'location',
  labels: { singular: 'Localização', plural: 'Localização' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          label: 'Sobretítulo',
          type: 'text',
          localized: true,
          defaultValue: 'Onde estamos',
          admin: { width: '50%' },
        },
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          localized: true,
          defaultValue: 'Localização privilegiada',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'text',
      label: 'Texto',
      type: 'textarea',
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'poiTitle',
          label: 'Título da lista',
          type: 'text',
          localized: true,
          defaultValue: 'Pontos de interesse',
          admin: { width: '50%' },
        },
        {
          name: 'poiLimit',
          label: 'Quantos pontos',
          type: 'number',
          defaultValue: 9,
          min: 0,
          max: 30,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'showContactCards',
      label: 'Exibir cards de contato',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showMap',
      label: 'Exibir mapa',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}

export const PostListBlock: Block = {
  slug: 'postList',
  labels: { singular: 'Lista de artigos', plural: 'Listas de artigos' },
  fields: [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      localized: true,
      defaultValue: 'Blog da Pousada Recanto do Jabaquara',
    },
    {
      name: 'limit',
      label: 'Quantos artigos',
      type: 'number',
      defaultValue: 9,
      min: 1,
      max: 30,
    },
  ],
}

export const EmptyStateBlock: Block = {
  slug: 'emptyState',
  labels: { singular: 'Estado vazio', plural: 'Estados vazios' },
  fields: [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'text',
      label: 'Texto',
      type: 'textarea',
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ctaLabel',
          label: 'Botão',
          type: 'text',
          localized: true,
          admin: { width: '50%' },
        },
        {
          name: 'ctaHref',
          label: 'Destino',
          type: 'text',
          defaultValue: '#newsletter',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'onlyWhenEmpty',
      label: 'Só aparece se não houver promoções vigentes',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}

export const ConfirmationBlock: Block = {
  slug: 'confirmation',
  labels: { singular: 'Confirmação', plural: 'Confirmações' },
  admin: { group: 'Conversão' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'icon',
          label: 'Ícone',
          type: 'select',
          defaultValue: 'i-mail',
          options: [
            { label: 'Envelope', value: 'i-mail' },
            { label: 'Telefone', value: 'i-phone' },
            { label: 'WhatsApp', value: 'i-wa' },
            { label: 'Calendário', value: 'i-cal' },
            { label: 'Estrela', value: 'i-star' },
          ],
          admin: { width: '30%' },
        },
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          required: true,
          localized: true,
          admin: { width: '70%' },
        },
      ],
    },
    {
      name: 'text',
      label: 'Texto',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'ctaLabel',
      label: 'Botão',
      type: 'text',
      localized: true,
      defaultValue: 'Faça uma reserva',
      admin: {
        description:
          'Sempre abre o motor de reservas — é o único caminho que faz sentido depois da conversão.',
      },
    },
  ],
}

export const ContactBlock: Block = {
  slug: 'contact',
  labels: { singular: 'Contato', plural: 'Contato' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          label: 'Sobretítulo',
          type: 'text',
          localized: true,
          defaultValue: 'Fale conosco',
          admin: { width: '50%' },
        },
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          localized: true,
          defaultValue: 'Entre em contato',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'text',
      label: 'Texto',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'form',
      label: 'Formulário',
      type: 'relationship',
      relationTo: 'forms',
      admin: { description: 'Criado em Formulários.' },
    },
    {
      name: 'consentText',
      label: 'Texto do aceite',
      type: 'text',
      localized: true,
      admin: {
        description:
          'Vazio, usa o aceite padrão de contato. Numa página de vagas o aceite é outro — os dados servem para avaliar a candidatura, não para receber conteúdo.',
      },
    },
    {
      name: 'asideTitle',
      label: 'Título do card lateral',
      type: 'text',
      localized: true,
      defaultValue: 'Central de reservas',
      admin: {
        description:
          'Vazio, o card não aparece e o formulário ocupa a largura toda — para páginas onde a central de reservas não faz sentido.',
      },
    },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Texto livre', plural: 'Textos livres' },
  fields: [
    {
      name: 'content',
      label: 'Conteúdo',
      type: 'richText',
      localized: true,
    },
    {
      type: 'row',
      fields: [sectionBackground],
    },
  ],
}

/* --------------------- BLOCOS DA POUSADA RECANTO DO JABAQUARA -------------
 * Três seções da home do cliente não têm equivalente entre os blocos do
 * template. Ficam aqui, com os slugs próprios, para que a home publicada seja
 * igual à referência e as páginas internas herdem o mesmo sistema.
 * ------------------------------------------------------------------------- */

export const AboutMosaicBlock: Block = {
  slug: 'aboutMosaic',
  labels: { singular: 'Sobre com mosaico', plural: 'Sobre com mosaico' },
  imageAltText: 'Quatro fotos em mosaico ao lado do texto de apresentação',
  fields: [
    {
      name: 'images',
      label: 'Mosaico (4 fotos)',
      type: 'array',
      minRows: 4,
      maxRows: 4,
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          label: 'Sobretítulo',
          type: 'text',
          localized: true,
          admin: { width: '50%' },
        },
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          required: true,
          localized: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'text',
      label: 'Texto',
      type: 'textarea',
      localized: true,
      admin: { description: 'Linha em branco separa parágrafos.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ctaLabel',
          label: 'Botão',
          type: 'text',
          localized: true,
          admin: { width: '50%' },
        },
        {
          name: 'ctaUsesEngine',
          label: 'Botão abre o motor',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'reverse',
      label: 'Mosaico à direita',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}

export const RegionCardBlock: Block = {
  slug: 'regionCard',
  labels: { singular: 'Região com card', plural: 'Região com card' },
  imageAltText: 'Foto sangrada com um card de texto flutuando sobre ela',
  fields: [
    {
      name: 'image',
      label: 'Foto de fundo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          label: 'Sobretítulo',
          type: 'text',
          localized: true,
          admin: { width: '50%' },
        },
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          required: true,
          localized: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'text',
      label: 'Texto',
      type: 'textarea',
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ctaLabel',
          label: 'Botão',
          type: 'text',
          localized: true,
          admin: { width: '34%' },
        },
        {
          name: 'ctaHref',
          label: 'Link do botão',
          type: 'text',
          admin: { width: '33%' },
        },
        {
          name: 'align',
          label: 'Lado do card',
          type: 'select',
          defaultValue: 'right',
          options: [
            { label: 'Direita', value: 'right' },
            { label: 'Esquerda', value: 'left' },
          ],
          admin: { width: '33%' },
        },
      ],
    },
  ],
}

export const InstagramStripBlock: Block = {
  slug: 'instagramStrip',
  labels: { singular: 'Faixa do Instagram', plural: 'Faixas do Instagram' },
  imageAltText: 'Régua, título e uma faixa de fotos do Instagram',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          localized: true,
          defaultValue: 'Nos siga no Instagram',
          admin: { width: '50%' },
        },
        {
          name: 'handle',
          label: '@ do perfil',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Vazio usa o Instagram cadastrado em Configurações.',
          },
        },
      ],
    },
    {
      name: 'images',
      label: 'Faixa de fotos',
      type: 'array',
      minRows: 3,
      maxRows: 12,
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
  ],
}

export const pageBlocks: Block[] = [
  HeroBlock,
  PageHeroBlock,
  AboutBlock,
  AboutMosaicBlock,
  RegionCardBlock,
  InstagramStripBlock,
  SplitContentBlock,
  DifferentialsBlock,
  SuitesCarouselBlock,
  RoomListBlock,
  CityBandBlock,
  OffersBlock,
  SocialBlock,
  FaqBlock,
  GalleryBlock,
  LocationBlock,
  PostListBlock,
  EmptyStateBlock,
  ContactBlock,
  ConfirmationBlock,
  RichTextBlock,
]
