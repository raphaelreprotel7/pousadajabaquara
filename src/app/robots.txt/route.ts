import { canonicalOrigin, contentSignal } from '@/utilities/discovery'

export const dynamic = 'force-static'

export function GET() {
  const origin = canonicalOrigin()
  const body = `# Pousada Recanto do Jabaquara — regras de rastreamento
# Conteúdo público pode ser usado em busca e respostas de assistentes, mas não em treinamento.

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /graphql
Disallow: /graphql-playground
Content-Signal: ${contentSignal.replace('Content-Signal: ', '')}

# Busca da OpenAI
User-agent: OAI-SearchBot
Allow: /
Disallow: /admin/
Disallow: /api/

# Navegação assistida da Anthropic
User-agent: Claude-Web
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Claude-SearchBot
Allow: /
Disallow: /admin/
Disallow: /api/

# Rastreadores associados a treinamento
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: ClaudeBot
Disallow: /

Sitemap: ${origin}/sitemap.xml
`

  return new Response(body, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
