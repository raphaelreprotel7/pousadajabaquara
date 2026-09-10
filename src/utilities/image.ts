/**
 * Props de imagem otimizada para as <img> do site.
 *
 * Por que não `next/image`: o layout inteiro é governado por CSS
 * (`.img{width:100%;object-fit:cover}` + `aspect-ratio` por variante). Trocar
 * por `<Image fill>` exigiria mexer em posicionamento de dezenas de blocos —
 * risco alto para ganho zero. Aqui a tag continua sendo `<img>` com a mesma
 * classe; só passa a apontar para o otimizador do Next, que devolve AVIF/WebP
 * no corte certo para a largura real de exibição.
 *
 * O segundo efeito, e o mais caro no relatório do PageSpeed: o React 19 emite
 * `<link rel="preload" as="image">` para toda `<img>` renderizada no servidor
 * sem `loading="lazy"`. A home tinha 13 imagens assim — 1,78 MB disputando
 * banda com o LCP. Marcar tudo que não é o herói como `lazy` derruba esses
 * preloads.
 */

/** Mesmos breakpoints do `images.deviceSizes` default do Next. */
const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920] as const

/** Precisa existir em `images.qualities` no next.config.mjs. */
const QUALITY = 75

const endpoint = (src: string, width: number): string =>
  `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${QUALITY}`

export type OptimizedImg = {
  src: string
  srcSet?: string
  sizes?: string
  loading?: 'lazy'
  decoding: 'async'
  fetchPriority?: 'high'
}

/**
 * @param sizes    largura de exibição em CSS, para o browser escolher o corte.
 * @param priority só o elemento LCP (o herói). Sai do lazy e pede prioridade.
 */
export const imgProps = (
  src: string,
  { sizes = '100vw', priority = false }: { sizes?: string; priority?: boolean } = {},
): OptimizedImg => {
  // SVG e data: não passam pelo otimizador; vetor já é do tamanho que precisa.
  if (!src || src.startsWith('data:') || src.split('?')[0].endsWith('.svg')) {
    return {
      src,
      decoding: 'async',
      ...(priority ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const }),
    }
  }

  return {
    src: endpoint(src, 1920),
    srcSet: DEVICE_SIZES.map((w) => `${endpoint(src, w)} ${w}w`).join(', '),
    sizes,
    decoding: 'async',
    ...(priority ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const }),
  }
}

/** Larguras de exibição reais, conferidas contra o styles.css. */
export const SIZES = {
  /** Herói e faixas full-bleed. */
  full: '100vw',
  /** Coluna de metade da grade a partir de ~900px. */
  half: '(max-width: 900px) 100vw, 50vw',
  /** Cards em grade de 3 (suítes, ofertas, posts, galeria). */
  card: '(max-width: 900px) 100vw, 33vw',
  /** Colagem: ~metade da coluna, que já é metade da tela. */
  collage: '(max-width: 900px) 50vw, 25vw',
} as const
