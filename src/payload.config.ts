import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { r2Storage } from '@payloadcms/storage-r2'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Suites } from './collections/Suites'
import { Amenities } from './collections/Amenities'
import { Differentials } from './collections/Differentials'
import { Testimonials } from './collections/Testimonials'
import { Faqs } from './collections/Faqs'
import { Offers } from './collections/Offers'
import { Popups } from './collections/Popups'
import { PhotoCategories } from './collections/PhotoCategories'
import { Attractions } from './collections/Attractions'
import { Posts } from './collections/Posts'
import { PostCategories } from './collections/PostCategories'
import { DesignSystem } from './collections/DesignSystem'

import { ghlConfigField, ghlStatusFields } from './fields/ghlConfig'
import { forwardSubmissionToGhl } from './hooks/ghlForwarder'

import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { SiteSettings } from './globals/SiteSettings'
import { BookingBar } from './globals/BookingBar'
import { NewsletterSection } from './globals/NewsletterSection'
import { TestimonialsSection } from './globals/TestimonialsSection'
import { FloatingActions } from './globals/FloatingActions'
import { PromotionPage } from './globals/PromotionPage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

const csrf = Array.from(
  new Set(
    [
      serverURL,
      'https://pousadarecantodojabaquara.com.br',
      'https://recanto-do-jabaquara-payload.vercel.app',
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter((origin): origin is string => Boolean(origin)),
  ),
)

/**
 * Bindings da Cloudflare (D1 e R2).
 *
 * Eles não existem no escopo do módulo de um Worker: só aparecem no contexto
 * de request. Dentro da aplicação servida pelo OpenNext quem entrega isso é
 * `getCloudflareContext`; fora dela — build, CLI do Payload, `seed:site` —
 * quem entrega é o `getPlatformProxy` do wrangler, que sobe um miniflare com
 * as mesmas ligações declaradas em wrangler.jsonc.
 *
 * O import do wrangler é escondido do bundler de propósito (a concatenação
 * impede a análise estática), porque o wrangler é dependência de
 * desenvolvimento e não pode entrar no bundle do Worker.
 */
const USANDO_CLOUDFLARE = process.env.USAR_CLOUDFLARE === '1'

const contextoCloudflare = async () => {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    return await getCloudflareContext({ async: true })
  } catch {
    const { getPlatformProxy } = await import(
      /* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`
    )
    return await getPlatformProxy({ environment: process.env.CLOUDFLARE_ENV })
  }
}

const cloudflare = USANDO_CLOUDFLARE ? await contextoCloudflare() : null

/**
 * `sharp` é binário nativo e não roda em Workers — o template oficial da
 * Cloudflare também não o passa. Sem ele o Payload continua aceitando upload,
 * mas deixa de gerar os tamanhos derivados; por isso o import é dinâmico e só
 * acontece fora da Cloudflare.
 */
const sharp = USANDO_CLOUDFLARE ? undefined : (await import('sharp')).default

export default buildConfig({
  serverURL,
  csrf,

  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — Pousada Recanto do Jabaquara' },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 834, height: 1112 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },

  /**
   * O banco é escolhido pela URL, não por edição de código.
   *
   * Em produção (Vercel) é Postgres; no desenvolvimento local continua o
   * arquivo SQLite, que não pede nenhuma infraestrutura para rodar o site.
   * `POSTGRES_URL` é o nome que a integração de banco da Vercel injeta
   * sozinha — aceitá-lo evita ter de duplicar a variável no painel.
   *
   * O conteúdo não mora no banco, e sim em content/site.json, então trocar de
   * banco não é migrar dados: é apontar o `seed:site` para o novo endereço.
   *
   * Na Cloudflare o banco é o D1, que também é SQLite — por isso a troca não
   * exige migração de dados: basta rodar o `seed:site` apontado para lá.
   */
  db: (() => {
    const postgres =
      process.env.DATABASE_URI?.startsWith('postgres') ? process.env.DATABASE_URI
      : process.env.POSTGRES_URL || process.env.DATABASE_URL || ''

    // Ligado por padrão porque o banco nasce vazio: sem push as tabelas nunca
    // são criadas e o primeiro seed falha. Quando o site entrar no ar, coloque
    // PAYLOAD_DB_PUSH=false em produção — a partir daí mudança de schema entra
    // por script (ver src/scripts/migrate-ghl.ts) e não por push automático,
    // que é destrutivo.
    /* Comparar com a string crua é frágil: um espaço ou um BOM (o PowerShell
       põe um ao enviar valor por pipe) faria `"﻿false" !== "false"` e o
       push voltaria a ligar — num banco com dados, isso é destrutivo. */
    const limpo = (process.env.PAYLOAD_DB_PUSH ?? '').replace(/^﻿/, '').trim()
    const push = limpo !== 'false'

    if (cloudflare) return sqliteD1Adapter({ binding: cloudflare.env.D1, push })

    if (postgres) return postgresAdapter({ pool: { connectionString: postgres }, push })

    return sqliteAdapter({
      client: {
        url:
          process.env.TURSO_DATABASE_URL ||
          process.env.DATABASE_URI ||
          'file:./recanto-do-jabaquara.db',
        authToken: process.env.TURSO_AUTH_TOKEN,
      },
      push,
    })
  })(),

  editor: lexicalEditor(),

  collections: [
    // Conteúdo
    Pages,
    Suites,
    Amenities,
    Differentials,
    Offers,
    Popups,
    Testimonials,
    Faqs,
    Attractions,
    PhotoCategories,
    // Blog
    Posts,
    PostCategories,
    // Sistema
    DesignSystem,
    Media,
    Users,
  ],

  globals: [
    Header,
    Footer,
    BookingBar,
    NewsletterSection,
    TestimonialsSection,
    FloatingActions,
    PromotionPage,
    SiteSettings,
  ],

  localization: {
    locales: [
      { label: 'Português', code: 'pt-BR' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'pt-BR',
    fallback: true,
  },

  plugins: [
    /* Os dois adaptadores de mídia convivem, mas só um fica ligado: na
       Cloudflare é o R2, em qualquer outro lugar é o Vercel Blob. Manter os
       dois declarados (em vez de trocar um pelo outro) é o que deixa o mesmo
       código servir as duas hospedagens sem edição. */
    ...(cloudflare
      ? [
          r2Storage({
            bucket: cloudflare.env.R2,
            collections: { media: { disablePayloadAccessControl: true } },
            clientUploads: true,
          }),
        ]
      : [
          vercelBlobStorage({
            enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
            collections: { media: { disablePayloadAccessControl: true } },
            token: process.env.BLOB_READ_WRITE_TOKEN,
            clientUploads: true,
          }),
        ]),

    seoPlugin({
      collections: ['pages', 'suites', 'posts', 'offers'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title ?? 'Pousada Recanto do Jabaquara'} — Pousada Recanto do Jabaquara`,
      generateURL: ({ doc }) => `${serverURL}/${doc?.slug === 'home' ? '' : doc?.slug ?? ''}`,
      tabbedUI: true,
    }),

    formBuilderPlugin({
      fields: {
        text: true,
        email: true,
        textarea: true,
        select: true,
        checkbox: true,
        number: true,
        message: true,
        payment: false,
      },
      // Cada formulário ganha sua própria aba de conexão com o GHL, e cada
      // submissão guarda o resultado do envio.
      formOverrides: {
        admin: { group: 'Formulários' },
        fields: ({ defaultFields }) => [...defaultFields, ghlConfigField],
      },
      formSubmissionOverrides: {
        admin: { group: 'Formulários' },
        fields: ({ defaultFields }) => [...defaultFields, ...ghlStatusFields],
        // O plugin concatena estes hooks aos dele, então o e-mail de
        // notificação continua saindo normalmente.
        hooks: { afterChange: [forwardSubmissionToGhl] },
      },
    }),

    redirectsPlugin({
      collections: ['pages'],
      overrides: { admin: { group: 'Configuração' } },
    }),
  ],

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },

  graphQL: { schemaOutputFile: path.resolve(dirname, '../generated-schema.graphql') },

  sharp,

  upload: { limits: { fileSize: 15_000_000 } },
})
