# Estrutura de conteúdo — Pousada Recanto do Jabaquara

Modelagem herdada do template (Hotel Normandie). O que muda de cliente para
cliente é o conteúdo e o design system — a modelagem é a mesma, e é isso que
permite entregar um site novo sem reinventar o CMS.

---

## O problema que a modelagem resolve

Um site de hotel em HTML solto repete, em cada página, o cabeçalho, o rodapé, a
barra de reserva, os depoimentos e a newsletter. Consequências práticas:

| Sintoma no HTML | Custo |
|---|---|
| Telefone e endereço escritos em 8 arquivos | Trocar o telefone é editar 8 vezes e torcer para não esquecer nenhuma |
| Os mesmos depoimentos copiados em 7 páginas | Trocar uma avaliação = 7 edições |
| "Wi-Fi de alta velocidade" repetido em todo card de quarto | Nenhuma fonte única |
| Filtros da galeria fixos no HTML e no JS | Categoria nova exige mexer em código |
| Cards de oferta sem data | Alguém precisa lembrar de tirar do ar |
| Agrupamento das fotos só no nome do arquivo | O agrupamento existe na cabeça de quem subiu, não no sistema |

**Componentes presentes em toda página**: barra de reserva, depoimentos,
newsletter, cabeçalho, rodapé, WhatsApp flutuante, barra fixa do mobile e aviso
de cookies. Todos são **globals** — não são blocos, porque não deveriam depender
de o editor lembrar de adicioná-los.

---

## Collections

### Conteúdo

| Collection | Papel | Por que existe |
|---|---|---|
| **Pages** | Páginas com page builder | Layout é lista de blocos; as seções fixas ficam fora |
| **Suites** | Acomodações | Alimenta o carrossel da home, a listagem e o carrossel de fotos do card |
| **Amenities** | Comodidades | Vocabulário único, com `scope` separando "no quarto" de "estrutura do hotel" |
| **Differentials** | Diferenciais | `kind` decide o formato: card com foto ou caixa com ícone |
| **Offers** | Promoções | Janela de vigência: sai do ar sozinha e dispara o estado vazio |
| **Popups** | Pop-ups de campanha | Gatilho, frequência e alcance por página |
| **Testimonials** | Depoimentos | Nota, origem e link da avaliação original |
| **Faqs** | Dúvidas frequentes | Categorizadas, para filtrar por contexto. Resposta em rich text |
| **Attractions** | Pontos de interesse | Distância em **metros** num campo numérico — ordena sozinho e serve SEO local |
| **PhotoCategories** | Categorias da galeria | Os botões de filtro da página Fotos passam a ser conteúdo |

### Blog

| Collection | Papel |
|---|---|
| **Posts** | Artigos, com relações para acomodações, atrações e outros posts |
| **PostCategories** | Taxonomia |

### Sistema

| Collection | Papel |
|---|---|
| **DesignSystem** | Tokens visuais. Um tema ativo por vez |
| **Media** | Uploads. Tem `category` para alimentar a galeria sem duplicar imagem |
| **Users** | Autenticação |

---

## Globals

| Global | O que guarda |
|---|---|
| **SiteSettings** | Nome, logo, telefone, WhatsApp, e-mail, endereço, redes e coordenadas do mapa |
| **BookingBar** | URL e parâmetros do motor de reservas, rótulos e limite de hóspedes |
| **Header** | Itens do menu e os dois botões do topo |
| **Footer** | Texto da marca, colunas de links e linha final |
| **NewsletterSection** | As duas variantes de chamada (home e internas) e os campos |
| **TestimonialsSection** | Título e quais depoimentos exibir |
| **FloatingActions** | WhatsApp flutuante, barra fixa do mobile e aviso de cookies |
| **PromotionPage** | Rótulos e botões do template de detalhe das promoções |

Os dados de contato ficam **só** em SiteSettings. O rodapé, a página de
Localização e a Central de reservas leem de lá — não há segunda cópia.

---

## Blocos do page builder

`hero`, `pageHero`, `about`, `splitContent`, `differentials`, `suitesCarousel`,
`roomList`, `cityBand`, `offers`, `social`, `faq`, `gallery`, `location`,
`postList`, `emptyState`, `contact`, `confirmation`, `richText`.

Cada bloco emite marcação com as classes do `styles.css`. Bloco novo é mudança
de código — e é assim que o design system continua governando.

---

## Design System

`DesignSystem` é collection e não global de propósito: permite manter mais de um
tema (sazonal, campanha, teste) e alternar qual está no ar por `isActive` (um
hook desliga os demais).

Os tokens viram CSS custom properties injetadas no `<head>` por
`components/DesignTokens.tsx`, **depois** do `styles.css`, sobrescrevendo o
`:root`. Os defaults dos campos são uma base neutra em grafite — o tema real vem
da home do cliente.

Tokens cobertos: cores da marca e de texto, fundos, tipografia (famílias, URL do
provedor, tamanho base, entrelinha), largura do container, respiro entre seções,
altura dos banners, raios, sombra e as medidas do template de promoções. Há um
campo de CSS extra como escape hatch — usar é sinal de que faltou um token.

---

## O motor de reservas

Parâmetros do Omnibees, conferidos no HTML do próprio motor:

```
CheckIn / CheckOut  ddMMyyyy
ad                  adultos
ch                  crianças
NRooms              quartos
c / q               rede / hotel
```

A barra monta a URL com as datas escolhidas. Os botões "Faça uma reserva" abrem
o motor sem datas. Trocar de motor é trocar `engineBaseUrl` e os códigos no
global BookingBar.

---

## Descoberta por agentes

O site publica `/.well-known/ai-catalog.json`, `/.well-known/openapi.json`,
`/.well-known/agent-skills/` (duas skills: informações e reserva) e
`/api/public-content`. Os textos das skills são estáticos, gerados na criação do
projeto — se o nome do hotel, a cidade ou os códigos do motor mudarem, ajuste
`src/utilities/agentSkills.ts`.
