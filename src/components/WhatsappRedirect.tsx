'use client'

import { useEffect } from 'react'

/**
 * Abre o WhatsApp depois de alguns segundos na página de passagem.
 *
 * Um redirect direto do servidor não carregaria o GTM, e as tags que olham a
 * URL (/whatsapp-crm-facebook, -google, -organico) não disparariam. A espera
 * dá tempo para o GTM registrar a origem antes de sair do site.
 */
export const WhatsappRedirect = ({ href, delay = 3000 }: { href: string; delay?: number }) => {
  useEffect(() => {
    const timer = window.setTimeout(() => window.location.replace(href), delay)
    return () => window.clearTimeout(timer)
  }, [href, delay])

  return null
}
