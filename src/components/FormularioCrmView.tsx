import React from 'react'
import Script from 'next/script'

import { SCRIPT_CRM, type FormularioCrm } from '@/utilities/formularios-crm'

type Props = {
  form: FormularioCrm
  /** Mesmas variantes do PayloadForm, para o CSS tratar cada contexto. */
  variant: 'news' | 'contact' | 'popup'
}

/**
 * Formulário hospedado no CRM, embutido por iframe.
 *
 * Substitui o formulário nativo onde existe um equivalente no CRM: a submissão
 * passa a ir direto para lá, sem escalar em /api/form-submissions nem depender
 * do `ghlForwarder`. Em troca, o conteúdo do formulário deixa de ser editável
 * no admin do site e passa a ser editado no CRM.
 *
 * O `form_embed.js` é carregado com `id` fixo: o Next deduplica por id, então
 * duas instâncias na mesma página (newsletter no rodapé e formulário no corpo)
 * não baixam o script duas vezes.
 *
 * Os atributos `data-*` são os do código de incorporação e não são decorativos
 * — é por eles que o script acha o iframe e ajusta a altura.
 */
export const FormularioCrmView = ({ form, variant }: Props) => (
  <div className={`form-crm form-crm--${variant}`}>
    <iframe
      src={`https://api.reprotel.com.br/widget/form/${form.id}`}
      id={`inline-${form.id}`}
      title={form.nome}
      style={{ width: '100%', height: `${form.altura}px`, border: 'none' }}
      data-layout="{'id':'INLINE'}"
      data-trigger-type="alwaysShow"
      data-trigger-value=""
      data-activation-type="alwaysActivated"
      data-activation-value=""
      data-deactivation-type="neverDeactivate"
      data-deactivation-value=""
      data-form-name={form.nome}
      data-height={form.altura}
      data-layout-iframe-id={`inline-${form.id}`}
      data-form-id={form.id}
      data-cookie-consent="true"
      data-cookie-consent-provider="auto"
    />
    <Script id="crm-form-embed" src={SCRIPT_CRM} strategy="afterInteractive" />
  </div>
)
