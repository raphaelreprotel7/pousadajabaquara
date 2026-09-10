import type { CollectionAfterChangeHook } from 'payload'

import { sendToGhl, type GhlFormConfig, type SubmissionEntry } from '@/utilities/ghl'

/**
 * Encaminha a submissão para o GoHighLevel depois de ela estar gravada.
 *
 * Ordem importa: o plugin roda os hooks de `afterChange` só após persistir a
 * submissão, então o registro no Payload nunca depende do CRM estar de pé.
 * Este hook também não lança — se o GHL falhar, o visitante continua vendo a
 * confirmação e a falha fica registrada na própria submissão.
 *
 * O envio é aguardado (e não disparado em background) porque em serverless a
 * função é encerrada assim que a resposta sai; um fetch solto seria morto no
 * meio. O cliente tem timeout de 8s para isso não travar o formulário.
 */
export const forwardSubmissionToGhl: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const { payload } = req

  const marcar = async (patch: Record<string, unknown>) => {
    try {
      await payload.update({
        collection: 'form-submissions',
        id: doc.id,
        data: patch,
        // Evita reentrar neste hook e disparar os e-mails do plugin de novo.
        context: { skipGhl: true },
        depth: 0,
        overrideAccess: true,
      })
    } catch (e) {
      payload.logger.error(`[GHL] não consegui gravar o status na submissão ${doc.id}: ${e}`)
    }
  }

  try {
    const token = process.env.GHL_API_TOKEN
    if (!token) {
      payload.logger.warn('[GHL] GHL_API_TOKEN ausente — submissão salva, envio ao CRM ignorado')
      await marcar({ ghlStatus: 'skipped', ghlError: 'GHL_API_TOKEN não configurado' })
      return doc
    }

    // `form` vem como id ou como documento, dependendo da profundidade.
    const formId =
      typeof doc.form === 'object' && doc.form !== null ? (doc.form as any).id : doc.form
    if (!formId) return doc

    const form = (await payload.findByID({
      collection: 'forms',
      id: formId,
      depth: 0,
      overrideAccess: true,
    })) as { title?: string; ghl?: GhlFormConfig } | null

    const config: GhlFormConfig = form?.ghl ?? {}

    if (config.enabled === false) {
      await marcar({ ghlStatus: 'skipped' })
      return doc
    }

    const locationId = config.locationId?.trim() || process.env.GHL_LOCATION_ID
    if (!locationId) {
      await marcar({
        ghlStatus: 'failed',
        ghlError: 'nenhuma location definida (GHL_LOCATION_ID ou campo do formulário)',
      })
      return doc
    }

    const result = await sendToGhl(
      (doc.submissionData ?? []) as SubmissionEntry[],
      config,
      {
        token,
        locationId,
        noteTitle: `Formulário do site: ${form?.title ?? 'sem título'}`,
      },
    )

    if (result.ok) {
      payload.logger.info(`[GHL] submissão ${doc.id} -> contato ${result.contactId}`)
      await marcar({ ghlStatus: 'sent', ghlContactId: result.contactId, ghlError: null })
    } else {
      payload.logger.error(`[GHL] submissão ${doc.id} falhou — ${result.error}`)
      await marcar({ ghlStatus: 'failed', ghlError: result.error.slice(0, 500) })
    }
  } catch (e) {
    // Rede fora, timeout, JSON inesperado: nada disso pode virar erro 500 no
    // formulário do site.
    payload.logger.error(`[GHL] erro inesperado na submissão ${doc.id}: ${e}`)
    await marcar({ ghlStatus: 'failed', ghlError: String(e).slice(0, 500) })
  }

  return doc
}
