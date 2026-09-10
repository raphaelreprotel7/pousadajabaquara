import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * `revalidatePath` só existe dentro do contexto de request ou de geração
 * estática do Next. Quando o Payload roda fora dele — seed, migração, cron,
 * CLI — a chamada estoura com "Invariant: static generation store missing".
 *
 * Aqui isso não é erro: é só não haver cache do Next para invalidar.
 */
const safeRevalidate = (fn: () => void) => {
  try {
    fn()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('static generation store')) return
    throw error
  }
}

/**
 * Rotas reais de cada collection.
 *
 * Só `pages` tem slug igual à rota. Um artigo com slug "meu-post" mora em
 * `/blog/meu-post`, não em `/meu-post` — invalidar pelo slug puro batia numa
 * rota que não existe e o artigo publicado ficava no ar com o texto antigo até
 * o próximo deploy.
 *
 * `'tudo'` cobre o conteúdo sem página própria: suítes, atrativos, depoimentos
 * e FAQs são montados dentro das páginas por blocos, e descobrir em quais
 * exigiria varrer o conteúdo de todas elas.
 */
const rotasDaCollection = (collection: string, slug?: unknown): string[] | 'tudo' => {
  const s = typeof slug === 'string' && slug.trim().length > 0 ? slug.trim() : null

  switch (collection) {
    case 'pages':
      return s && s !== 'home' ? [`/${s}`] : []
    case 'posts':
      // A listagem mostra título, resumo e imagem, então envelhece junto.
      return s ? ['/blog', `/blog/${s}`] : ['/blog']
    case 'offers':
      return s ? ['/promocoes', `/promocoes/${s}`] : ['/promocoes']
    default:
      return 'tudo'
  }
}

/**
 * Invalida por caminho, não por tag.
 *
 * `revalidateTag` exigiria que as consultas fossem marcadas com `cacheTag`
 * dentro de funções `'use cache'`. Como as buscas aqui vão direto na API local
 * do Payload, não há nada tagueado — chamar `revalidateTag` seria no-op.
 */
const revalidateContent = (collection: string, slug?: unknown) => {
  const rotas = rotasDaCollection(collection, slug)

  // 'layout' na raiz alcança todas as rotas abaixo dela.
  if (rotas === 'tudo') {
    safeRevalidate(() => revalidatePath('/', 'layout'))
    return
  }

  // A home carrega o carrossel de suítes, a grade de experiências e os últimos
  // artigos, então mudança em qualquer um desses conteúdos também a invalida.
  safeRevalidate(() => revalidatePath('/'))
  safeRevalidate(() => revalidatePath('/en'))

  for (const rota of rotas) {
    safeRevalidate(() => revalidatePath(rota))
    safeRevalidate(() => revalidatePath(`/en${rota}`))
  }
}

/** Invalida o cache do Next quando o conteúdo muda no admin. */
export const revalidateAfterChange: CollectionAfterChangeHook = ({ collection, doc, req }) => {
  if (req.context?.disableRevalidate) return doc
  // Pop-ups caem no 'tudo' do mapa: podem aparecer em qualquer rota, então
  // ativar, desativar ou mudar a segmentação invalida a árvore inteira.
  revalidateContent(collection.slug, doc?.slug)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ collection, doc, req }) => {
  if (req.context?.disableRevalidate) return doc
  revalidateContent(collection.slug, doc?.slug)
  return doc
}

/** Header, Footer e Configurações aparecem em todas as páginas. */
export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, req }) => {
  if (req.context?.disableRevalidate) return doc

  // 'layout' alcança todas as rotas abaixo de '/'.
  safeRevalidate(() => revalidatePath('/', 'layout'))

  return doc
}
