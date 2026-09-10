import './env'
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

const rich = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      textFormat: 0,
      textStyle: '',
      children: [
        { type: 'text', version: 1, text, format: 0, mode: 'normal', style: '', detail: 0 },
      ],
    })),
  },
})

await payload.updateGlobal({
  slug: 'promotion-page',
  data: {
    regulationTitle: 'Regulamento',
    relatedTitle: 'Outras promoções',
    conditionsLabel: 'Condições',
    validityLabel: 'Validade',
    minimumNightsTemplate: 'Mínimo de {n} noite(s)',
    showWhatsapp: true,
    showEmail: true,
    showEngine: true,
    whatsappLabel: 'Reserve pelo WhatsApp',
    emailLabel: 'Reserve pelo e-mail',
    engineLabel: 'Reserve agora',
    whatsappMessage: 'Olá! Gostaria de reservar a promoção: {title}',
    emailSubject: 'Reserva da promoção: {title}',
    showTestimonials: false,
    showNewsletter: true,
  } as any,
})

const themes = await payload.find({
  collection: 'design-system',
  depth: 0,
  limit: 1,
  sort: '-isActive',
})
if (themes.docs[0]) {
  await payload.update({
    collection: 'design-system',
    id: themes.docs[0].id,
    data: {
      promotion: {
        galleryHeight: 520,
        galleryGap: 2,
        contentGap: 72,
        relatedColumns: 3,
        detailMaxWidth: 860,
      },
    } as any,
  })
} else {
  await payload.create({
    collection: 'design-system',
    data: {
      name: 'Pousada Recanto do Jabaquara — padrão',
      isActive: true,
      promotion: {
        galleryHeight: 520,
        galleryGap: 2,
        contentGap: 72,
        relatedColumns: 3,
        detailMaxWidth: 860,
      },
    } as any,
  })
}

const pageResult = await payload.find({
  collection: 'pages',
  depth: 0,
  limit: 1,
  where: { slug: { equals: 'promocoes' } },
})
const promoPage = pageResult.docs[0] as any
if (promoPage) {
  const layout = [...(promoPage.layout ?? [])]
  if (!layout.some((block: any) => block.blockType === 'offers')) {
    const heroIndex = layout.findIndex((block: any) => block.blockType === 'pageHero')
    layout.splice(heroIndex >= 0 ? heroIndex + 1 : 0, 0, {
      blockType: 'offers',
      eyebrow: 'Condições especiais',
      title: 'Nossas promoções',
      text: 'Escolha a melhor condição para sua próxima estadia na Pousada Recanto do Jabaquara.',
      limit: 6,
      linkLabel: '',
    })
    await payload.update({
      collection: 'pages',
      id: promoPage.id,
      data: { layout } as any,
      draft: false,
    })
  }
}

const existing = await payload.find({
  collection: 'offers',
  depth: 0,
  limit: 1,
  where: { slug: { equals: 'modelo-de-promocao' } },
})

if (!existing.docs.length) {
  const mediaResult = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 4,
    where: {
      filename: {
        in: ['fachada.jpg', 'cafe-buffet-01.jpg', 'casal-01.jpg', 'lounge-01.jpg'],
      },
    },
  })
  const images = mediaResult.docs.map((item) => item.id)
  if (images.length) {
    await payload.create({
      collection: 'offers',
      draft: true,
      data: {
        title: 'Modelo de promoção — duplicar',
        slug: 'modelo-de-promocao',
        summary: 'Use este rascunho como base para criar uma nova promoção.',
        image: images[0],
        gallery: images.map((image) => ({ image })),
        description: rich([
          'Apresente aqui a experiência e os principais benefícios desta promoção.',
          'Explique de forma clara para quem a oferta foi criada e como aproveitar.',
        ]),
        highlight: 'Até XX% OFF',
        minimumNights: 2,
        conditions: rich([
          'Desconto válido conforme disponibilidade.',
          'Não cumulativo com outras promoções.',
          'Consulte os períodos válidos antes de reservar.',
        ]),
        validityRules: rich([
          'Informe aqui bloqueios de datas, feriados e demais regras de validade.',
        ]),
        _status: 'draft',
      } as any,
    })
  }
}

console.log('Estrutura de promoções configurada sem alterar promoções existentes.')
process.exit(0)
