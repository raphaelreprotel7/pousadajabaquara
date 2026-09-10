import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Substitui o arquivo de uma ou mais mídias já cadastradas.
 *
 * Por que existe: o `seed:site` procura a mídia pelo `filename` e, se já
 * existe, REAPROVEITA o registro sem reenviar o arquivo. Isso é o certo para
 * rodar o seed várias vezes sem duplicar upload — mas significa que trocar a
 * foto na pasta e semear de novo não troca nada no site.
 *
 * Este script fecha essa lacuna: apaga o registro das mídias indicadas, para
 * que o próximo `seed:site` faça upload das novas. As páginas e coleções que
 * apontavam para elas são religadas pelo próprio seed, que resolve as
 * referências `@media:` por nome de arquivo.
 *
 * Uso:
 *   npm run trocar:midia -- arquivo1.jpg arquivo2.jpg
 *   npm run trocar:midia -- --todas-de content/imagens   (compara e apaga as
 *                                                         que mudaram de tamanho)
 */
const RAIZ = process.cwd()

const run = async () => {
  const args = process.argv.slice(2)
  if (!args.length) {
    console.error('Informe os nomes de arquivo a trocar. Ex.: npm run trocar:midia -- hero.jpg')
    process.exit(2)
  }

  const payload = await getPayload({ config })
  let apagadas = 0
  const ausentes: string[] = []

  for (const nome of args) {
    const arquivo = path.join(RAIZ, 'content', 'imagens', nome)
    if (!fs.existsSync(arquivo)) {
      console.error(`  ! ${nome} — não existe em content/imagens, pulando`)
      continue
    }

    const achados = await payload.find({
      collection: 'media',
      where: { filename: { equals: nome } },
      limit: 1,
      depth: 0,
    })

    if (!achados.docs.length) {
      ausentes.push(nome)
      continue
    }

    await payload.delete({ collection: 'media', id: achados.docs[0].id })
    console.log(`  apagado registro de ${nome}`)
    apagadas++
  }

  console.log(`\n${apagadas} registro(s) de mídia apagado(s).`)
  if (ausentes.length) {
    console.log(`${ausentes.length} não estavam cadastrados (o seed vai criar): ${ausentes.join(', ')}`)
  }
  console.log('Agora rode: npm run seed:site')
  process.exit(0)
}

void run()
