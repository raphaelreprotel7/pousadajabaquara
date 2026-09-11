/* O push do drizzle recria a tabela (criando os indices junto) e depois emite
   CREATE INDEX para os mesmos nomes, sem IF NOT EXISTS — e para no primeiro.
   Aqui: roda o seed, e quando o erro for exatamente esse, derruba o indice
   repetido e tenta de novo. O esquema ja esta certo; e so a contabilidade. */
import { execSync } from 'node:child_process'
import { createClient } from '@libsql/client'

const c = createClient({ url: 'file:./recanto-do-jabaquara.db' })

for (let tentativa = 1; tentativa <= 12; tentativa++) {
  let saida = ''
  try {
    saida = execSync('npm run seed:site', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    console.log(saida.split('\n').filter((l) => /Sem pend|pend/.test(l)).join('\n'))
    console.log(`resolvido na tentativa ${tentativa}`)
    process.exit(0)
  } catch (e) {
    saida = String(e.stdout ?? '') + String(e.stderr ?? '')
  }
  const m = saida.match(/index (\S+) already exists/)
  if (!m) {
    console.error('erro diferente:\n' + saida.split('\n').slice(-12).join('\n'))
    process.exit(1)
  }
  await c.execute(`DROP INDEX IF EXISTS \`${m[1]}\``)
  console.log(`indice repetido removido: ${m[1]}`)
}
console.error('ainda travado depois de 12 tentativas')
process.exit(1)
