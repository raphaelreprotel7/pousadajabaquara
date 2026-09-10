import TurndownService from 'turndown'

import { contentSignal } from '@/utilities/discovery'

export const dynamic = 'force-dynamic'

const safePath = (value: string | null): value is string =>
  Boolean(
    value &&
      value.startsWith('/') &&
      !value.startsWith('//') &&
      !value.startsWith('/admin') &&
      !value.startsWith('/api') &&
      !value.startsWith('/.well-known'),
  )

const extract = (html: string, pattern: RegExp): string => {
  const match = html.match(pattern)?.[1] ?? ''
  return match.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const path = request.headers.get('x-agent-original-path') || requestUrl.searchParams.get('path')

  if (!safePath(path)) {
    return new Response('Caminho inválido.', { status: 400 })
  }

  const target = new URL(path, requestUrl.origin)
  const htmlResponse = await fetch(target, {
    headers: { Accept: 'text/html', 'X-Agent-Markdown-Source': '1' },
    cache: 'no-store',
  })
  const html = await htmlResponse.text()

  if (!htmlResponse.ok) {
    return new Response(html, {
      status: htmlResponse.status,
      headers: { 'Content-Type': htmlResponse.headers.get('content-type') || 'text/plain' },
    })
  }

  const title = extract(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || 'Pousada Recanto do Jabaquara'
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? ''

  const turndown = new TurndownService({
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '_',
    headingStyle: 'atx',
  })
  turndown.remove(['script', 'style', 'noscript', 'template'])
  const cleanHtml = html.replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
  const converted = turndown.turndown(cleanHtml).replace(/\n{3,}/g, '\n\n').trim()
  const markdown = `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\ncanonical: ${target.href}\n---\n\n${converted}\n`

  return new Response(markdown, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Signal': contentSignal,
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<${target.href}>; rel="canonical"; type="text/html"`,
      Vary: 'Accept',
      'x-markdown-tokens': String(Math.ceil(markdown.length / 4)),
      'x-original-tokens': String(Math.ceil(html.length / 4)),
    },
  })
}
