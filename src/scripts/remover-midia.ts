import './env'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Apaga registros de mídia pelo nome do arquivo.
 *
 * O `seed:site` só acrescenta: quando uma foto sai do conteúdo, o registro
 * antigo continua no banco e segue aparecendo na galeria de /fotos, que lista
 * TODA mídia com categoria. Este script remove o que ficou órfão.
 *
 * Uso:  npm run remover:midia -- arquivo1.jpg arquivo2.jpg
 */
const run = async () => {
  const nomes = process.argv.slice(2).filter((a) => !a.startsWith('-'))
  if (!nomes.length) {
    console.error('Informe ao menos um nome de arquivo.')
    process.exit(2)
  }

  const payload = await getPayload({ config })
  for (const filename of nomes) {
    const { docs } = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })
    const doc = docs[0]
    if (!doc) {
      console.log(`- ${filename}: não estava no banco`)
      continue
    }
    await payload.delete({ collection: 'media', id: doc.id })
    console.log(`x ${filename}: removido`)
  }
  process.exit(0)
}

void run()
