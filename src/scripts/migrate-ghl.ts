/**
 * Migration da integração com o GoHighLevel.
 *
 * O projeto roda com `push: false` (drizzle não sabe reconciliar o schema já
 * existente), então o DDL é aplicado explicitamente. Foi extraído de um push
 * do próprio Payload contra um banco vazio e conferido contra o schema atual:
 * é 100% aditivo — 2 tabelas, 4 índices e 6 colunas. Nada é removido ou
 * alterado, então rodar não põe dado existente em risco.
 *
 * É idempotente: pode rodar de novo sem quebrar, e reversível pelo --rollback.
 *
 *   npm run migrate:ghl                         -> banco local (recanto-do-jabaquara.db)
 *   npm run migrate:ghl -- --prod               -> Turso de produção
 *   npm run migrate:ghl -- --prod --rollback    -> desfaz no Turso
 */
import { createClient } from '@libsql/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const prod = process.argv.includes('--prod')

const client = prod
  ? createClient({
      url: process.env.TURSO_DATABASE_URL as string,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : createClient({ url: process.env.DATABASE_URI || 'file:./recanto-do-jabaquara.db' })

const TABELAS = [
  `CREATE TABLE IF NOT EXISTS \`forms_ghl_tags\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`tag\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  )`,
  `CREATE TABLE IF NOT EXISTS \`forms_ghl_field_map\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`form_field\` text,
    \`target\` text,
    \`custom_key\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  )`,
]

const INDICES = [
  'CREATE INDEX IF NOT EXISTS `forms_ghl_tags_order_idx` ON `forms_ghl_tags` (`_order`)',
  'CREATE INDEX IF NOT EXISTS `forms_ghl_tags_parent_id_idx` ON `forms_ghl_tags` (`_parent_id`)',
  'CREATE INDEX IF NOT EXISTS `forms_ghl_field_map_order_idx` ON `forms_ghl_field_map` (`_order`)',
  'CREATE INDEX IF NOT EXISTS `forms_ghl_field_map_parent_id_idx` ON `forms_ghl_field_map` (`_parent_id`)',
]

/** SQLite não tem "ADD COLUMN IF NOT EXISTS"; conferimos pelo pragma. */
const COLUNAS: Array<{ tabela: string; coluna: string; ddl: string }> = [
  {
    tabela: 'forms',
    coluna: 'ghl_enabled',
    ddl: 'ALTER TABLE `forms` ADD COLUMN `ghl_enabled` integer DEFAULT true',
  },
  {
    tabela: 'forms',
    coluna: 'ghl_location_id',
    ddl: 'ALTER TABLE `forms` ADD COLUMN `ghl_location_id` text',
  },
  {
    tabela: 'forms',
    coluna: 'ghl_source',
    ddl: "ALTER TABLE `forms` ADD COLUMN `ghl_source` text DEFAULT 'Site — Pousada Recanto do Jabaquara'",
  },
  {
    tabela: 'form_submissions',
    coluna: 'ghl_status',
    ddl: 'ALTER TABLE `form_submissions` ADD COLUMN `ghl_status` text',
  },
  {
    tabela: 'form_submissions',
    coluna: 'ghl_contact_id',
    ddl: 'ALTER TABLE `form_submissions` ADD COLUMN `ghl_contact_id` text',
  },
  {
    tabela: 'form_submissions',
    coluna: 'ghl_error',
    ddl: 'ALTER TABLE `form_submissions` ADD COLUMN `ghl_error` text',
  },
]

/**
 * Desfaz a migration. Só remove o que ela criou — nenhuma tabela ou coluna
 * pré-existente é tocada. Perde apenas a configuração de GHL dos formulários.
 */
const rollback = async () => {
  console.log('Revertendo a migration do GHL…\n')
  for (const t of ['forms_ghl_tags', 'forms_ghl_field_map']) {
    await client.execute(`DROP TABLE IF EXISTS \`${t}\``)
    console.log(`  tabela  ${t} removida`)
  }
  for (const { tabela, coluna } of COLUNAS) {
    const info = await client.execute(`pragma table_info(${tabela})`)
    if (!info.rows.some((r) => r.name === coluna)) {
      console.log(`  coluna  ${tabela}.${coluna} (já não existia)`)
      continue
    }
    await client.execute(`ALTER TABLE \`${tabela}\` DROP COLUMN \`${coluna}\``)
    console.log(`  coluna  ${tabela}.${coluna} removida`)
  }
  console.log('\nRevertido.')
  process.exit(0)
}

const run = async () => {
  const alvo = prod ? 'TURSO (PRODUÇÃO)' : 'local'
  if (prod && !process.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL ausente — não dá para migrar produção')
  }
  if (process.argv.includes('--rollback')) return rollback()
  console.log(`Aplicando migration do GHL no banco ${alvo}…\n`)

  for (const sql of TABELAS) {
    const nome = sql.match(/EXISTS `([^`]+)`/)?.[1]
    await client.execute(sql)
    console.log(`  tabela  ${nome}`)
  }

  for (const sql of INDICES) {
    const nome = sql.match(/EXISTS `([^`]+)`/)?.[1]
    await client.execute(sql)
    console.log(`  índice  ${nome}`)
  }

  for (const { tabela, coluna, ddl } of COLUNAS) {
    const info = await client.execute(`pragma table_info(${tabela})`)
    const existe = info.rows.some((r) => r.name === coluna)
    if (existe) {
      console.log(`  coluna  ${tabela}.${coluna} (já existia)`)
      continue
    }
    await client.execute(ddl)
    console.log(`  coluna  ${tabela}.${coluna} criada`)
  }

  console.log('\nOK.')
  process.exit(0)
}

run().catch((e) => {
  console.error('FALHOU:', e)
  process.exit(1)
})
