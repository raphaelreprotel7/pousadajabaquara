import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { SELF_HOSTED_FAMILIES } from '@/fonts'

/**
 * As duas famílias de src/fonts.ts são self-hospedadas pelo next/font e ficam
 * expostas como --font-display e --font-body. O admin continua guardando a
 * pilha como texto ("'Montserrat',system-ui,..."), então trocamos só o primeiro
 * nome pela variável — o resto do fallback fica intacto. Uma família que não
 * esteja self-hospedada passa direto e carrega pelo `webfontUrl`.
 *
 * A lista vem de fonts.ts justamente para que trocar a tipografia do site seja
 * a edição de um arquivo só.
 */
const escapeRegex = (valor: string): string => valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const SELF_HOSTED: Array<[RegExp, string]> = [
  [new RegExp(`^\\s*['"]?${escapeRegex(SELF_HOSTED_FAMILIES.display)}['"]?`, 'i'), 'var(--font-display)'],
  [new RegExp(`^\\s*['"]?${escapeRegex(SELF_HOSTED_FAMILIES.body)}['"]?`, 'i'), 'var(--font-body)'],
]

const withLocalFont = (stack: string): string => {
  for (const [pattern, cssVar] of SELF_HOSTED) {
    if (pattern.test(stack)) return stack.replace(pattern, cssVar)
  }
  return stack
}

/**
 * URLs do Google Fonts que já cobrimos localmente. Emitir o <link> mesmo assim
 * traria de volta a origem render-blocking que o next/font eliminou.
 */
const isSelfHostedWebfont = (url: string): boolean => {
  if (!/fonts\.googleapis\.com/i.test(url)) return false
  const familias = Object.values(SELF_HOSTED_FAMILIES).map(escapeRegex).join('|')
  return new RegExp(familias, 'i').test(url)
}

/**
 * Injeta o tema ativo como CSS custom properties.
 *
 * Vai no <head>, depois do styles.css, e sobrescreve o :root — é aqui que o
 * design system extraído da home vira aparência de verdade, sem ninguém tocar
 * na folha de estilo.
 */
export const DesignTokens = async () => {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'design-system',
    limit: 1,
    depth: 0,
    where: { isActive: { equals: true } },
  })

  const theme = docs?.[0] as Record<string, any> | undefined
  if (!theme) return null

  const c = theme.colors ?? {}
  const t = theme.typography ?? {}
  const l = theme.layout ?? {}
  const s = theme.shape ?? {}
  const p = theme.promotion ?? {}

  const vars = [
    c.brand && `--red:${c.brand}`,
    c.brandDark && `--red-dark:${c.brandDark}`,
    c.ink && `--ink:${c.ink}`,
    c.inkSoft && `--gray-text:${c.inkSoft}`,
    c.inkMute && `--gray-soft:${c.inkMute}`,
    c.surface && `--gray-bg:${c.surface}`,
    c.line && `--gray-line:${c.line}`,
    c.footer && `--ink-2:${c.footer}`,
    c.dark && `--ink-3:${c.dark}`,
    c.accent && `--pink:${c.accent}`,
    c.whatsapp && `--wa:${c.whatsapp}`,
    t.displayFamily && `--ff-head:${withLocalFont(t.displayFamily)}`,
    t.bodyFamily && `--ff-body:${withLocalFont(t.bodyFamily)}`,
    l.container && `--shell:${l.container}px`,
    l.heroHeight && `--hero-height:${l.heroHeight}px`,
    l.pageHeroHeight && `--page-hero-height:${l.pageHeroHeight}px`,
    p.galleryHeight && `--promo-gallery-height:${p.galleryHeight}px`,
    typeof p.galleryGap === 'number' && `--promo-gallery-gap:${p.galleryGap}px`,
    p.contentGap && `--promo-content-gap:${p.contentGap}px`,
    p.relatedColumns && `--promo-related-columns:${p.relatedColumns}`,
    p.detailMaxWidth && `--promo-detail-max:${p.detailMaxWidth}px`,
    typeof s.buttonRadius === 'number' && `--button-radius:${s.buttonRadius}px`,
    typeof s.cardRadius === 'number' && `--card-radius:${s.cardRadius}px`,
    s.cardShadow && `--card-shadow:${s.cardShadow}`,
  ]
    .filter(Boolean)
    .join(';')

  // Tokens que o styles.css não expõe como variável ainda são aplicados por
  // regra — assim o design system governa também tamanho de texto e formas.
  const derived = [
    t.baseSize ? `body{font-size:${t.baseSize}px}` : '',
    t.baseLineHeight ? `body{line-height:${t.baseLineHeight}}` : '',
    t.headingSize ? `.h-section{font-size:${t.headingSize}px}` : '',
    l.sectionSpacing ? `.sec{padding:${l.sectionSpacing}px 0}` : '',
    typeof s.buttonRadius === 'number' ? `.btn{border-radius:${s.buttonRadius}px}` : '',
    typeof s.cardRadius === 'number'
      ? `.suite,.ocard,.post,.room,.perk{border-radius:${s.cardRadius}px}`
      : '',
    s.cardShadow && s.cardShadow !== 'none'
      ? `.suite,.ocard,.post,.room{box-shadow:${s.cardShadow}}`
      : '',
  ]
    .filter(Boolean)
    .join('')

  return (
    <>
      {t.webfontUrl && !isSelfHostedWebfont(t.webfontUrl) ? (
        <link rel="stylesheet" href={t.webfontUrl} />
      ) : null}
      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `:root{${vars}}${derived}${theme.customCss ?? ''}`,
        }}
      />
    </>
  )
}
