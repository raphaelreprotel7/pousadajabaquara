'use client'

import React, { useState } from 'react'

type Tab = { id: string; label: string; content: React.ReactNode }

/** Abas do regulamento. Mantém o conteúdo editorial no Payload e só controla a UI. */
export const PromotionTabs = ({ tabs }: { tabs: Tab[] }) => {
  const available = tabs.filter((tab) => Boolean(tab.content))
  const [active, setActive] = useState(available[0]?.id ?? '')

  if (!available.length) return null

  return (
    <div className="promo-rules__tabs">
      <div className="promo-rules__tablist" role="tablist">
        {available.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={active === tab.id ? 'is-active' : undefined}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {available.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          hidden={active !== tab.id}
          className="promo-rules__panel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
