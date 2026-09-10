import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Seed de conteúdo — lê `content/site.json` e enche o site inteiro.
 *
 * Existe para que montar um site novo seja preencher um arquivo de dados, e não
 * escrever um script de cadastro por cliente. O JSON é a fonte da verdade: se
 * algo não está lá, não entra no site (e se está errado lá, corrige e roda de
 * novo).
 *
 *   npm run seed        # base: formulários, páginas de obrigado, globals
 *   npm run seed:site   # este script, o conteúdo do cliente
 *
 * IDEMPOTENTE. Rodar de novo atualiza pelo slug/título em vez de duplicar. As
 * imagens só sobem na primeira vez — o nome do arquivo é a chave.
 *
 * ---------------------------------------------------------------------------
 * REFERÊNCIAS DENTRO DO JSON
 *
 *   "@media:fachada.jpg"        -> id da imagem (sobe de content/imagens/)
 *   "@doc:amenities:Wi-Fi"      -> id de um doc, achado por slug ou título
 *   "@form:Contato"             -> id de um formulário, pelo título
 *   { "@rich": ["par 1", ...] } -> campo rich text
 *
 * Elas funcionam em qualquer profundidade, inclusive dentro dos blocos de
 * `layout`. A ordem de cadastro abaixo garante que o alvo já exista na hora em
 * que a referência é resolvida.
 * ---------------------------------------------------------------------------
 */

type Any = Record<string, any>

const RAIZ = process.cwd()
const ARQUIVO = process.argv[2] ?? path.join(RAIZ, 'content', 'site.json')
const PASTAS_IMAGENS = [
  path.join(RAIZ, 'content', 'imagens'),
  path.join(RAIZ, 'public', 'site'),
]

/* ----------------------------- rich text ------------------------------- */

const paragrafo = (texto: string): Any => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [
    { type: 'text', text: texto, version: 1, detail: 0, format: 0, mode: 'normal', style: '' },
  ],
})

const rich = (valor: string | string[]): Any => {
  const paragrafos = Array.isArray(valor) ? valor : [valor]
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragrafos.filter(Boolean).map(paragrafo),
    },
  }
}

/* ------------------------------ execução -------------------------------- */

const run = async () => {
  if (!fs.existsSync(ARQUIVO)) {
    console.error(`Arquivo de conteúdo não encontrado: ${ARQUIVO}`)
    console.error('Copie content/site.example.json para content/site.json e preencha.')
    process.exit(1)
  }

  const dados: Any = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'))
  const payload = await getPayload({ config })

  const midias = new Map<string, string | number>()
  const docs = new Map<string, string | number>()
  const contagem: Record<string, number> = {}
  const avisos: string[] = []

  const conta = (o: string, n = 1) => {
    contagem[o] = (contagem[o] ?? 0) + n
  }

  /** Cria ou atualiza pelo `where`, para o script poder rodar mais de uma vez. */
  const upsert = async (collection: any, where: any, data: any) => {
    const achados = await payload.find({ collection, where, limit: 1, depth: 0 })
    if (achados.docs.length) {
      return payload.update({ collection, id: achados.docs[0].id, data })
    }
    return payload.create({ collection, data })
  }

  const caminhoImagem = (nome: string): string | null => {
    for (const pasta of PASTAS_IMAGENS) {
      const p = path.join(pasta, nome)
      if (fs.existsSync(p)) return p
    }
    return null
  }

  /** Sobe a imagem uma vez e guarda o id. Sem arquivo, avisa e segue. */
  const midiaId = async (nome: string): Promise<string | number | null> => {
    if (midias.has(nome)) return midias.get(nome)!

    const existente = await payload.find({
      collection: 'media',
      where: { filename: { equals: nome } },
      limit: 1,
      depth: 0,
    })
    if (existente.docs.length) {
      midias.set(nome, existente.docs[0].id)
      return existente.docs[0].id
    }

    const arquivo = caminhoImagem(nome)
    if (!arquivo) {
      avisos.push(`imagem não encontrada: ${nome}`)
      return null
    }

    const meta: Any = (dados.media ?? []).find((m: Any) => m.file === nome) ?? {}
    const categoria = meta.category ? await docId('photo-categories', meta.category) : undefined

    const dadosMidia: Any = {
      alt: meta.alt ?? nome.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      ...(categoria ? { category: categoria } : {}),
      ...(meta.credit ? { credit: meta.credit } : {}),
    }

    // O `as` estreita para a sobrecarga sem draft — com `Any` solto o TS escolhe
    // a variante de rascunho e passa a exigir `draft: true`.
    const criada: Any = await payload.create({
      collection: 'media',
      data: dadosMidia as { alt: string },
      filePath: arquivo,
    })
    midias.set(nome, criada.id)
    conta('media')
    return criada.id
  }

  /** Acha um doc por slug ou título. A chave é o que estiver escrito no JSON. */
  const docId = async (colecao: string, chave: string): Promise<string | number | null> => {
    const cache = `${colecao}/${chave}`
    if (docs.has(cache)) return docs.get(cache)!

    for (const campo of ['slug', 'title']) {
      try {
        // `as never` no slug da collection é o preço de percorrer collections
        // por nome vindo de JSON; o retorno volta a ser Any de propósito.
        const achados: Any = await payload.find({
          collection: colecao as never,
          where: { [campo]: { equals: chave } } as never,
          limit: 1,
          depth: 0,
        })
        if (achados.docs.length) {
          docs.set(cache, achados.docs[0].id)
          return achados.docs[0].id
        }
      } catch {
        // campo inexistente nessa collection — tenta o próximo
      }
    }
    avisos.push(`referência não resolvida: @doc:${colecao}:${chave}`)
    return null
  }

  const formId = async (titulo: string): Promise<string | number | null> => {
    const achados: Any = await payload.find({
      collection: 'forms' as never,
      where: { title: { equals: titulo } } as never,
      limit: 1,
      depth: 0,
    })
    if (achados.docs.length) return achados.docs[0].id
    avisos.push(`formulário não encontrado: ${titulo} (rode "npm run seed" antes)`)
    return null
  }

  /** Percorre o JSON trocando as referências pelos ids reais. */
  const resolver = async (valor: any): Promise<any> => {
    if (Array.isArray(valor)) {
      const saida = []
      for (const item of valor) saida.push(await resolver(item))
      return saida
    }

    if (valor && typeof valor === 'object') {
      if ('@rich' in valor) return rich(valor['@rich'])
      const saida: Any = {}
      for (const [chave, v] of Object.entries(valor)) saida[chave] = await resolver(v)
      return saida
    }

    if (typeof valor === 'string') {
      if (valor.startsWith('@media:')) return midiaId(valor.slice(7))
      if (valor.startsWith('@form:')) return formId(valor.slice(6))
      if (valor.startsWith('@doc:')) {
        const resto = valor.slice(5)
        const corte = resto.indexOf(':')
        if (corte > 0) return docId(resto.slice(0, corte), resto.slice(corte + 1))
      }
    }

    return valor
  }

  /**
   * Collections que têm campo `order`: a posição no JSON já vira a ordem no
   * site, sem ninguém numerar à mão.
   */
  const ORDENAVEIS = new Set([
    'amenities',
    'differentials',
    'faqs',
    'photo-categories',
    'suites',
    'testimonials',
  ])

  /** Cadastra uma lista, respeitando a ordem do JSON. */
  const cadastrar = async (
    colecao: string,
    itens: Any[] | undefined,
    chave: (item: Any) => Any,
    extras: Any = {},
  ) => {
    if (!itens?.length) return
    for (const [i, item] of itens.entries()) {
      const posicao = ORDENAVEIS.has(colecao) ? { order: i } : {}
      const dadosItem = await resolver({ ...posicao, ...extras, ...item })
      await upsert(colecao, chave(item), dadosItem)
      conta(colecao)
    }
  }

  /* --------------------------- DESIGN SYSTEM --------------------------- */
  // Primeiro de tudo: é ele que governa a aparência de todo o resto.

  if (dados.designSystem) {
    const tema = { isActive: true, ...dados.designSystem }
    await upsert('design-system', { name: { equals: tema.name } }, tema)
    conta('design-system')
  }

  /* ------------------------------ TAXONOMIAS --------------------------- */

  await cadastrar('photo-categories', dados.photoCategories, (i) => ({
    title: { equals: i.title },
  }))
  await cadastrar('post-categories', dados.postCategories, (i) => ({
    title: { equals: i.title },
  }))

  /* -------------------------------- MÍDIAS ----------------------------- */
  // Sobe tudo que está declarado, mesmo o que nenhum bloco referencia ainda —
  // é o acervo da galeria.

  for (const item of dados.media ?? []) await midiaId(item.file)

  /* ------------------------------ CONTEÚDO ----------------------------- */

  await cadastrar('amenities', dados.amenities, (i) => ({ title: { equals: i.title } }))
  await cadastrar('differentials', dados.differentials, (i) => ({ title: { equals: i.title } }))
  await cadastrar('attractions', dados.attractions, (i) => ({ title: { equals: i.title } }))
  await cadastrar('testimonials', dados.testimonials, (i) => ({ title: { equals: i.title } }))
  await cadastrar('faqs', dados.faqs, (i) => ({ question: { equals: i.question } }))

  await cadastrar('suites', dados.suites, (i) => ({ title: { equals: i.title } }), {
    _status: 'published',
  })
  await cadastrar('offers', dados.offers, (i) => ({ title: { equals: i.title } }), {
    _status: 'published',
  })
  await cadastrar('posts', dados.posts, (i) => ({ title: { equals: i.title } }), {
    _status: 'published',
  })
  await cadastrar('popups', dados.popups, (i) => ({ title: { equals: i.title } }))

  /* ------------------------------- GLOBALS ----------------------------- */

  const globals: Array<[string, any]> = [
    ['site-settings', dados.site],
    ['booking-bar', dados.booking],
    ['header', dados.header],
    ['footer', dados.footer],
    ['newsletter-section', dados.newsletter],
    ['testimonials-section', dados.testimonialsSection],
    ['floating-actions', dados.floatingActions],
    ['promotion-page', dados.promotionPage],
  ]

  for (const [slug, conteudo] of globals) {
    if (!conteudo) continue
    await payload.updateGlobal({ slug: slug as never, data: await resolver(conteudo) })
    conta(`global:${slug}`)
  }

  /* ------------------------------- PÁGINAS ----------------------------- */
  // Por último: os blocos referenciam imagens, suítes e formulários já criados.

  for (const pagina of dados.pages ?? []) {
    const dadosPagina = await resolver({ _status: 'published', ...pagina })
    await upsert('pages', { slug: { equals: pagina.slug } }, dadosPagina)
    conta('pages')
  }

  /* ------------------------------- RELATÓRIO --------------------------- */

  console.log(`\nConteúdo aplicado a partir de ${path.relative(RAIZ, ARQUIVO)}:`)
  for (const [o, n] of Object.entries(contagem)) console.log(`  ${o.padEnd(22)} ${n}`)

  if (avisos.length) {
    console.log(`\n${avisos.length} pendência(s):`)
    for (const a of new Set(avisos)) console.log(`  ! ${a}`)
    process.exit(2)
  }

  console.log('\nSem pendências.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
