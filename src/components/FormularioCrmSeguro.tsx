'use client'

import { useEffect } from 'react'

/**
 * Rede de segurança do formulário do CRM.
 *
 * O `form_embed.js` começa escondendo o iframe e só o mostra quando recebe o
 * aviso de pronto que o formulário manda ao terminar de carregar. Esse aviso
 * acontece uma vez: se o formulário carregar antes de o script estar ouvindo,
 * ninguém mostra o iframe e a página fica com um buraco no lugar do
 * formulário. O script foi adiantado para o começo do HTML justamente para
 * vencer essa corrida, mas ela depende da rede de quem acessa, e perder
 * significa um lead a menos — barato demais não ter um plano B.
 *
 * Então: passados alguns segundos, se o iframe continuar escondido, mostramos
 * nós mesmos. O formulário aparece com a altura reservada em vez da altura
 * medida — sobra espaço embaixo, mas ele funciona. Quando o script faz o seu
 * trabalho, não há nada a fazer aqui e este componente não toca em nada.
 */
export const FormularioCrmSeguro = ({ id }: { id: string }) => {
  useEffect(() => {
    const prazo = window.setTimeout(() => {
      const iframe = document.getElementById(`inline-${id}`)
      if (!iframe || getComputedStyle(iframe).visibility !== 'hidden') return
      Object.assign(iframe.style, {
        opacity: '1',
        visibility: 'visible',
        pointerEvents: 'auto',
        position: 'static',
        left: 'auto',
      })
    }, 4000)
    return () => window.clearTimeout(prazo)
  }, [id])

  return null
}
