import './env'
import { createClient } from '@libsql/client'

/**
 * Põe o SQLite local em modo WAL.
 *
 * O padrão do SQLite é `journal_mode=delete`, em que QUALQUER escrita bloqueia
 * TODAS as leituras. Na prática isso aparecia como páginas devolvendo 500 com
 * `SQLITE_BUSY: database is locked` sempre que um `seed:site` ou um
 * `npm run build` rodava com o servidor no ar — o pedido do visitante esbarrava
 * na transação de escrita.
 *
 * Em WAL o leitor não espera o escritor: cada um segue no seu ritmo. O modo
 * fica gravado no próprio arquivo do banco, então basta rodar uma vez — mas
 * como o banco nasce vazio numa máquina nova, isto entra antes do seed.
 *
 * Só vale para arquivo local. Em Turso/libsql remoto a concorrência é do
 * servidor e o PRAGMA não se aplica; nesse caso o script apenas avisa e sai.
 */
const url =
  process.env.TURSO_DATABASE_URL ||
  process.env.DATABASE_URI ||
  'file:./recanto-do-jabaquara.db'

const run = async () => {
  if (!url.startsWith('file:')) {
    console.log(`Banco remoto (${url.split(':')[0]}): WAL não se aplica, nada a fazer.`)
    process.exit(0)
  }

  const client = createClient({ url })
  const antes = await client.execute('PRAGMA journal_mode')
  const modo = await client.execute('PRAGMA journal_mode=WAL')
  await client.execute('PRAGMA busy_timeout=15000')

  const de = String(antes.rows[0]?.journal_mode ?? '?')
  const para = String(modo.rows[0]?.journal_mode ?? '?')
  console.log(`journal_mode: ${de} -> ${para}`)
  if (para !== 'wal') {
    console.error('Não consegui ligar o WAL. Leituras vão continuar esbarrando em escritas.')
    process.exit(1)
  }
  process.exit(0)
}

void run()
