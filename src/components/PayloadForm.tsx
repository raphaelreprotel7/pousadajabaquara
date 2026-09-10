'use client'

import React, { useState } from 'react'

type FormField = {
  name: string
  label?: string
  blockType: string
  required?: boolean
  placeholder?: string
  defaultValue?: unknown
}

export type PayloadFormDoc = {
  id: string | number
  fields?: FormField[]
  submitButtonLabel?: string
  confirmationType?: 'message' | 'redirect'
  redirect?: { url?: string }
  confirmationMessage?: unknown
}

type Props = {
  form: PayloadFormDoc
  /** Variante do botao de envio, do sistema de botoes. Padrao: verde. */
  botao?: 'btn--red' | 'btn--ambar'
  /** 'news' = newsletter, 'contact' = página de contato, 'popup' = dentro do pop-up. */
  variant: 'news' | 'contact' | 'popup'
  consentText?: string | null
  /** Chamado após gravar, antes do redirect. Usado pelo pop-up para não voltar. */
  onSuccess?: () => void
}

/**
 * Envia para /api/form-submissions — endpoint do plugin form-builder.
 *
 * O redirecionamento de sucesso vem do próprio formulário (confirmationType
 * "redirect"), então quem edita no admin controla para onde a pessoa vai
 * depois de enviar, sem passar por código.
 */
export const PayloadForm = ({ form, variant, consentText, onSuccess, botao = 'btn--red' }: Props) => {
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const fields = (form.fields ?? []).filter((f) => f.blockType !== 'message')

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState('sending')
    setMessage(null)

    const data = new FormData(event.currentTarget)
    const submissionData = fields.map((field) => ({
      field: field.name,
      value: String(data.get(field.name) ?? ''),
    }))

    try {
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: form.id, submissionData }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      onSuccess?.()

      const destino = form.redirect?.url
      if (form.confirmationType === 'redirect' && destino) {
        window.location.href = destino
        return
      }

      setState('idle')
      setMessage('Recebemos seus dados. Obrigado!')
      event.currentTarget.reset()
    } catch {
      setState('error')
      setMessage('Não foi possível enviar agora. Tente novamente em instantes.')
    }
  }

  /* --------------------------- NEWSLETTER --------------------------- */
  if (variant === 'news') {
    return (
      <form className="news__form" onSubmit={onSubmit}>
        <div className="news__row">
          {fields.slice(0, 3).map((field) => (
            <input
              key={field.name}
              name={field.name}
              type={field.blockType === 'email' ? 'email' : field.blockType === 'number' ? 'tel' : 'text'}
              placeholder={field.label ?? field.name}
              aria-label={field.label ?? field.name}
              required={field.required}
            />
          ))}
        </div>
        {consentText ? (
          <label className="news__check">
            <input type="checkbox" required />
            <span>{consentText}</span>
          </label>
        ) : null}
        <button type="submit" className={`btn ${botao} btn--block`} disabled={state === 'sending'}>
          {state === 'sending' ? 'Enviando…' : (form.submitButtonLabel ?? 'Cadastrar')}
        </button>
        {message ? (
          <p className="news__sub" style={{ margin: '4px 0 0' }} role="status">
            {message}
          </p>
        ) : null}
      </form>
    )
  }

  /* ------------------------- DENTRO DO POP-UP ----------------------- */
  if (variant === 'popup') {
    return (
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
        {fields.map((field) => (
          <div className="field" key={field.name}>
            <label htmlFor={`p-${field.name}`}>{field.label ?? field.name}</label>
            {field.blockType === 'textarea' ? (
              <textarea id={`p-${field.name}`} name={field.name} required={field.required} />
            ) : (
              <input
                id={`p-${field.name}`}
                name={field.name}
                type={field.blockType === 'email' ? 'email' : 'text'}
                required={field.required}
              />
            )}
          </div>
        ))}
        {consentText ? (
          <label className="consent">
            <input type="checkbox" required />
            <span>{consentText}</span>
          </label>
        ) : null}
        <button type="submit" className={`btn ${botao} btn--block`} disabled={state === 'sending'}>
          {state === 'sending' ? 'Enviando…' : (form.submitButtonLabel ?? 'Enviar')}
        </button>
        {message ? (
          <p className="popup__text" style={{ margin: 0 }} role="status">
            {message}
          </p>
        ) : null}
      </form>
    )
  }

  /* ---------------------------- CONTATO ----------------------------- */
  return (
    <form className="cform" onSubmit={onSubmit}>
      {fields.map((field) => {
        const isTextarea = field.blockType === 'textarea'
        return (
          <div
            className={`field${isTextarea ? ' field--full' : ''}`}
            key={field.name}
          >
            <label htmlFor={field.name}>{field.label ?? field.name}</label>
            {isTextarea ? (
              <textarea id={field.name} name={field.name} required={field.required} />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.blockType === 'email' ? 'email' : 'text'}
                required={field.required}
              />
            )}
          </div>
        )
      })}

      {consentText ? (
        <label className="consent">
          <input type="checkbox" />
          <span>{consentText}</span>
        </label>
      ) : null}

      <div className="field--full">
        <button type="submit" className="btn btn--red" disabled={state === 'sending'}>
          {state === 'sending' ? 'Enviando…' : (form.submitButtonLabel ?? 'Enviar')}
        </button>
        {message ? (
          <p className="body-text" style={{ margin: '16px 0 0' }} role="status">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  )
}
