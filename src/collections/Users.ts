import type { CollectionConfig } from 'payload'

import { admins, adminsFieldLevel, authenticated, canAccessAdmin } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Sistema',
  },
  access: {
    read: authenticated,
    create: admins,
    update: admins,
    delete: admins,
    admin: canAccessAdmin,
  },
  fields: [
    {
      name: 'name',
      label: 'Nome',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      label: 'Perfil',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: { update: adminsFieldLevel },
      admin: {
        description: 'Só administradores criam usuários e alteram perfis.',
      },
    },
  ],
}
