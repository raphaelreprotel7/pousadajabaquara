import { canonicalOrigin, publicHeaders } from '@/utilities/discovery'

export const dynamic = 'force-static'

export function GET() {
  const origin = canonicalOrigin()
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>API pública — Pousada Recanto do Jabaquara</title></head><body>
<main><h1>API pública da Pousada Recanto do Jabaquara</h1>
<p>Interface somente de leitura para consultar conteúdo publicado no site.</p>
<h2>Conteúdo</h2><p><code>GET ${origin}/api/public-content?resource=pages</code></p>
<p>Recursos: <code>pages</code>, <code>suites</code>, <code>offers</code> e <code>posts</code>. Parâmetros opcionais: <code>slug</code> e <code>limit</code> (máximo 50).</p>
<h2>Saúde</h2><p><code>GET ${origin}/api/health</code></p>
<h2>Descrição OpenAPI</h2><p><a href="${origin}/.well-known/openapi.json">${origin}/.well-known/openapi.json</a></p>
</main></body></html>`

  return new Response(html, { headers: publicHeaders('text/html; charset=utf-8') })
}
