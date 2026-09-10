# Pousada Recanto do Jabaquara — Payload CMS

Site da Pousada Recanto do Jabaquara em Payload CMS 3 + Next.js App Router, gerado pela skill
`site-payload` a partir do template do Hotel Normandie.

## Rodar

```bash
cp .env.example .env          # ajuste PAYLOAD_SECRET
npm install
npm run seed                  # formulários, páginas de obrigado e globals base
npm run seed:site             # o conteúdo do cliente (content/site.json)
npm run dev                   # site em / e admin em /admin
```

Primeiro acesso em `/admin` cria o usuário administrador.

## Onde mora cada coisa

```
content/
  site.json           conteúdo do site — a fonte da verdade do seed
  imagens/            fotos do cliente, referenciadas por "@media:nome.jpg"
src/
  app/(frontend)/     site público   — styles.css é a folha estrutural
  app/(payload)/      painel
  blocks/             configs dos blocos + RenderBlocks
  collections/        modelagem de conteúdo
  components/         cabeçalho, rodapé, sprite de ícones, tokens, interativos
  globals/            seções presentes em todas as páginas
  fonts.ts            tipografia self-hospedada (trocar fonte = editar só aqui)
  scripts/            seed base, seed de conteúdo e migrações
```

Veja **ESTRUTURA.md** para a modelagem de conteúdo e o porquê de cada decisão.

## Aparência

Quem governa cores, tipografia, espaçamento e formas é o **Design System** —
uma collection com um documento ativo por vez, injetado como CSS custom
properties por `components/DesignTokens.tsx`, depois do `styles.css`.

O `:root` do `styles.css` é só uma base neutra em grafite. Um site que suba
cinza é sinal de que o tema não foi cadastrado ou não está ativo.

Trocar a tipografia é editar **`src/fonts.ts`** e nada mais: o `layout.tsx` pega
as variáveis de lá e o `DesignTokens` reconhece as famílias self-hospedadas pela
mesma constante.

## Conteúdo

`content/site.json` descreve o site inteiro — design system, globals, coleções e
os blocos de cada página. `npm run seed:site` aplica o arquivo, é idempotente e
lista o que ficou pendente (imagem faltando, referência não resolvida).

Editar no admin também funciona; o JSON é o ponto de partida e o registro do que
foi entregue.

## Publicar

1. `npm run build` — tem que passar limpo
2. Banco: `npm run migrate:turso` leva o SQLite local para o Turso
3. Uploads: `npm run upload:blob` leva `public/media` para o Vercel Blob
4. Variáveis na Vercel: `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`,
   `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BLOB_READ_WRITE_TOKEN`
5. `PAYLOAD_DB_PUSH=false` em produção — o push automático de schema existe para
   o projeto nascer com as tabelas; depois que há dados, ele é destrutivo
