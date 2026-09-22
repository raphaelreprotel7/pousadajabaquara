import { bancoEmUso } from './src/scripts/env'
import { getPayload } from 'payload'
import config from './src/payload.config'

/**
 * Remove registros que ficaram órfãos depois de um texto ser reescrito.
 *
 * O seed casa diferenciais e comodidades pelo TÍTULO. Renomear "Piscina
 * aquecida" para "Piscina climatizada" faz o seed criar um registro novo e
 * deixar o antigo vivo — e o antigo continua aparecendo no site, porque os
 * blocos listam por ordem, não por id.
 *
 * Uso: npm run limpar:orfaos -- differentials "Piscina aquecida para relaxar"
 */
const run = async () => {
  const [colecao, ...titulos] = process.argv.slice(2).filter((a) => !a.startsWith('-'))
  if (!colecao || !titulos.length) {
    console.error('Uso: limpar:orfaos <colecao> "<titulo>" ["<titulo>"...]')
    process.exit(2)
  }
  console.log(`Banco: ${bancoEmUso()}`)
  const payload = await getPayload({ config })
  for (const title of titulos) {
    const { docs } = await payload.find({
      collection: colecao as never,
      where: { title: { equals: title } } as never,
      limit: 10,
      depth: 0,
    })
    if (!docs.length) { console.log(`- ${title}: não existe`); continue }
    for (const d of docs as { id: string | number }[]) {
      await payload.delete({ collection: colecao as never, id: d.id })
      console.log(`x ${colecao}/${d.id}: ${title}`)
    }
  }
  process.exit(0)
}
void run()
