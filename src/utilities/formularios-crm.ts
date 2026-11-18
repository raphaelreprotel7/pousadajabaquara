/**
 * Formulários servidos pelo CRM (GHL), por título.
 *
 * A chave é o título do formulário no admin — não a posição na página — porque
 * o mesmo bloco de formulário serve /contato e /trabalhe-conosco, e a
 * newsletter e o pop-up usam o seu próprio. Casando pelo título, os três
 * pontos de uso resolvem sozinhos qual embed mostrar.
 *
 * Quem não estiver aqui continua com o formulário nativo do Payload, que grava
 * em /api/form-submissions e repassa ao CRM pelo hook `ghlForwarder`. É o caso
 * de "Trabalhe Conosco": não existe embed do CRM para ele.
 *
 * `altura` é o `data-height` do código de incorporação, usado como altura
 * inicial. O `form_embed.js` redimensiona o iframe depois que o formulário
 * carrega; sem um valor de partida razoável, a seção colapsaria e voltaria a
 * crescer, empurrando o conteúdo abaixo.
 */
export type FormularioCrm = {
  id: string
  altura: number
  /** O `data-form-name` do código de incorporação, usado como title do iframe. */
  nome: string
}

const POR_TITULO: Record<string, FormularioCrm> = {
  contato: { id: 'oYvpF1wq20wJoXeTLTW6', altura: 957, nome: 'Contato - Site' },
  newsletter: { id: 'zIwpaToWygBnYZE5tyJ6', altura: 1025, nome: 'Newsletter - Site' },
}

/** O embed do CRM para este formulário, ou null se ele não tiver um. */
export const formularioCrm = (titulo?: string | null): FormularioCrm | null =>
  POR_TITULO[String(titulo ?? '').trim().toLowerCase()] ?? null

/** Script de incorporação. Carregado uma vez por página, pelo id fixo. */
export const SCRIPT_CRM = 'https://api.reprotel.com.br/js/form_embed.js'
