import React from 'react'

/**
 * Sprite SVG do site — cópia exata do HTML estático.
 *
 * Fica no topo do <body> e é referenciado por <use href="#i-…" />. Ícone novo
 * se adiciona aqui e vira opção no admin em src/fields/icon.ts.
 */
export const IconSprite = () => (
  <svg className="sprite" aria-hidden="true" focusable="false">
    <defs>
      <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 2l3 6.6 7 .8-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.8L12 2Z"/></symbol>
      <symbol id="i-ig" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 1.85A3.95 3.95 0 0 0 3.85 7.8v8.4a3.95 3.95 0 0 0 3.95 3.95h8.4a3.95 3.95 0 0 0 3.95-3.95V7.8a3.95 3.95 0 0 0-3.95-3.95H7.8ZM12 7.05a4.95 4.95 0 1 1 0 9.9 4.95 4.95 0 0 1 0-9.9Zm0 1.85a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2ZM17.35 5.45a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"/></symbol>
      <symbol id="i-pool" viewBox="0 0 24 24"><path d="M7 2.5h2v11H7v-11Zm8 0h2v11h-2v-11Zm-8 3h8v2H7v-2Zm0 4h8v2H7v-2Z"/><path d="M2 17.4c1.7 0 2.1-1.1 3.7-1.1s2 1.1 3.7 1.1 2.1-1.1 3.7-1.1 2 1.1 3.7 1.1 2.1-1.1 3.7-1.1v2.1c-1.7 0-2.1 1.1-3.7 1.1s-2-1.1-3.7-1.1-2.1 1.1-3.7 1.1-2-1.1-3.7-1.1-2.1 1.1-3.7 1.1v-2.1Z"/></symbol><symbol id="i-ev" viewBox="0 0 24 24"><path d="M6.5 2h8A2.5 2.5 0 0 1 17 4.5v15A2.5 2.5 0 0 1 14.5 22h-8A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Zm0 2a.5.5 0 0 0-.5.5v15c0 .28.22.5.5.5h8a.5.5 0 0 0 .5-.5v-15a.5.5 0 0 0-.5-.5h-8Z"/><path d="M11.6 5.6 7.4 12.4H10l-.7 5.6 4.3-7h-2.7l.7-5.4Z"/></symbol><symbol id="i-clean" viewBox="0 0 24 24"><path d="M12 2.2l1.7 4.7 4.6 1.7-4.6 1.7L12 15l-1.7-4.7-4.6-1.7 4.6-1.7L12 2.2Z"/><path d="M18.4 12.6l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9.9-2.5Z"/><path d="M5.4 14.2l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/></symbol><symbol id="i-fan" viewBox="0 0 24 24"><path d="M12 10.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z"/><path d="M12.9 2.1c2.3.3 4 1.7 4 3.3 0 1.6-1.9 2.7-4 3.3V2.1Zm-1.8 19.8c-2.3-.3-4-1.7-4-3.3 0-1.6 1.9-2.7 4-3.3v6.6Z"/><path d="M21.9 12.9c-.3 2.3-1.7 4-3.3 4-1.6 0-2.7-1.9-3.3-4h6.6ZM2.1 11.1c.3-2.3 1.7-4 3.3-4 1.6 0 2.7 1.9 3.3 4H2.1Z"/></symbol><symbol id="i-fb" viewBox="0 0 24 24"><path d="M13.5 21v-8h2.8l.4-3.2h-3.2V7.7c0-.9.3-1.6 1.6-1.6h1.7V3.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3V13h2.8v8h3.4Z"/></symbol>
      <symbol id="i-phone" viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.5 3 2.9 3.4 2.5 4 2.5h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.2 2.3Z"/></symbol>
      <symbol id="i-mail" viewBox="0 0 24 24"><path d="M3 5h18v14H3V5Zm2 2v.4l7 4.6 7-4.6V7H5Zm0 2.9V17h14V9.9l-7 4.6-7-4.6Z"/></symbol>
      <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></symbol>
      <symbol id="i-wa" viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.15-1.75-.86-2-.96-.27-.1-.47-.15-.66.15-.2.3-.76.95-.93 1.15-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.66-1.6-.9-2.2-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.5.07-.77.37-.26.3-1 .98-1 2.4s1.03 2.78 1.17 2.98c.15.2 2.02 3.1 4.9 4.35.68.3 1.22.47 1.64.6.69.22 1.31.19 1.8.11.55-.08 1.75-.71 2-1.4.25-.7.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35ZM12.05 2C6.5 2 2 6.5 2 12.05c0 1.78.47 3.45 1.28 4.9L2 22l5.2-1.36a10 10 0 0 0 4.85 1.24h.01c5.54 0 10.04-4.5 10.04-10.05C22.1 6.5 17.6 2 12.05 2Zm0 18.1c-1.6 0-3.08-.43-4.36-1.18l-.31-.19-3.24.85.86-3.16-.2-.32a8.3 8.3 0 0 1-1.27-4.44 8.35 8.35 0 1 1 8.52 8.44Z"/></symbol>
      <symbol id="i-tag" viewBox="0 0 24 24"><path d="M21 11.5 12.5 3H4v8.5L12.5 20 21 11.5ZM7.5 9A1.5 1.5 0 1 1 9 7.5 1.5 1.5 0 0 1 7.5 9Z"/></symbol>
      {/* Promoção: a etiqueta de preço com o "%" vazado. A etiqueta sozinha
          (i-tag) serve para qualquer marcador; esta diz desconto. */}
      <symbol id="i-promo" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M21.41 11.58 12.41 2.58A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 .59 1.42l9 9a2 2 0 0 0 2.83 0l7-7a2 2 0 0 0 0-2.84ZM9.6 10.85a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5M14.4 15.65a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5M15.56 9.36 14.64 8.44 8.44 14.64l.92.92Z"/></symbol>
      <symbol id="i-cal" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V10h14v10Z"/></symbol>
      <symbol id="i-bed" viewBox="0 0 24 24"><path d="M3 5h2v9h14v-4a3 3 0 0 0-3-3h-5v7H9V5H3Zm0 11h18v3h-2v-1H5v1H3v-3Zm4.5-8A1.75 1.75 0 1 1 7.5 11.5 1.75 1.75 0 0 1 7.5 8Z"/></symbol>
      <symbol id="i-wifi" viewBox="0 0 24 24"><path d="M12 18.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Zm0-4.6c-1.5 0-2.9.6-3.9 1.6l1.6 1.6a3.2 3.2 0 0 1 4.6 0l1.6-1.6a5.5 5.5 0 0 0-3.9-1.6Zm0-4.4a10 10 0 0 0-7.1 2.9l1.6 1.6a7.8 7.8 0 0 1 11 0l1.6-1.6A10 10 0 0 0 12 9.5Zm0-4.4a14.4 14.4 0 0 0-10.2 4.2l1.6 1.6a12.1 12.1 0 0 1 17.2 0l1.6-1.6A14.4 14.4 0 0 0 12 5.1Z"/></symbol>
      <symbol id="i-desk" viewBox="0 0 24 24"><path d="M2 5h20v2H2V5Zm2 4h2v10H4V9Zm14 0h2v10h-2V9ZM7 9h10v2H7V9Zm0 4h6v2H7v-2Z"/></symbol>
      <symbol id="i-dryer" viewBox="0 0 24 24"><path d="M4 4h10a5 5 0 0 1 0 10h-1.2l1.6 6H11l-1.6-6H8v4H6v-4H4a5 5 0 0 1 0-10Zm10 2.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Z"/></symbol>
      <symbol id="i-bath" viewBox="0 0 24 24"><path d="M6 2a3 3 0 0 0-3 3v7H2v2h1v3a3 3 0 0 0 2 2.83V21h2v-1h10v1h2v-1.17A3 3 0 0 0 21 17v-3h1v-2H9V5a1 1 0 0 1 2 0v1h2V5a3 3 0 0 0-3-3H6Z"/></symbol>
      <symbol id="i-minibar" viewBox="0 0 24 24"><path fillRule="evenodd" d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v6h10V4H7Zm0 8v8h10v-8H7Z"/><path d="M9 6h2v2H9V6Zm0 8h2v3H9v-3Z"/></symbol>
      <symbol id="i-tv" viewBox="0 0 24 24"><path d="M3 4h18v13H3V4Zm2 2v9h14V6H5Zm3 13h8v2H8v-2Z"/></symbol>
      <symbol id="i-ac" viewBox="0 0 24 24"><path d="M3 4h18v8H3V4Zm2 2v4h14V6H5Zm1 9h3v2H6v-2Zm4.5 0h3v2h-3v-2ZM15 15h3v2h-3v-2ZM6 18.5h3v2H6v-2Zm9 0h3v2h-3v-2Z"/></symbol>
      <symbol id="i-coffee" viewBox="0 0 24 24"><path d="M3 4h14v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V4Zm14 1.8h2.4a2.6 2.6 0 0 1 0 5.2H17V5.8Zm0 1.8v1.6h2.4a.8.8 0 0 0 0-1.6H17ZM2 19h16v2H2v-2Z"/></symbol>
      <symbol id="i-parking" viewBox="0 0 24 24"><path d="M4 2h16v20H4V2Zm4 4v12h2.7v-4H14a4 4 0 0 0 0-8H8Zm2.7 2.2H14a1.8 1.8 0 0 1 0 3.6h-3.3V8.2Z"/></symbol>
      <symbol id="i-paw" viewBox="0 0 24 24"><circle cx="6.6" cy="7" r="2.4"/><circle cx="17.4" cy="7" r="2.4"/><circle cx="3.2" cy="13" r="2.1"/><circle cx="20.8" cy="13" r="2.1"/><path d="M12 10.4c2.8 0 5.7 2.9 5.7 5.7 0 2.1-1.5 3.4-3.5 3.4-1 0-1.6-.4-2.2-.4s-1.2.4-2.2.4c-2 0-3.5-1.3-3.5-3.4 0-2.8 2.9-5.7 5.7-5.7Z"/></symbol>
      <symbol id="i-card" viewBox="0 0 24 24"><path d="M2 5h20v14H2V5Zm2 2v2h16V7H4Zm0 5v5h16v-5H4Zm2 2h6v1.6H6V14Z"/></symbol>
    </defs>
  </svg>
)

/** Uso: <Icon name="i-wa" className="perk__icon" /> */
export const Icon = ({ name, className }: { name?: string | null; className?: string }) => {
  if (!name) return null
  return (
    <svg className={className}>
      <use href={`#${name}`} />
    </svg>
  )
}
