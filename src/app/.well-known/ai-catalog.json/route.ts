import { canonicalOrigin, publicHeaders } from '@/utilities/discovery'

export const dynamic = 'force-static'

export function GET() {
  const origin = canonicalOrigin()
  return Response.json(
    {
      specVersion: '1.0',
      host: {
        displayName: 'Pousada Recanto do Jabaquara',
        identifier: 'pousadarecantodojabaquara.com.br',
        documentationUrl: `${origin}/api/docs`,
      },
      entries: [
        {
          identifier: 'urn:air:pousadarecantodojabaquara.com.br:web:sitemap',
          displayName: 'Mapa do site da Pousada Recanto do Jabaquara',
          type: 'application/xml',
          url: `${origin}/sitemap.xml`,
          description: 'URLs canônicas das páginas, artigos e promoções vigentes.',
          tags: ['hotel', 'sao-paulo', 'conteudo'],
          representativeQueries: [
            'Quais páginas e informações a Pousada Recanto do Jabaquara publica?',
            'Onde encontro acomodações e promoções da Pousada Recanto do Jabaquara?',
          ],
        },
        {
          identifier: 'urn:air:pousadarecantodojabaquara.com.br:api:public-content',
          displayName: 'API pública de conteúdo da Pousada Recanto do Jabaquara',
          type: 'application/vnd.oai.openapi+json',
          url: `${origin}/.well-known/openapi.json`,
          description: 'Descrição OpenAPI da interface pública e somente de leitura.',
          tags: ['hotel', 'api', 'reservas', 'sao-paulo'],
          capabilities: ['consultar páginas', 'consultar acomodações', 'consultar promoções', 'consultar artigos'],
          representativeQueries: [
            'Quais acomodações estão disponíveis na Pousada Recanto do Jabaquara?',
            'Quais promoções vigentes a Pousada Recanto do Jabaquara oferece?',
            'Consulte informações públicas sobre a Pousada Recanto do Jabaquara em Paraty.',
          ],
          version: '1.0.0',
        },
        {
          identifier: 'urn:air:pousadarecantodojabaquara.com.br:api:catalog',
          displayName: 'Catálogo de APIs da Pousada Recanto do Jabaquara',
          type: 'application/linkset+json',
          url: `${origin}/.well-known/api-catalog`,
          description: 'Catálogo RFC 9727 para descoberta automatizada da API pública.',
          representativeQueries: [
            'Como descobrir a API pública da Pousada Recanto do Jabaquara?',
            'Onde está a documentação e o estado da API da Pousada Recanto do Jabaquara?',
          ],
        },
        {
          identifier: 'urn:air:pousadarecantodojabaquara.com.br:skills:index',
          displayName: 'Skills públicas da Pousada Recanto do Jabaquara',
          type: 'application/json',
          url: `${origin}/.well-known/agent-skills/index.json`,
          description:
            'Índice verificável de instruções para consulta de conteúdo e preparação de reservas.',
          tags: ['hotel', 'skills', 'reservas'],
          capabilities: ['consultar informações do hotel', 'preparar pesquisa de reserva'],
          representativeQueries: [
            'Como um agente pode consultar informações oficiais da Pousada Recanto do Jabaquara?',
            'Como preparar uma pesquisa de reserva na Pousada Recanto do Jabaquara?',
          ],
        },
      ],
    },
    { headers: publicHeaders('application/json; charset=utf-8') },
  )
}
