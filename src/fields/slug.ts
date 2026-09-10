import type { Field } from 'payload'

// Marcas de combinação deixadas para trás pelo normalize('NFD').
// Construído via string para não deixar caracteres combinantes soltos no fonte.
const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g')

const toSlug = (value: string): string =>
  value
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const MAX_ATTEMPTS = 50

/**
 * Slug preenchido a partir de outro campo, ainda editável à mão, e único.
 *
 * A desambiguação não é luxo: no layout os três cards de experiência têm a
 * mesma legenda ("Lorem ipsum dolor sit amet"), o que geraria o mesmo slug e
 * estouraria a constraint de unicidade. Aqui o segundo vira `-2`, o terceiro
 * `-3`, e assim por diante.
 */
export const slugField = (trackingField = 'title'): Field => ({
  name: 'slug',
  label: 'Slug (URL)',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description:
      'Gerado a partir do título. Se já existir outro igual, ganha um sufixo numérico.',
  },
  hooks: {
    beforeValidate: [
      async ({ value, data, operation, req, collection, originalDoc }) => {
        const source =
          typeof value === 'string' && value.length > 0 ? value : data?.[trackingField]

        if (typeof source !== 'string' || source.length === 0) return value

        const base = toSlug(source)
        if (!base) return value

        // Slug já gravado e inalterado: não mexe.
        if (operation === 'update' && originalDoc?.slug === base) return base

        const collectionSlug = collection?.slug
        if (!collectionSlug || !req?.payload) return base

        const currentId = originalDoc?.id ?? data?.id

        for (let i = 0; i < MAX_ATTEMPTS; i++) {
          const candidate = i === 0 ? base : `${base}-${i + 1}`

          const where: Record<string, unknown> = { slug: { equals: candidate } }
          if (currentId !== undefined && currentId !== null) {
            where.id = { not_equals: currentId }
          }

          const clash = await req.payload.find({
            collection: collectionSlug as never,
            limit: 1,
            depth: 0,
            pagination: false,
            where: where as never,
            req,
          })

          if (clash.totalDocs === 0) return candidate
        }

        // Improvável: cai para um sufixo por timestamp em vez de falhar.
        return `${base}-${Date.now()}`
      },
    ],
  },
})
