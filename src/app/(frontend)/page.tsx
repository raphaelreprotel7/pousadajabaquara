import type { Metadata } from 'next'

import { PageView, buildMetadata } from './PageView'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('home', 'pt-BR')
}

export default async function HomePage() {
  return <PageView slug="home" locale="pt-BR" />
}
