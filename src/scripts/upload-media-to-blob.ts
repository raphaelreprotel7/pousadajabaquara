import { put } from '@vercel/blob'
import dotenv from 'dotenv'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

dotenv.config({ path: '.env.local' })

const token = process.env.BLOB_READ_WRITE_TOKEN
if (!token) throw new Error('BLOB_READ_WRITE_TOKEN é obrigatório.')

const mediaDir = path.resolve('public/media')
const filenames = await readdir(mediaDir)
let uploaded = 0

for (let offset = 0; offset < filenames.length; offset += 8) {
  const batch = filenames.slice(offset, offset + 8)
  await Promise.all(
    batch.map(async (filename) => {
      const data = await readFile(path.join(mediaDir, filename))
      await put(filename, data, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
      })
      uploaded += 1
    }),
  )
  console.log(`${uploaded}/${filenames.length} arquivos enviados`)
}

console.log('Upload das mídias concluído.')
