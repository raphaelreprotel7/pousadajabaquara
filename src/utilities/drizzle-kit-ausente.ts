/**
 * Substituto de `drizzle-kit/api` no build da Cloudflare.
 *
 * O adaptador do Payload faz `require('drizzle-kit/api')` para duas coisas, e
 * só duas: sincronizar schema (`push`) e gerar migrações. Nenhuma das duas tem
 * lugar dentro de um Worker — schema se altera pelo `seed`/`wrangler d1`, a
 * partir de uma máquina, nunca por uma requisição de visitante.
 *
 * Sem este stub o empacotamento quebra: o Turbopack reescreve o nome do módulo
 * (`drizzle-kit-<hash>/api`) e o esbuild não consegue resolvê-lo depois. Além
 * disso o drizzle-kit é uma ferramenta de linha de comando inteira, que não
 * deveria pesar no bundle mesmo que resolvesse.
 *
 * As funções existem para que o `require` devolva o formato esperado, mas
 * falam claro se alguém realmente as chamar — melhor um erro legível do que um
 * `undefined is not a function` vindo do fundo do adaptador.
 */

const indisponivel = (nome: string) => () => {
  throw new Error(
    `drizzle-kit/api não existe no Worker (chamada: ${nome}). ` +
      'Alterações de schema são feitas de fora: rode "npm run seed:cloudflare" ' +
      'ou "wrangler d1" a partir da sua máquina.',
  )
}

export const generateDrizzleJson = indisponivel('generateDrizzleJson')
export const generateMigration = indisponivel('generateMigration')
export const pushSchema = indisponivel('pushSchema')
export const upPgSnapshot = indisponivel('upPgSnapshot')

export const generateSQLiteDrizzleJson = indisponivel('generateSQLiteDrizzleJson')
export const generateSQLiteMigration = indisponivel('generateSQLiteMigration')
export const pushSQLiteSchema = indisponivel('pushSQLiteSchema')
