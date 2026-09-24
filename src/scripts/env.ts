import dotenv from 'dotenv'

/**
 * Carrega as variáveis de ambiente na mesma ordem que o Next.js usa: `.env`
 * primeiro, `.env.local` por cima.
 *
 * Sem isto os scripts liam só o `.env` e ficavam presos ao banco local,
 * enquanto o site (que lê os dois) já apontava para produção — o seed
 * escreveria no banco errado sem reclamar de nada.
 *
 * `.env.local` fica fora do versionamento; é onde moram os endereços de
 * produção na máquina de quem publica.
 */
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })

/** Nome curto do banco em uso, para os scripts dizerem onde vão escrever. */
export const bancoEmUso = () => {
  // A Cloudflare tem precedência: quando USAR_CLOUDFLARE está ligado o
  // payload.config ignora qualquer URL e vai para o D1. Sem este caso o script
  // anunciaria "SQLite local" enquanto escrevia no banco de produção.
  if (process.env.USAR_CLOUDFLARE === '1') return 'D1 pousadajabaquara (Cloudflare)'

  const url =
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URI ||
    process.env.POSTGRES_URL ||
    'file:./recanto-do-jabaquara.db'

  if (url.startsWith('postgres')) {
    const host = url.split('@')[1]?.split('/')[0] ?? '?'
    return `Postgres em ${host}`
  }
  if (url.startsWith('libsql')) return `Turso em ${url.replace('libsql://', '').split('/')[0]}`
  return `SQLite local (${url.replace('file:', '')})`
}
