import type { SelectField } from 'payload'

/**
 * Ícones do sprite SVG do site.
 *
 * O sprite é fixo no layout (src/components/Icons.tsx) — o editor escolhe qual
 * usar, mas não desenha um novo. Ícone novo é mudança de código, e é assim que
 * o design system continua governando.
 */
export const ICON_OPTIONS = [
  { label: 'Café / xícara', value: 'i-coffee' },
  { label: 'Wi-Fi', value: 'i-wifi' },
  { label: 'Estacionamento', value: 'i-parking' },
  { label: 'Pet', value: 'i-paw' },
  { label: 'Cartão / parcelamento', value: 'i-card' },
  { label: 'WhatsApp', value: 'i-wa' },
  { label: 'Cama', value: 'i-bed' },
  { label: 'Ar-condicionado', value: 'i-ac' },
  { label: 'TV', value: 'i-tv' },
  { label: 'Mesa de trabalho', value: 'i-desk' },
  { label: 'Secador de cabelo', value: 'i-dryer' },
  { label: 'Banheiro', value: 'i-bath' },
  { label: 'Frigobar', value: 'i-minibar' },
  { label: 'Telefone', value: 'i-phone' },
  { label: 'E-mail', value: 'i-mail' },
  { label: 'Localização', value: 'i-pin' },
  { label: 'Estrela', value: 'i-star' },
  { label: 'Etiqueta', value: 'i-tag' },
  { label: 'Promoção (etiqueta com %)', value: 'i-promo' },
  { label: 'Calendário', value: 'i-cal' },
  { label: 'Piscina', value: 'i-pool' },
  { label: 'Carregador elétrico', value: 'i-ev' },
  { label: 'Limpeza', value: 'i-clean' },
  { label: 'Ventilador', value: 'i-fan' },
  { label: 'Instagram', value: 'i-ig' },
  { label: 'Facebook', value: 'i-fb' },
] as const

/**
 * Fábrica em vez de objeto solto: espalhar um `Field` (que é uma união de
 * todos os tipos de campo) dentro de outra lista faz o TS tentar casar Group
 * com Array e o build quebra. Devolvendo um SelectField concreto, a inferência
 * continua estreita.
 */
type IconFieldOptions = {
  width?: string
  description?: string
  condition?: (data: any, siblingData: any) => boolean
}

export const iconField = (overrides: IconFieldOptions = {}): SelectField => ({
  name: 'icon',
  label: 'Ícone',
  type: 'select',
  options: ICON_OPTIONS as unknown as { label: string; value: string }[],
  admin: {
    description: overrides.description ?? 'Do sprite do site.',
    ...(overrides.width ? { width: overrides.width } : {}),
    ...(overrides.condition ? { condition: overrides.condition } : {}),
  },
})
