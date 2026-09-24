import { withPayload } from '@payloadcms/next/withPayload'

/**
 * Em desenvolvimento o Payload devolve URL absoluta para os uploads
 * (http://localhost:3000/api/media/file/...), e o otimizador do Next trata isso
 * como host remoto. `hostname: 'localhost'` sozinho casa só com a porta padrão —
 * sem a porta explícita, toda imagem volta 400 e a página sobe sem foto.
 */
const portaLocal = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').port || '3000'
  } catch {
    return '3000'
  }
})()

const naCloudflare = process.env.USAR_CLOUDFLARE === '1'

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * O adaptador do Payload carrega `drizzle-kit/api` para fazer push de schema.
   * Isso não pode acontecer dentro de um Worker, e o módulo nem chega a
   * resolver: o Turbopack renomeia para `drizzle-kit-<hash>/api` e o esbuild
   * do OpenNext falha ao empacotar. O stub corta o problema na raiz.
   */
  ...(naCloudflare
    ? {
        turbopack: {
          resolveAlias: {
            'drizzle-kit/api': './src/utilities/drizzle-kit-ausente.ts',
          },
        },
      }
    : {}),

  // As imagens de produção vivem no Vercel Blob. Liberar o host aqui é o que
  // habilita o otimizador do Next (/_next/image) a reencodar em AVIF/WebP e a
  // gerar os cortes por largura — sem isso os JPEG originais iam crus ao browser.
  images: {
    /**
     * O otimizador do Next (/_next/image) reencoda com `sharp`, que é binário
     * nativo e não roda em Worker. Na Cloudflare, portanto, ele precisa sair de
     * cena: as imagens vão como estão, direto do bucket de assets.
     *
     * O custo é real e vale dizer em voz alta — perdemos AVIF/WebP e os cortes
     * por largura, então os JPEG originais chegam inteiros ao browser. A troca
     * definitiva é o Cloudflare Images (serviço pago, via `images.optimizer`)
     * ou o redimensionamento por /cdn-cgi/image quando o domínio estiver na
     * zona. Enquanto isso não existir, isto aqui é o que mantém o site de pé.
     */
    unoptimized: naCloudflare,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: portaLocal,
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
    // AVIF primeiro, WebP como fallback para quem não suporta.
    formats: ['image/avif', 'image/webp'],
    qualities: [75],
    // O blob já manda max-age de 30 dias; alinhar evita reotimizar à toa.
    minimumCacheTTL: 2678400,
  },
  async headers() {
    const discoveryLinks = [
      '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
      '</.well-known/openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
      '</sitemap.xml>; rel="describedby"; type="application/xml"',
    ].join(', ')

    return [
      {
        source: '/',
        headers: [
          { key: 'Link', value: discoveryLinks },
          { key: 'Content-Signal', value: 'ai-train=no, search=yes, ai-input=yes' },
          { key: 'Vary', value: 'Accept' },
        ],
      },
      {
        source: '/.well-known/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
    ]
  },
}

export default withPayload(nextConfig)
