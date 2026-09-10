import type { Access, FieldAccess, PayloadRequest } from 'payload'

/** Leitura pública — usado no conteúdo que o site precisa servir sem login. */
export const anyone: Access = () => true

/** Qualquer usuário autenticado no admin. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/** Somente administradores. */
export const admins: Access = ({ req: { user } }) => user?.role === 'admin'

export const adminsFieldLevel: FieldAccess = ({ req: { user } }) => user?.role === 'admin'

/**
 * Acesso ao painel. Diferente dos demais, `admin` só aceita boolean — os
 * outros podem devolver um `Where` para filtrar documentos, o que aqui não
 * faria sentido.
 */
export const canAccessAdmin = ({ req }: { req: PayloadRequest }): boolean => Boolean(req.user)

/**
 * Leitura pública apenas do que está publicado.
 * Quem está logado enxerga rascunhos também — é o que faz o live preview funcionar.
 */
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    _status: {
      equals: 'published',
    },
  }
}
