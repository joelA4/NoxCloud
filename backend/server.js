import Fastify from 'fastify'
import multipart from '@fastify/multipart'
import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'


const STORAGE = path.resolve('../storage')
await mkdir(STORAGE, { recursive: true })

const app = Fastify({ logger: true })
await app.register(multipart, { limits: { fileSize: 2 * 1024 ** 3 } }) // 2 GB

app.get('/health', async () => ({ status: 'ok', app: 'NoxCloud' }))

app.post('/upload', async (req, reply) => {
  const file = await req.file()
  if (!file) return reply.code(400).send({ error: 'No se envió archivo' })

  const id = randomUUID()
  const stored = id + path.extname(file.filename)
  await pipeline(file.file, createWriteStream(path.join(STORAGE, stored)))

  return { id, original: file.filename, stored }
})

await app.listen({ port: 3000, host: '0.0.0.0' })