import { Arapey, Questrial } from 'next/font/google'

/**
 * As duas famílias do design system, self-hospedadas pelo next/font.
 *
 * Antes vinham de um <link> para fonts.googleapis.com, que era render-blocking
 * e ainda abria uma segunda origem (fonts.gstatic.com) para os .woff2 — duas
 * rodadas de DNS + TLS no caminho crítico. Agora o CSS do @font-face é inline e
 * os arquivos saem do mesmo domínio.
 *
 * ---------------------------------------------------------------------------
 * TROCAR A TIPOGRAFIA DO SITE = EDITAR SÓ ESTE ARQUIVO.
 *
 * 1. Troque o import por outra família de `next/font/google`.
 * 2. Ajuste `weight` (famílias variáveis dispensam o campo).
 * 3. Atualize `SELF_HOSTED_FAMILIES` com o nome exato da família — é o que o
 *    DesignTokens usa para reconhecer a pilha vinda do admin e trocá-la pela
 *    CSS var self-hospedada.
 *
 * O Design System continua guardando a pilha completa como texto
 * ("'Playfair Display',Georgia,serif"); quem não estiver nesta lista passa
 * direto e carrega pelo `webfontUrl`.
 * ---------------------------------------------------------------------------
 *
 * Pousada Recanto do Jabaquara: a serifada oficial da marca é a Arapey, do
 * manual de identidade. Os títulos saem em ITÁLICO (o "título corrido" do
 * manual) e os banners de página em regular (o "título destaque"), por isso o
 * `style` traz os dois cortes. A Arapey só existe no peso 400. O itálico é aplicado no
 * CSS (`font-style:italic` nos títulos), não aqui.
 *
 * O corpo é Questrial, que só existe no peso 400. Foi a família que bateu com
 * a referência no teste de sobreposição: 'a' de um andar, 't' de topo
 * chanfrado e o mesmo avanço por palavra. Onde o mockup mostra negrito (item
 * ativo do menu), o navegador sintetiza — como o próprio mockup faz.
 */
export const displayFont = Arapey({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
})

export const bodyFont = Questrial({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-body',
})

/** Nome das famílias acima, como aparecem no começo da pilha do Design System. */
export const SELF_HOSTED_FAMILIES = {
  display: 'Arapey',
  body: 'Questrial',
} as const

/** Classes que o layout precisa pendurar no <html>. */
export const fontVariables = `${displayFont.variable} ${bodyFont.variable}`
