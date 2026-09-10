import { createClient, type InStatement } from '@libsql/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  throw new Error('TURSO_DATABASE_URL e TURSO_AUTH_TOKEN são obrigatórios.')
}

const source = createClient({ url: 'file:./recanto-do-jabaquara.db' })
const target = createClient({ url, authToken })

const quote = (name: string) => `"${name.replaceAll('"', '""')}"`

const existing = await target.execute(
  "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' LIMIT 1",
)

if (existing.rows.length) {
  throw new Error(`O banco remoto não está vazio (tabela ${existing.rows[0].name}). Migração cancelada.`)
}

const schema = await source.execute(`
  SELECT type, name, sql
  FROM sqlite_master
  WHERE sql IS NOT NULL
    AND name NOT LIKE 'sqlite_%'
  ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 WHEN 'trigger' THEN 2 ELSE 3 END, name
`)

const tables = schema.rows.filter((row) => row.type === 'table')
const auxiliaries = schema.rows.filter((row) => row.type !== 'table')

await target.execute('PRAGMA foreign_keys = OFF')

for (const row of tables) {
  await target.execute(String(row.sql))
}

let copiedRows = 0
for (const table of tables) {
  const tableName = String(table.name)
  const rows = await source.execute(`SELECT * FROM ${quote(tableName)}`)
  if (!rows.rows.length) continue

  const columns = rows.columns.map(String)
  const placeholders = columns.map(() => '?').join(', ')
  const sql = `INSERT INTO ${quote(tableName)} (${columns.map(quote).join(', ')}) VALUES (${placeholders})`

  for (let offset = 0; offset < rows.rows.length; offset += 100) {
    const statements: InStatement[] = rows.rows.slice(offset, offset + 100).map((row) => ({
      sql,
      args: columns.map((column) => row[column] ?? null),
    }))
    await target.batch(statements, 'write')
    copiedRows += statements.length
  }
}

for (const row of auxiliaries) {
  await target.execute(String(row.sql))
}

await target.execute('PRAGMA foreign_keys = ON')

const remoteTables = await target.execute(
  "SELECT count(*) AS total FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
)

console.log(`Migração concluída: ${remoteTables.rows[0].total} tabelas e ${copiedRows} registros.`)

source.close()
target.close()
