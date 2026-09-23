import FOTOS from './fotos-locais.json'
type Any = Record<string, any>

/** Origem do próprio site, para reconhecer o que não é upload externo. */
const ORIGEM = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')

/**
 * URL de um upload do Payload, tolerante a valor ainda não populado.
 *
 * O Payload devolve URL absoluta quando `serverURL` está configurado. Em
 * desenvolvimento isso vira `http://localhost:3000/api/media/file/...`, que o
 * otimizador do Next 16 recusa com 400: o host resolve para IP privado e ele
 * trata como risco de SSRF. Cortar a própria origem devolve um caminho
 * same-origin, que o otimizador aceita sem `remotePatterns` e sem baixar a
 * guarda de SSRF.
 *
 * Em produção com Vercel Blob a URL é de outro host e passa intacta — é para
 * ela que existe o `remotePatterns` do next.config.mjs.
 */
/**
 * Fotos servidas pelo próprio projeto, em vez do armazenamento externo.
 *
 * Interruptor de emergência: com NEXT_PUBLIC_FOTOS_LOCAIS=1, toda imagem que
 * exista em public/fotos passa a sair de lá. Existe porque o store de Blob foi
 * suspenso por cobrança inativa e o site ficou sem metade das fotos — e o
 * otimizador, sem conseguir buscar o original, devolvia 502.
 *
 * É chave, não reescrita: tirando a variável e publicando, tudo volta ao Blob
 * sem tocar em código, em conteúdo ou no banco.
 */
const FOTOS_LOCAIS = process.env.NEXT_PUBLIC_FOTOS_LOCAIS === '1'

/**
 * Nome do arquivo sem o sufixo de duplicata.
 *
 * O Payload grava `foto-1.jpg` quando acha o nome ocupado, e em produção
 * praticamente toda imagem tem esse `-1`. Em public/fotos os nomes são os
 * originais. Nenhum arquivo do acervo termina em dígito, então tirar um
 * `-N` final é seguro.
 */
const nomeLocal = (url: string): string => {
  const arquivo = (url.split('?')[0].split('/').pop() ?? '')
  const ponto = arquivo.lastIndexOf('.')
  if (ponto < 1) return ''
  return arquivo.slice(0, ponto).replace(/-\d+$/, '') + arquivo.slice(ponto)
}

export const mediaUrl = (value: unknown): string => {
  const bruta = !value ? '' : typeof value === 'string' ? value : ((value as Any)?.url ?? '')
  if (!bruta) return ''
  if (FOTOS_LOCAIS) {
    const nome = nomeLocal(bruta)
    // só redireciona o que existe: sem a lista, trocaríamos 502 por 404
    if (nome && (FOTOS as string[]).includes(nome)) return `/fotos/${nome}`
  }
  if (ORIGEM && bruta.startsWith(ORIGEM)) return bruta.slice(ORIGEM.length) || '/'
  return bruta
}

export const mediaAlt = (value: unknown, fallback = ''): string => {
  if (!value || typeof value === 'string') return fallback
  return (value as Any)?.alt ?? fallback
}

/** Link do motor sem datas — usado pelos botões "Faça uma reserva". */
export const engineUrl = (booking: Any): string => {
  if (!booking?.engineBaseUrl) return '#reserva'
  return (
    `${booking.engineBaseUrl}?c=${booking.hotelChain}&q=${booking.hotelId}` +
    `&currencyId=${booking.currencyId}&lang=${booking.language}`
  )
}

/**
 * "2026-09-05T00:00:00.000Z" -> "05092026".
 *
 * Corta a string em vez de usar `new Date`: o Payload grava a data em UTC e,
 * no fuso do Brasil, meia-noite UTC vira 21h do dia anterior — a data
 * escolhida no admin chegaria ao motor um dia adiantada.
 */
const toEngineDate = (iso: string): string => {
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}${mes}${ano}`
}

/** Link do motor já com a busca preenchida. Usado pelos pop-ups de campanha. */
export const engineUrlWithDates = (
  booking: Any,
  checkIn: string,
  checkOut: string,
  adults = 2,
): string => {
  if (!booking?.engineBaseUrl || !checkIn || !checkOut) return engineUrl(booking)
  return (
    `${engineUrl(booking)}` +
    `&CheckIn=${toEngineDate(checkIn)}&CheckOut=${toEngineDate(checkOut)}` +
    `&NRooms=1&ad=${adults}&ch=0`
  )
}

export const waUrl = (settings: Any): string =>
  settings?.whatsapp ? `https://wa.me/${settings.whatsapp}` : '#'

/** Telefone da recepção — rodapé e página de Localização. */
export const telUrl = (settings: Any): string =>
  settings?.phoneE164 ? `tel:${settings.phoneE164}` : '#'

/** Telefone da central de reservas. Cai no do hotel se não estiver preenchido. */
export const telUrlReservas = (settings: Any): string => {
  const numero = settings?.reservationsE164 || settings?.phoneE164
  return numero ? `tel:${numero}` : '#'
}

export const labelReservas = (settings: Any): string =>
  settings?.reservationsLabel || settings?.phoneLabel || ''

/**
 * O layout destaca a última palavra do título em vermelho ("O que dizem nossos
 * <strong>hóspedes</strong>"). Em vez de pedir HTML ao editor, a separação é
 * feita aqui.
 */
export const splitHighlight = (title: string): { head: string; tail: string } => {
  const parts = (title ?? '').trim().split(' ')
  if (parts.length < 2) return { head: '', tail: title ?? '' }
  const tail = parts.pop() as string
  return { head: parts.join(' '), tail }
}

/** 450 → "450 metros"; 1700 → "1,7 km". */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${meters} metros`
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`
}
