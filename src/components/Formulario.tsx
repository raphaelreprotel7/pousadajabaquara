import React from 'react'

import { PayloadForm, type PayloadFormDoc } from './PayloadForm'
import { FormularioCrmView } from './FormularioCrmView'
import { formularioCrm } from '@/utilities/formularios-crm'

type Props = {
  form: PayloadFormDoc
  variant: 'news' | 'contact' | 'popup'
  consentText?: string | null
  botao?: 'btn--red' | 'btn--ambar'
  onSuccess?: () => void
}

/**
 * Escolhe quem serve o formulário: o CRM ou o Payload.
 *
 * Existe para que os três pontos de uso — bloco de formulário, newsletter e
 * pop-up — não repitam essa decisão, e para que ligar um novo formulário do
 * CRM seja uma linha em utilities/formularios-crm.ts, sem tocar em componente.
 *
 * O `onSuccess` só vale no formulário nativo: o do CRM roda dentro de um
 * iframe de outro domínio, e daqui não há como saber que ele foi enviado. Hoje
 * isso só afeta o pop-up, que o usa para marcar conversão — e nenhum pop-up
 * usa formulário do CRM. Se algum passar a usar, a contagem terá de vir do
 * GTM, que já está na página.
 */
export const Formulario = ({ form, variant, consentText, botao, onSuccess }: Props) => {
  const crm = formularioCrm(form?.title)
  if (crm) return <FormularioCrmView form={crm} variant={variant} />

  return (
    <PayloadForm
      form={form}
      variant={variant}
      consentText={consentText}
      botao={botao}
      onSuccess={onSuccess}
    />
  )
}

export type { PayloadFormDoc }
