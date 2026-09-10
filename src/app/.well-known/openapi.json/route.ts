import { canonicalOrigin, publicHeaders } from '@/utilities/discovery'

export const dynamic = 'force-static'

export function GET() {
  const origin = canonicalOrigin()
  return Response.json(
    {
      openapi: '3.1.0',
      info: {
        title: 'Pousada Recanto do Jabaquara Public Content API',
        version: '1.0.0',
        description:
          'API pública e somente de leitura para conteúdo publicado, promoções vigentes e estado do site.',
      },
      servers: [{ url: origin }],
      paths: {
        '/api/public-content': {
          get: {
            operationId: 'listPublicContent',
            summary: 'Lista conteúdo público publicado',
            parameters: [
              {
                name: 'resource',
                in: 'query',
                required: true,
                schema: { type: 'string', enum: ['pages', 'suites', 'offers', 'posts'] },
              },
              { name: 'slug', in: 'query', schema: { type: 'string' } },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
              },
            ],
            responses: {
              '200': {
                description: 'Conteúdo encontrado',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        resource: { type: 'string' },
                        docs: { type: 'array', items: { type: 'object', additionalProperties: true } },
                        totalDocs: { type: 'integer' },
                      },
                    },
                  },
                },
              },
              '400': { description: 'Recurso inválido' },
            },
          },
        },
        '/api/health': {
          get: {
            operationId: 'getHealth',
            summary: 'Verifica a disponibilidade do serviço',
            responses: {
              '200': {
                description: 'Serviço disponível',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      required: ['status', 'service', 'timestamp'],
                      properties: {
                        status: { type: 'string', const: 'ok' },
                        service: { type: 'string' },
                        timestamp: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    { headers: publicHeaders('application/vnd.oai.openapi+json;version=3.1;charset=utf-8') },
  )
}
