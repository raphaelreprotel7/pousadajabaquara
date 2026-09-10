import { publicHeaders } from '@/utilities/discovery'

export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json(
    {
      status: 'ok',
      service: 'Pousada Recanto do Jabaquara public website API',
      timestamp: new Date().toISOString(),
    },
    { headers: publicHeaders('application/json; charset=utf-8') },
  )
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Methods': 'GET, OPTIONS', ...publicHeaders('text/plain') },
  })
}
