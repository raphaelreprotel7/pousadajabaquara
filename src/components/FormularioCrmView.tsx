import React from 'react'

import { type FormularioCrm } from '@/utilities/formularios-crm'
import { FormularioCrmSeguro } from './FormularioCrmSeguro'

type Props = {
  form: FormularioCrm
  /** Mesmas variantes do PayloadForm, para o CSS tratar cada contexto. */
  variant: 'news' | 'contact' | 'popup'
}

/**
 * Monta o iframe como texto, e não como JSX, de propósito — veja abaixo.
 *
 * Os atributos `data-*` são os do código de incorporação e não são
 * decorativos: é por eles que o `form_embed.js` acha o iframe, controla quando
 * mostrá-lo e ajusta a altura.
 */
const marcacao = (form: FormularioCrm) => `
  <iframe
    src="https://api.reprotel.com.br/widget/form/${form.id}"
    id="inline-${form.id}"
    title="${form.nome}"
    style="width:100%;height:${form.altura}px;border:none"
    data-layout="{'id':'INLINE'}"
    data-trigger-type="alwaysShow"
    data-trigger-value=""
    data-activation-type="alwaysActivated"
    data-activation-value=""
    data-deactivation-type="neverDeactivate"
    data-deactivation-value=""
    data-form-name="${form.nome}"
    data-height="${form.altura}"
    data-layout-iframe-id="inline-${form.id}"
    data-form-id="${form.id}"
    data-cookie-consent="true"
    data-cookie-consent-provider="auto"
  ></iframe>
`

/**
 * Formulário hospedado no CRM, embutido por iframe.
 *
 * Substitui o formulário nativo onde existe um equivalente no CRM: a submissão
 * passa a ir direto para lá, sem escalar em /api/form-submissions nem depender
 * do `ghlForwarder`. Em troca, o conteúdo do formulário deixa de ser editável
 * no admin do site e passa a ser editado no CRM.
 *
 * Duas exigências do `form_embed.js` moldam este componente, e as duas vêm do
 * mesmo fato: quem manda no iframe é ele, não o React.
 *
 * A primeira é ordem. O script esconde o iframe até o formulário avisar que
 * carregou, e esse aviso só chega uma vez. Se o script carregar depois do
 * iframe, perde o aviso e o formulário fica invisível para sempre — por isso
 * ele é carregado no layout, com `beforeInteractive`, antes de qualquer
 * iframe existir. Era essa corrida que escondia o formulário de contato.
 *
 * A segunda é posse do DOM. Assim que o documento carrega, o script embrulha
 * o iframe em divs próprias e lhe acrescenta atributos — tudo isso antes da
 * hidratação. O React, ao hidratar, veria uma árvore diferente da que gerou,
 * refaria o trecho e desmontaria o trabalho do script, recarregando o
 * formulário. O `dangerouslySetInnerHTML` resolve: o React entrega esse HTML
 * e não volta a olhar para dentro dele. Não há dado de usuário aqui — a
 * marcação é montada a partir do catálogo de formulários do próprio código.
 */
export const FormularioCrmView = ({ form, variant }: Props) => (
  <>
    <div
      className={`form-crm form-crm--${variant}`}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: marcacao(form) }}
    />
    <FormularioCrmSeguro id={form.id} />
  </>
)
