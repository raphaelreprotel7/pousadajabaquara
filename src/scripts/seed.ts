import './env'
import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Seed mínimo: o que as páginas de obrigado precisam para funcionar.
 *
 * Cria os dois formulários (newsletter e contato) já com redirect para as
 * páginas de confirmação, as duas páginas em si, e preenche os globals com os
 * defaults — sem isso o cabeçalho e o rodapé sobem vazios.
 *
 * Idempotente: rodar de novo atualiza em vez de duplicar.
 */

const texto = (valor: string) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        children: [{ type: 'text', text: valor, version: 1, detail: 0, format: 0, mode: 'normal', style: '' }],
      },
    ],
  },
})

const run = async () => {
  const payload = await getPayload({ config })

  /** Cria ou atualiza pelo título/slug, para o script poder rodar mais de uma vez. */
  const upsert = async (collection: any, where: any, data: any) => {
    const existing = await payload.find({ collection, where, limit: 1, depth: 0 })
    if (existing.docs.length) {
      return payload.update({ collection, id: existing.docs[0].id, data })
    }
    return payload.create({ collection, data })
  }

  /* ------------------------------ FORMULÁRIOS ---------------------------- */

  const formNewsletter: any = await upsert(
    'forms',
    { title: { equals: 'Newsletter' } },
    {
      title: 'Newsletter',
      submitButtonLabel: 'Cadastrar',
      confirmationType: 'redirect',
      redirect: { url: '/email-obrigado' },
      fields: [
        { blockType: 'text', name: 'nome', label: 'Nome', required: true, width: 100 },
        { blockType: 'email', name: 'email', label: 'Email', required: true, width: 100 },
        { blockType: 'text', name: 'telefone', label: 'Telefone', required: false, width: 100 },
      ],
    },
  )

  const formContato: any = await upsert(
    'forms',
    { title: { equals: 'Contato' } },
    {
      title: 'Contato',
      submitButtonLabel: 'Enviar',
      confirmationType: 'redirect',
      redirect: { url: '/contato-obrigado' },
      fields: [
        { blockType: 'text', name: 'nome', label: 'Nome', required: true, width: 50 },
        { blockType: 'text', name: 'sobrenome', label: 'Sobrenome', required: false, width: 50 },
        { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50 },
        { blockType: 'text', name: 'telefone', label: 'Telefone', required: false, width: 50 },
        { blockType: 'textarea', name: 'mensagem', label: 'Mensagem', required: true, width: 100 },
      ],
    },
  )

  /* A area de interesse e um campo livre, nao uma lista: enumerar setores
     (recepcao, cozinha, camararia...) seria inventar o organograma da pousada.
     Quem se candidata escreve o que procura. */
  await upsert(
    'forms',
    { title: { equals: 'Trabalhe Conosco' } },
    {
      title: 'Trabalhe Conosco',
      submitButtonLabel: 'Enviar candidatura',
      confirmationType: 'redirect',
      redirect: { url: '/contato-obrigado' },
      fields: [
        { blockType: 'text', name: 'nome', label: 'Nome', required: true, width: 50 },
        { blockType: 'text', name: 'sobrenome', label: 'Sobrenome', required: false, width: 50 },
        { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50 },
        { blockType: 'text', name: 'telefone', label: 'Telefone', required: true, width: 50 },
        { blockType: 'text', name: 'area', label: 'Área de interesse', required: false, width: 50 },
        { blockType: 'text', name: 'cidade', label: 'Onde você mora', required: false, width: 50 },
        {
          blockType: 'textarea',
          name: 'mensagem',
          label: 'Conte um pouco sobre sua experiência',
          required: true,
          width: 100,
        },
      ],
    },
  )

  /* -------------------------------- GLOBALS ------------------------------ */

  await payload.updateGlobal({ slug: 'site-settings', data: {} }) // grava os defaults
  await payload.updateGlobal({ slug: 'booking-bar', data: {} })
  await payload.updateGlobal({ slug: 'floating-actions', data: {} })

  await payload.updateGlobal({
    slug: 'header',
    data: {
      nav: [
        { label: 'Início', href: '/' },
        { label: 'Hotel', href: '/sobre-nos' },
        { label: 'Acomodações', href: '/acomodacoes' },
        { label: 'Localização', href: '/localizacao' },
        { label: 'Fotos', href: '/fotos' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contato', href: '/contato' },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      columns: [
        {
          title: 'Informações',
          links: [
            { label: 'Nossa Localização', href: '/localizacao' },
            { label: 'Sobre nós', href: '/sobre-nos' },
            { label: 'Contato', href: '/contato' },
          ],
        },
        {
          title: 'Links úteis',
          links: [
            { label: 'Políticas de Privacidade', href: '/politica-de-privacidade' },
            { label: 'Políticas de Reserva', href: '/politica-de-reserva' },
          ],
        },
      ],
    },
  })

  // A newsletter passa a apontar para o formulário: é isso que faz o envio
  // gravar no Payload e redirecionar para /email-obrigado.
  await payload.updateGlobal({
    slug: 'newsletter-section',
    data: { form: formNewsletter.id },
  })

  /* ---------------------------- DESIGN SYSTEM ---------------------------- */

  await upsert(
    'design-system',
    { name: { equals: 'Pousada Recanto do Jabaquara — padrão' } },
    { name: 'Pousada Recanto do Jabaquara — padrão', isActive: true },
  )

  /* ------------------------- PÁGINAS DE OBRIGADO ------------------------- */

  await upsert(
    'pages',
    { slug: { equals: 'email-obrigado' } },
    {
      title: 'Cadastro confirmado',
      slug: 'email-obrigado',
      _status: 'published',
      showBookingBar: true,
      showTestimonials: false,
      showNewsletter: false, // quem acabou de assinar não vê o formulário de novo
      layout: [
        {
          blockType: 'confirmation',
          icon: 'i-mail',
          title: 'Cadastro confirmado!',
          text: 'Pronto: seu e-mail está na nossa lista. A partir de agora você recebe em primeira mão as promoções e novidades da Pousada Recanto do Jabaquara.',
          ctaLabel: 'Faça uma reserva',
        },
      ],
    },
  )

  await upsert(
    'pages',
    { slug: { equals: 'contato-obrigado' } },
    {
      title: 'Mensagem enviada',
      slug: 'contato-obrigado',
      _status: 'published',
      showBookingBar: true,
      showTestimonials: false,
      showNewsletter: true,
      newsletterVariant: 'inner',
      layout: [
        {
          blockType: 'confirmation',
          icon: 'i-phone',
          title: 'Mensagem enviada!',
          text: 'Recebemos o seu contato e nossa equipe responde o mais breve possível. Nossa recepção atende 24 horas.',
          ctaLabel: 'Faça uma reserva',
        },
      ],
    },
  )

  /* ------------------------------- CONTATO ------------------------------- */

  await upsert(
    'pages',
    { slug: { equals: 'contato' } },
    {
      title: 'Contato',
      slug: 'contato',
      _status: 'published',
      showBookingBar: true,
      showTestimonials: false,
      showNewsletter: true,
      newsletterVariant: 'inner',
      layout: [
        {
          blockType: 'contact',
          eyebrow: 'Fale conosco',
          title: 'Entre em contato',
          text: 'Através deste formulário você poderá solicitar informações, sanar dúvidas e enviar sugestões. Retornaremos o mais breve possível.',
          form: formContato.id,
          asideTitle: 'Central de reservas',
        },
      ],
    },
  )

  console.log('Seed concluído:')
  console.log('  formulários  Newsletter, Contato, Trabalhe Conosco')
  console.log('  páginas      /contato, /email-obrigado, /contato-obrigado')
  console.log('  globals      header, footer, newsletter, booking, settings')

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
