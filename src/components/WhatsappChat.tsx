'use client'

import React, { useEffect, useState } from 'react'

/**
 * Chat do CRM (GoHighLevel / LeadConnector), carregado pelo GTM.
 *
 * Os botões de WhatsApp do site apontam para /whatsapp. Com o chat já
 * carregado, o clique abre o chat na própria página; sem ele (GTM bloqueado ou
 * ainda carregando), o link segue para /whatsapp, que tenta abrir o chat e,
 * se não conseguir, oferece o WhatsApp direto — ninguém fica sem atendimento.
 */
type ChatApi = { openWidget?: () => void }

const chatApi = (): ChatApi | undefined =>
  (window as unknown as { leadConnector?: { chatWidget?: ChatApi } }).leadConnector?.chatWidget

const abrirChat = (): boolean => {
  const chat = chatApi()
  if (typeof chat?.openWidget !== 'function') return false
  try {
    chat.openWidget()
    return true
  } catch {
    return false
  }
}

const ehLinkDoWhatsapp = (a: HTMLAnchorElement): boolean => {
  if (a.origin !== window.location.origin) return false
  return a.pathname.replace(/\/+$/, '') === '/whatsapp'
}

/** Um único ouvinte no documento: vale para todo botão de WhatsApp do site. */
export const WhatsappChatLinks = () => {
  useEffect(() => {
    const aoClicar = (evento: MouseEvent) => {
      if (evento.defaultPrevented || evento.button !== 0) return
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
      const link = (evento.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!link || !ehLinkDoWhatsapp(link)) return
      if (abrirChat()) evento.preventDefault()
    }
    document.addEventListener('click', aoClicar)
    return () => document.removeEventListener('click', aoClicar)
  }, [])

  return null
}

/** Depois disso a página para de procurar o chat. */
const DESISTE_EM = 30000

/**
 * Página /whatsapp: fica em branco e abre o chat assim que ele carrega. Se o
 * chat não aparecer no prazo, mostra o botão do WhatsApp direto — e continua
 * tentando por mais um tempo, para a conexão lenta.
 */
export const WhatsappChatOpener = ({
  children,
  prazo = 6000,
}: {
  /** O que aparece se o chat não abrir no prazo. */
  children: React.ReactNode
  prazo?: number
}) => {
  const [semChat, setSemChat] = useState(false)

  useEffect(() => {
    const inicio = Date.now()
    const timer = window.setInterval(() => {
      if (abrirChat()) {
        // o chat pode chegar depois do aviso: abre do mesmo jeito e tira o aviso
        window.clearInterval(timer)
        setSemChat(false)
        return
      }
      const espera = Date.now() - inicio
      if (espera >= prazo) setSemChat(true)
      if (espera >= DESISTE_EM) window.clearInterval(timer)
    }, 300)
    return () => window.clearInterval(timer)
  }, [prazo])

  if (!semChat) return null
  return <div className="wa-redirect__box">{children}</div>
}
