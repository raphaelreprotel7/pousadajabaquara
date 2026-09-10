export const canonicalOrigin = (): string =>
  (process.env.NEXT_PUBLIC_SERVER_URL || 'https://pousadarecantodojabaquara.com.br').replace(
    /\/$/,
    '',
  )

export const contentSignal = 'ai-train=no, search=yes, ai-input=yes'

export const publicHeaders = (contentType: string): HeadersInit => ({
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  'Content-Signal': contentSignal,
  'Content-Type': contentType,
})
