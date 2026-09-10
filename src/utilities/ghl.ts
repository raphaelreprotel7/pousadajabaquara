/**
 * Cliente do GoHighLevel (LeadConnector API v2).
 *
 * O GHL não expõe endpoint público para criar *submissions* de formulário —
 * `/forms/submissions` é somente leitura. O caminho suportado para levar um
 * lead do site até o CRM é o contato: `POST /contacts/upsert` grava/atualiza a
 * pessoa (deduplicando por e-mail/telefone dentro da location) e, em seguida,
 * uma nota guarda a resposta do formulário na íntegra, para nada do que a
 * pessoa escreveu se perder.
 *
 * Nada aqui lança exceção: uma falha do GHL nunca pode derrubar o envio do
 * formulário no site. Os erros voltam no retorno e o hook os registra.
 */

const API = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'
const TIMEOUT_MS = 8000

/** Campos padrão de contato no GHL que aceitamos como destino de mapeamento. */
export const GHL_TARGETS = [
  'firstName',
  'lastName',
  'name',
  'email',
  'phone',
  'companyName',
  'address1',
  'city',
  'state',
  'postalCode',
  'website',
  'custom',
  'ignore',
] as const

export type GhlTarget = (typeof GHL_TARGETS)[number]

export type GhlFieldMap = {
  formField?: string | null
  target?: GhlTarget | null
  /** Chave do custom field no GHL, quando `target` = 'custom'. */
  customKey?: string | null
}

export type GhlFormConfig = {
  enabled?: boolean | null
  locationId?: string | null
  source?: string | null
  tags?: { tag?: string | null }[] | null
  fieldMap?: GhlFieldMap[] | null
}

export type GhlResult =
  | { ok: true; contactId: string; noteCreated: boolean }
  | { ok: false; error: string; status?: number }

/* ------------------------------------------------------------------ */
/* Normalização                                                        */
/* ------------------------------------------------------------------ */

/**
 * Telefone brasileiro em E.164. O GHL rejeita silenciosamente números sem
 * código de país, e aí o lead entra sem telefone utilizável.
 */
export const toE164 = (raw: string): string | undefined => {
  const d = (raw || '').replace(/\D/g, '')
  if (!d) return undefined
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) return `+${d}`
  if (d.length === 10 || d.length === 11) return `+55${d}`
  if (d.length > 8) return `+${d}`
  return undefined
}

/** "João da Silva" -> { firstName: 'João', lastName: 'da Silva' } */
export const splitName = (full: string): { firstName?: string; lastName?: string } => {
  const parts = (full || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return {}
  if (parts.length === 1) return { firstName: parts[0] }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim())

/**
 * Adivinha o destino a partir do nome do campo. Serve para o formulário
 * funcionar sem configuração nenhuma; o mapeamento explícito no admin sempre
 * tem prioridade sobre isto.
 */
const guessTarget = (fieldName: string, value: string): GhlTarget | null => {
  const n = (fieldName || '').toLowerCase()
  if (/sobrenome|last[_-]?name|surname/.test(n)) return 'lastName'
  if (/(^|[^a-z])(nome|name|nombre)([^a-z]|$)/.test(n)) return 'name'
  if (/mail/.test(n)) return 'email'
  if (/fone|phone|telefone|celular|whats|tel([^a-z]|$)/.test(n)) return 'phone'
  if (/empresa|company/.test(n)) return 'companyName'
  if (/cidade|city/.test(n)) return 'city'
  if (/estado|state|uf([^a-z]|$)/.test(n)) return 'state'
  if (/cep|postal|zip/.test(n)) return 'postalCode'
  if (/site|website/.test(n)) return 'website'
  // Sem pista pelo nome: o formato do valor ainda pode entregar.
  if (isEmail(value)) return 'email'
  return null
}

/* ------------------------------------------------------------------ */
/* Montagem do payload                                                 */
/* ------------------------------------------------------------------ */

export type SubmissionEntry = { field?: string | null; value?: unknown }

export type BuiltContact = {
  contact: Record<string, unknown>
  /** Campos que não viraram atributo de contato — vão para a nota. */
  leftovers: Array<{ label: string; value: string }>
}

export const buildContact = (
  submissionData: SubmissionEntry[],
  config: GhlFormConfig,
  locationId: string,
): BuiltContact => {
  const explicit = new Map<string, GhlFieldMap>()
  for (const m of config.fieldMap ?? []) {
    if (m?.formField) explicit.set(m.formField, m)
  }

  const contact: Record<string, unknown> = { locationId }
  const customFields: Array<{ key: string; field_value: string }> = []
  const leftovers: Array<{ label: string; value: string }> = []

  for (const entry of submissionData ?? []) {
    const field = String(entry?.field ?? '').trim()
    const value = String(entry?.value ?? '').trim()
    if (!field || !value) continue

    const mapped = explicit.get(field)
    const target: GhlTarget | null = mapped?.target ?? guessTarget(field, value)

    if (target === 'ignore') continue

    if (target === 'custom') {
      const key = mapped?.customKey?.trim()
      // Sem chave definida o GHL rejeitaria o upsert inteiro; guarda na nota.
      if (key) customFields.push({ key, field_value: value })
      else leftovers.push({ label: field, value })
      continue
    }

    if (target === 'name') {
      const { firstName, lastName } = splitName(value)
      if (firstName && !contact.firstName) contact.firstName = firstName
      if (lastName && !contact.lastName) contact.lastName = lastName
      if (!contact.name) contact.name = value
      continue
    }

    if (target === 'phone') {
      const phone = toE164(value)
      if (phone && !contact.phone) contact.phone = phone
      else if (!phone) leftovers.push({ label: field, value })
      continue
    }

    if (target === 'email') {
      if (isEmail(value) && !contact.email) contact.email = value
      else if (!isEmail(value)) leftovers.push({ label: field, value })
      continue
    }

    if (target && !contact[target]) {
      contact[target] = value
      continue
    }

    // Mensagem, consentimento, campos livres: preservados na nota.
    leftovers.push({ label: field, value })
  }

  if (customFields.length > 0) contact.customFields = customFields

  const tags = (config.tags ?? [])
    .map((t) => t?.tag?.trim())
    .filter((t): t is string => Boolean(t))
  if (tags.length > 0) contact.tags = tags

  if (config.source?.trim()) contact.source = config.source.trim()

  return { contact, leftovers }
}

/* ------------------------------------------------------------------ */
/* Transporte                                                          */
/* ------------------------------------------------------------------ */

const request = async (
  path: string,
  token: string,
  body: unknown,
): Promise<{ status: number; json: any; text: string }> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(API + path, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: API_VERSION,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const text = await res.text()
    let json: any = null
    try {
      json = JSON.parse(text)
    } catch {}
    return { status: res.status, json, text }
  } finally {
    clearTimeout(timer)
  }
}

/** Uma retentativa para erros transitórios; 4xx de escopo/validação não repete. */
const shouldRetry = (status: number): boolean => status === 429 || status >= 500

const describe = (status: number, json: any, text: string): string => {
  const msg = json?.message ?? json?.error ?? text
  const flat = typeof msg === 'string' ? msg : JSON.stringify(msg)
  if (status === 401) {
    return `401 sem escopo: o token precisa de contacts.write habilitado no GHL (${flat})`
  }
  return `${status}: ${(flat || '').slice(0, 300)}`
}

export const sendToGhl = async (
  submissionData: SubmissionEntry[],
  config: GhlFormConfig,
  opts: { token: string; locationId: string; noteTitle?: string },
): Promise<GhlResult> => {
  const { contact, leftovers } = buildContact(submissionData, config, opts.locationId)

  // Sem e-mail nem telefone o GHL não consegue deduplicar nem contatar.
  if (!contact.email && !contact.phone) {
    return { ok: false, error: 'submissão sem e-mail nem telefone válidos' }
  }

  let res = await request('/contacts/upsert', opts.token, contact)
  if (shouldRetry(res.status)) {
    await new Promise((r) => setTimeout(r, 600))
    res = await request('/contacts/upsert', opts.token, contact)
  }

  if (res.status < 200 || res.status >= 300) {
    return { ok: false, error: describe(res.status, res.json, res.text), status: res.status }
  }

  const contactId: string | undefined = res.json?.contact?.id ?? res.json?.id
  if (!contactId) {
    return { ok: false, error: 'upsert respondeu 2xx mas sem id de contato' }
  }

  // A nota carrega a resposta completa — inclusive a mensagem livre, que não
  // tem campo equivalente no contato do GHL.
  let noteCreated = false
  if (leftovers.length > 0) {
    const corpo = [
      opts.noteTitle ?? 'Formulário do site',
      '',
      ...leftovers.map((l) => `${l.label}: ${l.value}`),
    ].join('\n')

    const note = await request(`/contacts/${contactId}/notes`, opts.token, { body: corpo })
    noteCreated = note.status >= 200 && note.status < 300
  }

  return { ok: true, contactId, noteCreated }
}
