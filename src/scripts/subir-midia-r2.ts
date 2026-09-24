/**
 * Sobe para o R2 remoto os arquivos que o banco já referencia.
 *
 * Por que existe: o seed rodou com o binding de R2 sem `remote: true`, então
 * gravou os registros no D1 de produção e os arquivos num miniflare local. O
 * Worker achava a mídia no banco, não achava o objeto no bucket, e devolvia
 * 500 em toda imagem. Corrigido o wrangler.jsonc, faltava levar os arquivos ao
 * lugar certo sem apagar e refazer o banco inteiro.
 *
 * O script é aditivo de propósito: só faz `put`. Nada é removido, e rodar duas
 * vezes apenas reescreve o mesmo objeto.
 *
 * O nome no banco pode trazer o sufixo que o Payload acrescenta quando acha o
 * nome ocupado (`foto.jpg` -> `foto-1.jpg`), e o arquivo de origem não tem esse
 * sufixo — por isso a busca tenta o nome como está e, depois, sem o sufixo.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPlatformProxy } from 'wrangler'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

const PASTAS = [path.join(RAIZ, 'content', 'imagens'), path.join(RAIZ, 'public', 'site')]

const TIPOS: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
}

/** Caminho do arquivo de origem, aceitando o sufixo `-N` do Payload. */
const origem = (nome: string): string | null => {
  const ext = path.extname(nome)
  const semSufixo = nome.slice(0, -ext.length).replace(/-\d+$/, '') + ext

  for (const candidato of [nome, semSufixo]) {
    for (const pasta of PASTAS) {
      const p = path.join(pasta, candidato)
      if (fs.existsSync(p)) return p
    }
  }
  return null
}

const run = async () => {
  const cloudflare = await getPlatformProxy<{ D1: any; R2: any }>({})
  const { D1, R2 } = cloudflare.env

  const { results } = await D1.prepare(
    'select filename, mime_type from media where filename is not null',
  ).all()

  console.log(`mídias no banco: ${results.length}`)

  let enviados = 0
  let jaEstavam = 0
  const faltando: string[] = []

  for (const linha of results as Array<{ filename: string; mime_type: string }>) {
    const nome = linha.filename

    if (await R2.head(nome)) {
      jaEstavam++
      continue
    }

    const arquivo = origem(nome)
    if (!arquivo) {
      faltando.push(nome)
      continue
    }

    const tipo = linha.mime_type || TIPOS[path.extname(nome).toLowerCase()] || 'application/octet-stream'
    await R2.put(nome, fs.readFileSync(arquivo), { httpMetadata: { contentType: tipo } })
    enviados++
    if (enviados % 25 === 0) console.log(`  ${enviados} enviados...`)
  }

  console.log(`\nenviados:     ${enviados}`)
  console.log(`já no bucket: ${jaEstavam}`)

  if (faltando.length) {
    console.log(`\n${faltando.length} sem arquivo de origem:`)
    for (const n of faltando) console.log(`  ! ${n}`)
  }

  await cloudflare.dispose()
}

run().catch((erro) => {
  console.error(erro)
  process.exit(1)
})
