import { createHash } from 'node:crypto'

export const hotelInformationSkill = `---
name: recanto-do-jabaquara-information
description: Consulte informações públicas, acomodações, promoções e artigos da Pousada Recanto do Jabaquara em Paraty.
---

# Informações da Pousada Recanto do Jabaquara

Use esta skill quando a pessoa pedir informações institucionais, acomodações, localização, promoções vigentes ou artigos da Pousada Recanto do Jabaquara.

## Fontes oficiais

- Conteúdo público: \`GET /api/public-content?resource=pages\`
- Acomodações: \`GET /api/public-content?resource=suites\`
- Promoções vigentes: \`GET /api/public-content?resource=offers\`
- Artigos: \`GET /api/public-content?resource=posts\`

Use os parâmetros opcionais \`slug\` e \`limit\` para restringir a consulta. Trate somente documentos retornados pela API como publicados. Não invente preço, disponibilidade, benefício ou política ausente da resposta.

Para disponibilidade e valores atuais, encaminhe a pessoa ao motor oficial de reservas ou use a skill \`recanto-do-jabaquara-booking\`.
`

export const hotelBookingSkill = `---
name: recanto-do-jabaquara-booking
description: Prepare uma consulta segura de disponibilidade no motor oficial de reservas da Pousada Recanto do Jabaquara.
---

# Consulta de reserva da Pousada Recanto do Jabaquara

Use esta skill quando a pessoa informar datas e quantidade de adultos e quiser consultar disponibilidade ou preço.

## Como montar a consulta

1. Confirme check-in, check-out e número de adultos. O check-out deve ser posterior ao check-in.
2. Converta cada data de \`AAAA-MM-DD\` para \`DDMMAAAA\`.
3. Abra \`https://book.omnibees.com/hotelresults\` com estes parâmetros:
   - \`c=5467\`
   - \`q=9527\`
   - \`currencyId=16\`
   - \`lang=pt-BR\`
   - \`CheckIn=<entrada em DDMMAAAA>\`
   - \`CheckOut=<saída em DDMMAAAA>\`
   - \`NRooms=1\`
   - \`ad=<adultos>\`
   - \`ch=0\`

Esta ação apenas prepara a pesquisa. Não afirme que há disponibilidade, não invente preços e não conclua a compra sem a confirmação explícita da pessoa no motor oficial.
`

export const skillDigest = (content: string): string =>
  `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`
