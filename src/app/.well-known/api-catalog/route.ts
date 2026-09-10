import { canonicalOrigin, publicHeaders } from '@/utilities/discovery'

export const dynamic = 'force-static'

export function GET() {
  const origin = canonicalOrigin()
  return Response.json(
    {
      linkset: [
        {
          anchor: `${origin}/api/public-content`,
          'service-desc': [
            {
              href: `${origin}/.well-known/openapi.json`,
              type: 'application/vnd.oai.openapi+json;version=3.1',
            },
          ],
          'service-doc': [{ href: `${origin}/api/docs`, type: 'text/html' }],
          status: [{ href: `${origin}/api/health`, type: 'application/json' }],
        },
      ],
    },
    {
      headers: publicHeaders(
        'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"; charset=utf-8',
      ),
    },
  )
}
