import type { Field } from 'payload'

import { GHL_TARGETS } from '@/utilities/ghl'

/**
 * Aba "GoHighLevel" que entra em cada formulário.
 *
 * A ideia é que o formulário funcione sem configuração: com "Enviar para o
 * GHL" ligado, os campos são reconhecidos pelo nome (nome, e-mail, telefone…).
 * O mapeamento explícito existe só para os casos que a heurística erra.
 */

const targetOptions = GHL_TARGETS.map((t) => {
  const labels: Record<string, string> = {
    firstName: 'Primeiro nome',
    lastName: 'Sobrenome',
    name: 'Nome completo (divide em nome/sobrenome)',
    email: 'E-mail',
    phone: 'Telefone (normalizado para +55…)',
    companyName: 'Empresa',
    address1: 'Endereço',
    city: 'Cidade',
    state: 'Estado',
    postalCode: 'CEP',
    website: 'Site',
    custom: 'Custom field do GHL',
    ignore: 'Não enviar este campo',
  }
  return { label: labels[t] ?? t, value: t }
})

export const ghlConfigField: Field = {
  name: 'ghl',
  type: 'group',
  label: 'GoHighLevel',
  admin: {
    description:
      'Conecta este formulário ao CRM. A submissão sempre fica salva no Payload; ' +
      'o envio ao GHL acontece depois e nunca quebra o envio do site.',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Enviar submissões para o GoHighLevel',
      defaultValue: true,
    },
    {
      name: 'locationId',
      type: 'text',
      label: 'ID da subconta (location)',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.enabled),
        description:
          'Deixe em branco para usar a subconta padrão definida em GHL_LOCATION_ID.',
      },
    },
    {
      name: 'source',
      type: 'text',
      label: 'Origem (source) registrada no contato',
      defaultValue: 'Site — Pousada Recanto do Jabaquara',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.enabled),
        description: 'Aparece no contato do GHL e permite filtrar os leads vindos do site.',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags aplicadas no contato',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.enabled),
        description: 'Use para separar newsletter, contato e pop-up dentro do GHL.',
        initCollapsed: true,
      },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'fieldMap',
      type: 'array',
      label: 'Mapeamento de campos (opcional)',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.enabled),
        description:
          'Só preencha para corrigir um campo que o reconhecimento automático errou. ' +
          'Campos sem destino equivalente no GHL (mensagem, observações) viram uma nota no contato.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'formField',
          type: 'text',
          label: 'Nome do campo neste formulário',
          required: true,
          admin: {
            width: '50%',
            description: 'Exatamente o "Name" do campo na aba Fields.',
          },
        },
        {
          name: 'target',
          type: 'select',
          label: 'Destino no GHL',
          required: true,
          options: targetOptions,
          admin: { width: '50%' },
        },
        {
          name: 'customKey',
          type: 'text',
          label: 'Chave do custom field',
          admin: {
            condition: (_, siblingData) => siblingData?.target === 'custom',
            description: 'A key exata do custom field na subconta do GHL.',
          },
        },
      ],
    },
  ],
}

/**
 * Campos de auditoria gravados em cada submissão: dá para abrir uma submissão
 * no admin e ver se ela chegou ao CRM, sem caçar log de função.
 */
export const ghlStatusFields: Field[] = [
  {
    name: 'ghlStatus',
    type: 'select',
    label: 'Status no GoHighLevel',
    options: [
      { label: 'Enviado', value: 'sent' },
      { label: 'Falhou', value: 'failed' },
      { label: 'Desativado para este formulário', value: 'skipped' },
    ],
    admin: { readOnly: true, position: 'sidebar' },
  },
  {
    name: 'ghlContactId',
    type: 'text',
    label: 'ID do contato no GHL',
    admin: { readOnly: true, position: 'sidebar' },
  },
  {
    name: 'ghlError',
    type: 'text',
    label: 'Erro do GHL',
    admin: {
      readOnly: true,
      position: 'sidebar',
      condition: (data) => data?.ghlStatus === 'failed',
    },
  },
]
