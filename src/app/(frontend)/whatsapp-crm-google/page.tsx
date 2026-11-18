import { WhatsappCrmPage, whatsappCrmMetadata } from '@/components/WhatsappCrmPage'

export const metadata = whatsappCrmMetadata

/** O número vem de Configurações do site; revalida para pegar uma troca. */
export const revalidate = 3600

export default function Page() {
  return <WhatsappCrmPage origem="google" />
}
