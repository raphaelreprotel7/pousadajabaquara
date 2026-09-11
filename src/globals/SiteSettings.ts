import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

/**
 * Dados do hotel usados em todo o site.
 *
 * Telefone, e-mail e endereço aparecem no rodapé, na página de Localização e na
 * Central de reservas. Ficam aqui uma vez só — no site estático estavam
 * repetidos em oito arquivos.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Configurações do site',
  admin: { group: 'Configuração' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidade',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'hotelName',
                  label: 'Nome do hotel',
                  type: 'text',
                  required: true,
                  defaultValue: 'Pousada Recanto do Jabaquara',
                  admin: { width: '50%' },
                },
                {
                  name: 'tagline',
                  label: 'Assinatura dos banners',
                  type: 'text',
                  localized: true,
                  defaultValue: 'o melhor preço garantido',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'logo',
                  label: 'Logo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '50%', description: 'PNG com fundo transparente.' },
                },
                {
                  name: 'favicon',
                  label: 'Favicon',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Contato',
          fields: [
            {
              type: 'collapsible',
              label: 'Telefone do hotel',
              admin: {
                description: 'Recepção. Aparece no rodapé e na página de Localização.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'phoneLabel',
                      label: 'Exibição',
                      type: 'text',
                      admin: { width: '50%', placeholder: '11 3329-8020' },
                    },
                    {
                      name: 'phoneE164',
                      label: 'Discagem',
                      type: 'text',
                      admin: {
                        width: '50%',
                        placeholder: '+551133298020',
                        description: 'Vira o link tel:',
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Central de reservas',
              admin: {
                description:
                  'Número de vendas. Aparece no card da página de Contato e nos botões de reserva.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'reservationsLabel',
                      label: 'Exibição',
                      type: 'text',
                      admin: { width: '50%', placeholder: '11 4369-1869' },
                    },
                    {
                      name: 'reservationsE164',
                      label: 'Discagem',
                      type: 'text',
                      admin: { width: '50%', placeholder: '+551143691869' },
                    },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'whatsapp',
                  label: 'WhatsApp (só números)',
                  type: 'text',
                  admin: {
                    width: '50%',
                    placeholder: '551143691869',
                    description: 'Monta https://wa.me/…',
                  },
                },
                {
                  name: 'email',
                  label: 'E-mail',
                  type: 'email',
                  admin: { width: '50%', placeholder: 'reservas@pousadarecantodojabaquara.com.br' },
                },
              ],
            },
            {
              name: 'address',
              label: 'Endereço',
              type: 'text',
              admin: {
                placeholder: 'Rua, número — bairro, Paraty - RJ, CEP',
              },
            },
            {
              name: 'socials',
              label: 'Redes sociais',
              type: 'array',
              labels: { singular: 'Rede', plural: 'Redes' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'network',
                      label: 'Rede',
                      type: 'select',
                      required: true,
                      options: [
                        { label: 'Instagram', value: 'instagram' },
                        { label: 'Facebook', value: 'facebook' },
                      ],
                      admin: { width: '25%' },
                    },
                    {
                      name: 'handle',
                      label: 'Rótulo',
                      type: 'text',
                      required: true,
                      admin: { width: '35%', placeholder: '@perfil' },
                    },
                    {
                      name: 'url',
                      label: 'URL',
                      type: 'text',
                      required: true,
                      admin: { width: '40%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Mapa',
          description: 'Coordenadas do hotel no OpenStreetMap.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'latitude',
                  label: 'Latitude',
                  type: 'number',
                  admin: { width: '33%', placeholder: '-23.5401686' },
                },
                {
                  name: 'longitude',
                  label: 'Longitude',
                  type: 'number',
                  admin: { width: '33%', placeholder: '-46.6377418' },
                },
                {
                  name: 'mapZoom',
                  label: 'Zoom',
                  type: 'number',
                  defaultValue: 16,
                  min: 10,
                  max: 19,
                  admin: { width: '34%' },
                },
              ],
            },
            {
              name: 'tileUrl',
              label: 'URL dos tiles',
              type: 'text',
              defaultValue: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              admin: {
                description:
                  'Trocar aqui muda o estilo do mapa. Atenção ao provedor: o CARTO, que era o padrão, passou a exigir chave e devolve tiles escritos "API KEY REQUIRED" — o mapa carrega e parece quebrado.',
              },
            },
            {
              name: 'tileAttribution',
              label: 'Atribuição',
              type: 'text',
              defaultValue:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            },
          ],
        },
      ],
    },
  ],
}
