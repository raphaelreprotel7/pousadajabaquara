import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const accept = request.headers.get('accept') || ''
  const isMarkdownRequest = request.method === 'GET' && accept.includes('text/markdown')

  if (!isMarkdownRequest || request.headers.has('x-agent-markdown-source')) {
    return NextResponse.next()
  }

  const markdownUrl = request.nextUrl.clone()
  markdownUrl.pathname = '/api/agent-markdown'
  markdownUrl.search = ''
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-agent-original-path', request.nextUrl.pathname)
  return NextResponse.rewrite(markdownUrl, { request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!admin|api|_next|robots\\.txt|sitemap\\.xml|\\.well-known|.*\\..*).*)'],
}
