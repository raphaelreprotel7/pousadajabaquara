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
 * `altura` é a altura reservada para o iframe até o `form_embed.js` medir o
 * formulário e ajustá-la. Não é o `data-height` do código de incorporação: o
 * do contato vinha com 957px para um formulário que ocupa pouco menos de
 * 500px, e essa diferença aparece duas vezes — como um salto no layout
 * quando o script mede, e como um vão em branco embaixo do formulário
 * quando ele não chega a medir. Os valores abaixo foram medidos no site.
 * Erre para mais: sobrar espaço é feio, faltar corta o formulário.
 */
export type FormularioCrm = {
  id: string
  altura: number
  /** O `data-form-name` do código de incorporação, usado como title do iframe. */
  nome: string
}

const POR_TITULO: Record<string, FormularioCrm> = {
  contato: { id: 'oYvpF1wq20wJoXeTLTW6', altura: 560, nome: 'Contato - Site' },
  newsletter: { id: 'zIwpaToWygBnYZE5tyJ6', altura: 1025, nome: 'Newsletter - Site' },
}

/** O embed do CRM para este formulário, ou null se ele não tiver um. */
export const formularioCrm = (titulo?: string | null): FormularioCrm | null =>
  POR_TITULO[String(titulo ?? '').trim().toLowerCase()] ?? null

/** Script de incorporação. Carregado uma vez por página, pelo id fixo. */
export const SCRIPT_CRM = 'https://api.reprotel.com.br/js/form_embed.js'
