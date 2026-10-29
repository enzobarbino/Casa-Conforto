# Prompt para o Antigravity: Casa & Conforto

## 0. Seu papel e como trabalhar

Você é um desenvolvedor full-stack sênior. Vai construir do zero o projeto **"Casa & Conforto"**: uma vitrine de afiliados da Shopee com painel administrativo e curadoria assistida por IA.

É um **projeto de estudo/portfólio**. Ele precisa rodar localmente com `npm install` + `npm run dev`, **sem nenhuma conta externa** (sem Shopee, sem chave de IA, sem banco na nuvem). Todas as integrações externas são **simuladas (mock)** atrás de uma camada de serviço, prontas para serem trocadas pelas reais no futuro.

Regras de trabalho:
- Siga as **fases da seção 14** na ordem. Ao final de cada fase, rode o projeto e confirme que funciona antes de seguir.
- Toda a interface é em **português do Brasil**. Moeda em `R$` (formatação `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`) e datas no formato `dd/mm/aaaa`.
- Quando algo não estiver especificado aqui, escolha a opção mais simples e registre a decisão no `README.md`, na seção "Decisões".
- Não adicione funcionalidades fora do escopo (seção 15).

---

## 1. Modelo de negócio (regra central, não negociável)

- O site **não vende diretamente**. Não existe checkout, carrinho, pagamento, frete, estoque nem pedidos.
- Cada produto tem um **link de afiliado** da Shopee. Quando o visitante clica em "Ver oferta na Shopee", ele passa pela rota interna `/ir/[id]`, que **registra o clique** e **redireciona** para o link de afiliado.
- A dona do site ganha uma **comissão** quando a venda acontece na Shopee. A comissão começa como **pendente** e depois vira **confirmada**.
- A IA **sugere** produtos e **escreve** títulos e descrições, mas **a administradora revisa antes de publicar** (publicação automática existe, mas vem **desligada** por padrão).

---

## 2. Usuários

**Visitante da vitrine:** chega principalmente pelo celular, a partir de links compartilhados no WhatsApp e no Instagram. Quer ver o produto rápido, entender para que serve e ir para a Shopee.

**Administradora (dona do site):** **não é técnica** e usa o painel **principalmente pelo celular**. Precisa responder rapidamente: "Quantos cliques tive?", "Quanto vou receber?" e "O que devo publicar hoje?".

---

## 3. Stack

- **Next.js** (versão estável mais recente, App Router) + **TypeScript** (modo `strict`)
- **Tailwind CSS** para estilos
- **Prisma** + **SQLite** (arquivo local `prisma/dev.db`)
- **Zod** para validação de formulários e entradas
- **iron-session** (ou cookie httpOnly assinado equivalente) para a sessão da administradora
- **lucide-react** para ícones
- **Vitest** para testes unitários
- Fontes via `next/font/google`: **Plus Jakarta Sans** (títulos) e **Inter** (texto)

Não use bibliotecas de componentes prontas (shadcn, MUI etc.). Crie os componentes da seção 6.

---

## 4. Estrutura de pastas

```
casa-conforto/
├── app/
│   ├── (vitrine)/
│   │   ├── layout.tsx              # Header + Footer da vitrine
│   │   ├── page.tsx                # Home
│   │   ├── produtos/page.tsx       # Catálogo
│   │   ├── produtos/[id]/page.tsx  # Página do produto
│   │   ├── bio/page.tsx            # Link da bio
│   │   ├── sobre/page.tsx
│   │   └── privacidade/page.tsx
│   ├── ir/[id]/route.ts            # Registro de clique + redirecionamento
│   ├── painel/
│   │   ├── login/page.tsx
│   │   ├── (protegido)/
│   │   │   ├── layout.tsx          # Menu lateral (desktop) / inferior (mobile)
│   │   │   ├── page.tsx            # Início
│   │   │   ├── revisar/page.tsx
│   │   │   ├── adicionar/page.tsx
│   │   │   ├── descobrir/page.tsx
│   │   │   ├── produtos/page.tsx   # Meus produtos
│   │   │   ├── produtos/[id]/page.tsx  # Editar produto
│   │   │   └── configuracoes/page.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── not-found.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                         # Componentes base (seção 6)
│   ├── vitrine/                    # ProductCard, CategoryGrid, Hero, Footer...
│   └── painel/                     # StatCard, ReviewCard, StatusBadge, Nav...
├── lib/
│   ├── db.ts                       # Instância única do Prisma
│   ├── auth.ts                     # Sessão, login, logout, requireAdmin()
│   ├── format.ts                   # Moeda, data, número
│   ├── calc.ts                     # Ganho estimado, métricas
│   ├── validation.ts               # Schemas Zod
│   ├── actions/                    # Server Actions do painel
│   └── services/
│       ├── shopee/
│       │   ├── types.ts            # Interface ShopeeService
│       │   ├── mock.ts             # Implementação simulada
│       │   └── index.ts            # Escolhe mock ou real
│       └── ai/
│           ├── types.ts            # Interface AIService
│           ├── mock.ts
│           ├── llm.ts              # Implementação real (opcional)
│           └── index.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── data/catalogo-shopee-mock.json
├── public/produtos/                # Imagens placeholder (SVG)
├── scripts/atualizar.ts            # Rotina de atualização de preços
├── tests/
├── .env.example
└── README.md
```

---

## 5. Identidade visual (Design System "Lumina")

### 5.1 Tokens (configure no `tailwind.config` e em variáveis CSS)

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#0d9488` | Botões principais, links, destaques |
| `primary-dark` | `#00685e` | Hover/pressed do primário |
| `primary-soft` | `#ccfbf1` | Fundos de badges e destaques suaves |
| `bg` | `#faf8ff` | Fundo das páginas |
| `surface` | `#ffffff` | Cards |
| `surface-alt` | `#f2f3ff` | Seções alternadas |
| `text` | `#1f2937` | Texto principal |
| `text-muted` | `#6b7280` | Texto secundário |
| `border` | `#e5e7eb` | Bordas |
| `success` | `#16a34a` | Status "No ar", comissão confirmada |
| `warning` | `#d97706` | Status "Preço mudou", alertas da IA |
| `danger` | `#dc2626` | Status "Oferta acabou", erros |
| `info` | `#4f46e5` | Badges de IA |

- **Raio:** `12px` (inputs, botões), `16px` (cards), `24px` (seções e banners)
- **Sombra:** suave, ex.: `0 4px 20px rgba(15, 23, 42, 0.06)`
- **Espaçamento:** escala do Tailwind; gutter lateral de `16px` no mobile e `32px` no desktop; largura máxima do conteúdo `1200px`
- **Tipografia:** títulos em Plus Jakarta Sans (600–700), texto em Inter (400–500). Tamanho mínimo de texto: `14px`; corpo: `16px`
- **Alvos de toque:** mínimo de `44px` de altura em qualquer elemento clicável
- **Contraste:** WCAG AA em todos os textos

### 5.2 Breakpoints
Mobile-first. Ajustes em `md` (768px) e `lg` (1024px).

---

## 6. Componentes base (`components/ui/`)

Crie e reutilize em todo o projeto:

- **Button**: variantes `primary`, `secondary` (contorno), `ghost`, `danger`; tamanhos `md` e `lg`; estado `loading` (spinner + desabilitado); suporte a ícone à esquerda.
- **Card**: superfície branca, raio 16px, sombra suave.
- **Badge**: variantes `neutral`, `success`, `warning`, `danger`, `info`.
- **StatusBadge**: recebe o status do produto e mostra o texto amigável e a cor certa (tabela da seção 7.2).
- **Input**, **Textarea**, **Select**, **Checkbox**: sempre com `<label>` visível e mensagem de erro abaixo do campo.
- **Toggle** (interruptor) acessível, com `role="switch"` e `aria-checked`.
- **EmptyState**: ícone, título, texto e ação opcional.
- **Toast**: feedback de sucesso/erro após ações (ex.: "Produto publicado!").
- **ConfirmDialog**: modal de confirmação para ações destrutivas (ignorar, ocultar).
- **Skeleton**: placeholders de carregamento para cards e listas.
- **Price**: exibe o preço formatado em reais.

---

## 7. Modelo de dados

### 7.1 `prisma/schema.prisma`

SQLite não tem listas nem enums nativos. Guarde listas como **string JSON** e status como **string**, com tipos e validação no TypeScript (`lib/validation.ts`).

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Produto {
  id                 String     @id @default(cuid())
  shopeeItemId       String     @unique
  titulo             String
  descricao          String
  destaques          String     // JSON: string[] (3 itens)
  categoria          String     // um dos slugs da seção 7.3
  imagens            String     // JSON: string[] (caminhos em /public/produtos)
  precoShopee        Float
  precoAnterior      Float?
  precoConsultadoEm  DateTime
  comissaoPercentual Float      // ex.: 0.12 = 12%
  linkOriginal       String
  linkAfiliado       String
  status             String     // PARA_REVISAR | NO_AR | PRECO_MUDOU | OFERTA_ACABOU | OCULTO | IGNORADO
  alertasIA          String     @default("[]") // JSON: string[]
  publicadoEm        DateTime?
  criadoEm           DateTime   @default(now())
  atualizadoEm       DateTime   @updatedAt
  cliques            Clique[]
  comissoes          Comissao[]

  @@index([status])
  @@index([categoria])
}

model Clique {
  id        String   @id @default(cuid())
  produtoId String
  produto   Produto  @relation(fields: [produtoId], references: [id], onDelete: Cascade)
  origem    String   // site | whatsapp | bio
  criadoEm  DateTime @default(now())

  @@index([produtoId])
  @@index([criadoEm])
}

model Comissao {
  id        String   @id @default(cuid())
  produtoId String
  produto   Produto  @relation(fields: [produtoId], references: [id], onDelete: Cascade)
  valor     Float
  status    String   // PENDENTE | CONFIRMADA
  data      DateTime

  @@index([status])
}

model Configuracao {
  id                      Int      @id @default(1)
  categoriasPermitidas    String   // JSON: string[] de slugs
  frequenciaBusca         String   // DIARIA | A_CADA_2_DIAS | SEMANAL
  publicarAutomaticamente Boolean  @default(false)
  atualizadoEm            DateTime @updatedAt
}
```

### 7.2 Status do produto

| Status | Texto na interface | Cor | Aparece na vitrine? |
|---|---|---|---|
| `PARA_REVISAR` | Para revisar | info | Não |
| `NO_AR` | No ar | success | Sim |
| `PRECO_MUDOU` | Preço mudou | warning | Sim (com o novo preço) |
| `OFERTA_ACABOU` | Oferta acabou | danger | Só pela URL direta, com aviso (seção 9.3) |
| `OCULTO` | Oculto | neutral | Não |
| `IGNORADO` | Ignorado | neutral | Não (e não aparece em "Meus produtos") |

**Transições permitidas:**
- `PARA_REVISAR` → `NO_AR` (Publicar) ou `IGNORADO` (Ignorar)
- `NO_AR` ↔ `OCULTO` (Ocultar / Mostrar)
- `NO_AR` → `PRECO_MUDOU` ou `OFERTA_ACABOU` (somente pela rotina de atualização)
- `PRECO_MUDOU` → `NO_AR` (administradora clica em "Confirmar novo preço")
- `OFERTA_ACABOU` → `NO_AR` (somente se a rotina detectar que a oferta voltou)

Centralize essas regras em uma função `podeMudarStatus(de, para)` em `lib/` e use-a em todas as Server Actions.

### 7.3 Categorias (slugs fixos)

| Slug | Nome |
|---|---|
| `cozinha-mesa` | Cozinha & Mesa |
| `conforto-banho` | Conforto & Banho |
| `decoracao-aromas` | Decoração & Aromas |
| `utilidades` | Utilidades Inteligentes |
| `organizacao` | Organização & Casa |

### 7.4 Cálculos (`lib/calc.ts`)

- **Ganho estimado por venda** = `precoShopee × comissaoPercentual`, arredondado a 2 casas.
- **Cliques da semana** = cliques nos últimos 7 dias (com a variação percentual em relação aos 7 dias anteriores).
- **Comissão pendente** = soma de `Comissao.valor` com status `PENDENTE`.
- **Comissão confirmada** = soma com status `CONFIRMADA`.
- **Produtos no ar** = contagem com status `NO_AR` ou `PRECO_MUDOU`.

Escreva testes unitários para todas essas funções.

---

## 8. Camada de serviços (integrações simuladas)

### 8.1 `ShopeeService`

```ts
export interface OfertaShopee {
  shopeeItemId: string;
  nome: string;
  descricaoOriginal: string;
  preco: number;
  comissaoPercentual: number;
  categoria: string;
  imagens: string[];
  linkOriginal: string;
  disponivel: boolean;
}

export interface ShopeeService {
  buscarOfertas(params: { termo?: string; categorias?: string[]; limite?: number }): Promise<OfertaShopee[]>;
  obterProduto(url: string): Promise<OfertaShopee | null>;
  gerarLinkAfiliado(linkOriginal: string, subId?: string): Promise<string>;
  consultarProduto(shopeeItemId: string): Promise<OfertaShopee | null>; // usado na rotina de atualização
}
```

**Implementação mock (`mock.ts`):**
- Lê `prisma/data/catalogo-shopee-mock.json`, com **30 produtos fictícios** de casa distribuídos entre as 5 categorias. Use nomes genéricos, sem marcas reais.
- `buscarOfertas`: filtra por termo (busca simples no nome e na descrição, sem diferenciar maiúsculas e acentos) e por categorias; ordena por comissão (decrescente).
- `obterProduto(url)`: aceita URLs que contenham `shopee.com.br` ou `shp.ee`. Extrai um id da URL; se o id existir no catálogo mock, retorna o produto. Se não existir, gera uma oferta fictícia determinística a partir da URL, para que qualquer link válido funcione na demonstração. Para URLs de outros domínios, retorna `null`.
- `gerarLinkAfiliado`: retorna `linkOriginal` + `?af_id=DEMO&sub_id={subId}`.
- `consultarProduto`: retorna o produto com pequenas variações aleatórias: ~15% de chance de mudar o preço (±5% a 20%) e ~5% de chance de `disponivel: false`.
- Simule latência de 300–800 ms para que os estados de carregamento apareçam.

**`index.ts`:** exporta a implementação mock. Deixe um comentário `// TODO: implementação real via Shopee Affiliate Open API` e uma variável `SHOPEE_MODE=mock` no `.env.example`.

### 8.2 `AIService`

```ts
export interface ConteudoGerado {
  titulo: string;        // até 70 caracteres
  descricao: string;     // 60 a 120 palavras
  destaques: string[];   // exatamente 3, até 40 caracteres cada
  categoria: string;     // slug válido da seção 7.3
  alertas: string[];     // informações faltando ou duvidosas
}

export interface AIService {
  gerarConteudo(oferta: OfertaShopee): Promise<ConteudoGerado>;
}
```

**Mock:** monta título, descrição e destaques a partir dos dados da oferta com templates simples. Adiciona alertas quando faltar informação (ex.: descrição original curta → "Descrição original muito curta, confira os detalhes do produto").

**Real (`llm.ts`, opcional):** usado somente se `AI_API_KEY` estiver definida. Chama um modelo de linguagem com o prompt de sistema abaixo, pede resposta em JSON, valida com Zod e, se a validação falhar, cai para o mock e adiciona o alerta "Não consegui gerar o texto automaticamente, revise com atenção".

Prompt de sistema da IA:
```
Você escreve conteúdo para uma vitrine de afiliados de produtos para casa.
Regras obrigatórias:
1. Use APENAS informações presentes nos dados do produto recebidos. Nunca invente medidas, materiais, funções ou benefícios.
2. Reescreva com palavras próprias; nunca copie frases da descrição original.
3. Proibido: promessas de saúde, cura, emagrecimento ou resultado garantido; "o melhor", "o mais barato"; comparações com marcas; menções a avaliações, notas ou número de vendas.
4. Tom simples, acolhedor e direto, em português do Brasil.
5. Título com até 70 caracteres; descrição de 60 a 120 palavras; exatamente 3 destaques curtos.
6. Escolha a categoria entre: cozinha-mesa, conforto-banho, decoracao-aromas, utilidades, organizacao.
7. Se faltar informação importante (tamanho, voltagem, material, capacidade), descreva o que falta em "alertas".
Responda somente com JSON no formato:
{ "titulo": "", "descricao": "", "destaques": ["", "", ""], "categoria": "", "alertas": [] }
```

---

## 9. Vitrine (área pública)

### 9.1 Layout comum
- **Header:** logo "Casa & Conforto" (texto estilizado), campo de busca (no mobile, ícone que expande o campo) e links "Produtos" e "Sobre". Fixo no topo ao rolar.
- **Footer (em TODAS as páginas da vitrine):**
  - Aviso: **"Podemos receber comissão pelas compras feitas através dos nossos links, sem custo extra para você."**
  - Links: Sobre, Privacidade
  - Texto: "Os preços e a disponibilidade são definidos pela Shopee e podem mudar."
- Todo link que leva para a Shopee usa `target="_blank"` e `rel="sponsored nofollow noopener noreferrer"`.

### 9.2 Home (`/`)
1. **Hero:** título "Transforme sua casa em um refúgio de praticidade e bem-estar", subtítulo "Achados selecionados da Shopee para deixar o dia a dia mais fácil e bonito", botão "Ver todos os achados" → `/produtos`. No mobile, texto acima e imagem abaixo; no desktop, lado a lado.
2. **Categorias:** 5 cards com ícone e nome (seção 7.3), cada um linkando para `/produtos?categoria={slug}`. Carrossel com rolagem horizontal no mobile, grade de 5 colunas no desktop.
3. **"Os mais clicados":** os 8 produtos visíveis com mais cliques nos últimos 30 dias.
4. **"Novidades":** os 8 produtos publicados mais recentemente.
5. **Bloco "Como funciona":** 3 passos ("Escolhemos os achados" → "Você vê os detalhes aqui" → "Compra com segurança na Shopee").

**ProductCard** (usado em todo o site):
- Imagem quadrada (`aspect-square`, `object-cover`), título com no máximo 2 linhas, preço em destaque, badge "Preço mudou" se aplicável.
- O card inteiro leva à página do produto; o botão "Ver oferta" leva a `/ir/[id]?origem=site`.

### 9.3 Catálogo (`/produtos`)
- **Filtros** (barra lateral no desktop; botão "Filtrar" que abre uma gaveta inferior no mobile):
  - Categoria: checkboxes com a contagem de produtos visíveis em cada uma.
  - Faixa de preço: botões rápidos "Até R$ 50", "R$ 50 a R$ 100", "R$ 100 a R$ 200", "Acima de R$ 200".
- **Busca:** parâmetro `?q=` (vindo do header), sem diferenciar maiúsculas e acentos.
- **Ordenação:** "Mais clicados" (padrão), "Menor preço", "Maior preço", "Mais recentes".
- **Chips de filtros ativos** acima da grade, com "x" para remover e botão "Limpar tudo".
- **Estado na URL:** todos os filtros, a busca e a ordenação ficam nos query params, para que o link seja compartilhável.
- **Grade:** 2 colunas no mobile, 3 no `md`, 4 no `lg`. Mostra 12 produtos e o botão "Carregar mais achados" adiciona mais 12.
- **Texto de contagem:** "Mostrando 12 de 30 achados".
- **Estado vazio:** "Nenhum achado com esses filtros." + botão "Limpar filtros".

### 9.4 Página do produto (`/produtos/[id]`)
- **Galeria:** imagem principal + miniaturas; no mobile, carrossel com deslize e indicador de posição.
- **Informações:** badge da categoria, título (h1), preço grande e, logo abaixo, a legenda **"Preço consultado em dd/mm/aaaa, pode variar na Shopee."**
- **Botão primário:** "Ver oferta na Shopee" (ícone de link externo) → `/ir/[id]?origem=site`.
- **Botão secundário:** "Compartilhar no WhatsApp" → `https://wa.me/?text=` com o texto codificado:
  ```
  Olha que achado: {titulo} por {preço} 👇
  {URL absoluta da página do produto}?origem=whatsapp
  ```
- **Destaques:** os 3 destaques em tópicos com ícone de check.
- **Descrição:** texto completo.
- **"Veja também":** até 4 produtos visíveis da mesma categoria.
- **Mobile:** barra fixa no rodapé com o preço e o botão "Ver oferta na Shopee", que aparece após o usuário rolar além do botão principal.
- **Se `OFERTA_ACABOU`:** sem botão de oferta; mostra o aviso "Esta oferta acabou na Shopee." e a seção "Veja também" em destaque logo abaixo.
- **Se o produto não existir ou estiver oculto/ignorado/para revisar:** página 404 amigável com link para o catálogo.
- **Metadados:** `generateMetadata` com título, descrição e Open Graph (título, descrição, primeira imagem), para gerar prévia ao compartilhar no WhatsApp.
- **Origem do acesso:** se a URL tiver `?origem=whatsapp` ou `?origem=bio`, o botão de oferta deve repassar essa origem para `/ir/[id]`.

### 9.5 Link da bio (`/bio`)
- Página enxuta para o link da bio do Instagram: logo, frase curta e lista vertical dos 10 produtos publicados mais recentes (miniatura, título, preço e botão "Ver oferta" → `/ir/[id]?origem=bio`).
- Botão final "Ver todos os achados" → `/produtos`.

### 9.6 Sobre (`/sobre`) e Privacidade (`/privacidade`)
- **Sobre:** texto simples explicando que o site seleciona produtos da Shopee, que os links são de afiliado e como os produtos são escolhidos.
- **Privacidade:** texto simples dizendo que o site registra cliques de forma anônima (data, produto e origem), não coleta dados pessoais dos visitantes e não usa cookies de rastreamento de terceiros.

### 9.7 Rota de clique (`/ir/[id]/route.ts`)
1. Busca o produto. Se não existir ou o status não for `NO_AR` ou `PRECO_MUDOU`, redireciona para `/produtos/[id]` (que mostrará o aviso adequado).
2. Lê `origem` da query. Se não for `site`, `whatsapp` ou `bio`, usa `site`.
3. Registra um `Clique` com `produtoId` e `origem`.
4. Responde com redirecionamento **302** para `linkAfiliado`.
5. Não registre cliques de robôs: ignore user-agents que contenham `bot`, `crawler`, `spider` ou `facebookexternalhit` (o WhatsApp usa esse último para gerar prévias).

### 9.8 SEO e performance
- `sitemap.ts` com home, catálogo, páginas de produtos visíveis, bio, sobre e privacidade.
- `robots.ts` permitindo a vitrine e bloqueando `/painel` e `/ir`.
- Páginas do painel com `noindex`.
- Use `next/image` para todas as imagens.
- Páginas da vitrine renderizadas no servidor; revalide os dados após publicar, ocultar ou editar produtos (`revalidatePath`).

---

## 10. Painel da administradora (`/painel`)

### 10.1 Regras gerais
- **Linguagem simples. Termos proibidos na interface:** API, SKU, webhook, sync, uptime, margem, markup, status code, deploy. Use: "Preço na Shopee", "Comissão", "Cliques", "No ar", "Preço mudou", "Oferta acabou".
- **Navegação:** menu lateral no desktop; **barra inferior fixa no mobile** com 5 itens: Início, Revisar (com contador de pendentes), Adicionar, Produtos, Mais (abre Descobrir, Configurações e Sair).
- Todas as ações mostram **Toast** de confirmação. Ações destrutivas (Ignorar, Ocultar) pedem confirmação com **ConfirmDialog**.
- Todas as listas têm estado de **carregamento** (Skeleton), **vazio** (EmptyState) e **erro** (mensagem + botão "Tentar de novo").
- Todas as mutações são **Server Actions** que chamam `requireAdmin()` antes de qualquer coisa e validam a entrada com Zod.

### 10.2 Login (`/painel/login`)
- Campos "E-mail" e "Senha"; botão "Entrar".
- Credenciais vindas de `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` (bcrypt) no `.env`. Inclua no README um script `npm run gerar-senha` para criar o hash.
- Erro genérico: "E-mail ou senha incorretos."
- Após o login, vai para `/painel`. Um middleware protege todas as rotas de `/painel` (exceto o login) e redireciona quem não estiver logado.
- Link "Sair" encerra a sessão.

### 10.3 Início (`/painel`)
- Saudação: "Olá! Veja como estão seus achados."
- **4 cards de métricas** (grade 2×2 no mobile, 4 colunas no desktop):
  1. **Cliques da semana**, com a variação em relação à semana anterior (seta verde/vermelha + %).
  2. **Comissão pendente**, com o texto auxiliar "Aguardando confirmação da Shopee".
  3. **Comissão confirmada**, com o texto auxiliar "Já confirmada".
  4. **Produtos no ar**.
- **Card "Para revisar":** "Você tem {n} achados esperando revisão" + botão "Revisar agora". Oculto se `n = 0`.
- **Avisos** (só aparecem se houver):
  - "{n} ofertas acabaram e saíram da vitrine." → link para Meus produtos filtrado.
  - "{n} produtos mudaram de preço." → link para Meus produtos filtrado.
- **"Mais clicados da semana":** lista dos 5 produtos com miniatura, título e número de cliques.
- **Estado vazio (sem produtos):** "Você ainda não tem achados na vitrine. Comece colando um link da Shopee." + botão "Adicionar produto".

### 10.4 Para revisar (`/painel/revisar`)
- Topo: título "Para revisar" e contador "{n} achados esperando você".
- **Interruptor "Publicar automaticamente"** com o texto explicativo: "Quando ligado, novos achados sem avisos da IA vão direto para a vitrine." Desligado por padrão; salva em `Configuracao`.
- **ReviewCard** para cada produto `PARA_REVISAR`:
  - Foto, título, preço na Shopee, comissão em % e "Você ganha cerca de {R$} por venda".
  - **Alertas da IA** em caixa amarela com ícone, quando houver.
  - Botões grandes: **Publicar** (primário), **Editar** (secundário) e **Ignorar** (ghost, com confirmação).
- Ao publicar: muda o status para `NO_AR`, define `publicadoEm`, mostra o toast "Produto publicado na vitrine!" e remove o card da lista com uma animação suave.
- **Estado vazio:** "Tudo revisado! Novos achados aparecem aqui automaticamente." + botão "Descobrir produtos".

### 10.5 Adicionar produto (`/painel/adicionar`)
- Texto: "Cole o link de um produto da Shopee. A IA preenche o resto para você."
- Campo "Link do produto" + botão "Buscar produto".
- Fluxo:
  1. Valida se o link é da Shopee (`shopee.com.br` ou `shp.ee`). Se não for: "Esse link não parece ser da Shopee. Confira e tente de novo."
  2. Mostra etapas de carregamento: "Buscando produto..." → "Escrevendo a descrição...".
  3. Chama `ShopeeService.obterProduto` → `ShopeeService.gerarLinkAfiliado` → `AIService.gerarConteudo`.
  4. Cria o produto com status `PARA_REVISAR` e redireciona para a tela de edição.
- Se o produto já existir (mesmo `shopeeItemId`): "Esse produto já está na sua lista." + link para ele.
- Se `obterProduto` retornar `null`: "Não consegui encontrar esse produto. Confira o link."

### 10.6 Editar produto (`/painel/produtos/[id]`)
- Campos: Título (contador de caracteres, máx. 70), Descrição (textarea), 3 Destaques, Categoria (select).
- Somente leitura: preço na Shopee, data da consulta, comissão, ganho estimado e link original (com botão "Abrir na Shopee").
- Alertas da IA no topo, em caixa amarela.
- Botão "Gerar novamente com IA", que substitui título, descrição e destaques após confirmação.
- **Pré-visualização** de como o card fica na vitrine (ao lado no desktop, abaixo no mobile), atualizada enquanto ela digita.
- Ações conforme o status: "Salvar", "Salvar e publicar" (se `PARA_REVISAR`), "Ocultar da vitrine" / "Mostrar na vitrine", "Confirmar novo preço" (se `PRECO_MUDOU`).
- Validação: título obrigatório, descrição com pelo menos 20 caracteres, 3 destaques preenchidos.
- Aviso ao sair com alterações não salvas.

### 10.7 Descobrir produtos (`/painel/descobrir`)
- Campo de busca com placeholder "Ex.: organizador de cozinha" + botão "Buscar".
- Chips com as categorias permitidas nas Configurações.
- Resultados em cards: foto, nome, preço, comissão em %, "Você ganha cerca de {R$} por venda" e botão **"Adicionar"**.
- Ao adicionar: gera o link de afiliado e o conteúdo com IA, cria o produto como `PARA_REVISAR` (ou `NO_AR`, se a publicação automática estiver ligada e não houver alertas) e troca o botão do card para "Adicionado ✓".
- Produtos que já estão no banco aparecem com "Já está na sua lista".
- **Estado vazio:** "Nada encontrado para essa busca. Tente outras palavras."
- **Antes da primeira busca:** sugestões de termos clicáveis (ex.: "potes herméticos", "luminária", "organizador").

### 10.8 Meus produtos (`/painel/produtos`)
- **Abas/contadores de status:** Todos, No ar, Preço mudou, Oferta acabou, Ocultos (com a contagem de cada um). Filtro via query param `?status=`.
- Busca por título.
- Ordenação: Mais clicados, Mais recentes, Menor preço.
- **Lista:** no mobile, cards empilhados; no desktop, tabela com miniatura, título, preço, StatusBadge, cliques (total e últimos 7 dias) e ações.
- **Ações por produto:** Editar, Ocultar/Mostrar, **Copiar link** (copia a URL da página do produto no site com `?origem=whatsapp` e mostra o toast "Link copiado!") e **Ver na vitrine**.
- **Produto `PRECO_MUDOU`:** mostra o preço anterior riscado e o novo, além do botão "Confirmar novo preço".
- Estado vazio por aba (ex.: "Nenhuma oferta acabou. Ótimo!").

### 10.9 Configurações (`/painel/configuracoes`)
- **Conta da Shopee:** card com o texto "Modo de demonstração: os produtos e comissões são simulados." e um botão desabilitado "Conectar conta da Shopee (em breve)".
- **Categorias que a IA pode sugerir:** checkboxes das 5 categorias (pelo menos 1 obrigatória).
- **Frequência da busca de novos produtos:** opções "Todo dia (recomendado)", "A cada 2 dias", "Uma vez por semana".
- **Publicação automática:** o mesmo interruptor da tela Para revisar (sincronizado).
- Botão "Salvar alterações" com toast de confirmação.

---

## 11. Rotina de atualização (`scripts/atualizar.ts`)

Comando: `npm run atualizar`. Para cada produto com status `NO_AR`, `PRECO_MUDOU` ou `OFERTA_ACABOU`:
1. Chama `ShopeeService.consultarProduto(shopeeItemId)`.
2. Se `null` ou `disponivel: false` → status `OFERTA_ACABOU`.
3. Se o preço mudou → guarda `precoAnterior`, atualiza `precoShopee` e muda o status para `PRECO_MUDOU`.
4. Se estava `OFERTA_ACABOU` e voltou a ficar disponível → `NO_AR`.
5. Sempre atualiza `precoConsultadoEm`.
6. No fim, imprime um resumo: "{n} verificados, {n} mudaram de preço, {n} ofertas acabaram, {n} voltaram".

Inclua também `npm run buscar-novos`: usa as categorias e a configuração para chamar `buscarOfertas`, gera conteúdo com IA para os itens que ainda não estão no banco (máx. 5 por execução) e os cria como `PARA_REVISAR` (ou `NO_AR`, se a publicação automática estiver ligada e não houver alertas).

No README, explique que, em produção, esses dois scripts rodariam por agendamento (cron).

---

## 12. Dados de demonstração (`prisma/seed.ts`)

- Configuração padrão: todas as categorias, frequência diária, publicação automática desligada.
- A partir do catálogo mock, crie **22 produtos**: 14 `NO_AR`, 3 `PARA_REVISAR` (pelo menos 1 com alerta da IA), 2 `PRECO_MUDOU`, 1 `OFERTA_ACABOU`, 1 `OCULTO` e 1 `IGNORADO`.
- Distribua **~600 cliques** nos últimos 30 dias, com origens variadas (60% site, 30% WhatsApp, 10% bio), concentrando mais cliques em alguns produtos para que os rankings façam sentido.
- Crie **~25 comissões**: as dos últimos 30 dias como `PENDENTE` e as mais antigas como `CONFIRMADA`, com valores coerentes com preço × comissão.
- **Imagens:** gere SVGs placeholder em `public/produtos/` (fundo em tom suave da paleta, ícone simples da categoria e o nome do produto). **Não use imagens nem nomes de marcas reais.**
- Comandos: `npx prisma migrate dev` e `npx prisma db seed` (configure o seed no `package.json`).

---

## 13. Qualidade

### 13.1 Acessibilidade
- HTML semântico (`header`, `nav`, `main`, `footer`, títulos em ordem).
- `alt` descritivo em todas as imagens de produto.
- Foco visível em todos os elementos interativos; navegação completa por teclado.
- Modais e gavetas prendem o foco e fecham com `Esc`.
- Contraste WCAG AA.

### 13.2 Segurança
- Senha da administradora somente como hash bcrypt no `.env`.
- Sessão em cookie `httpOnly`, `sameSite=lax` e `secure` em produção.
- `requireAdmin()` em todas as Server Actions e páginas do painel.
- Validação Zod em todas as entradas.
- A rota `/ir/[id]` só redireciona para o `linkAfiliado` salvo no banco, nunca para uma URL vinda da query (evita redirecionamento aberto).

### 13.3 Testes (Vitest)
- `calc.ts`: ganho estimado, métricas da semana e variação percentual.
- `podeMudarStatus`: transições permitidas e proibidas.
- Validação de link da Shopee (casos válidos e inválidos).
- `ShopeeService` mock: busca por termo sem acento e filtro por categoria.
- `AIService` mock: sempre retorna 3 destaques e uma categoria válida.

### 13.4 Scripts no `package.json`
`dev`, `build`, `start`, `lint`, `test`, `atualizar`, `buscar-novos`, `gerar-senha`, `db:reset` (apaga o banco, roda as migrações e o seed).

### 13.5 `.env.example`
```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="troque-por-uma-string-aleatoria-com-32-caracteres-ou-mais"
ADMIN_EMAIL="admin@casaeconforto.local"
ADMIN_PASSWORD_HASH=""
SITE_URL="http://localhost:3000"
SHOPEE_MODE="mock"
AI_API_KEY=""
```

---

## 14. Fases de execução

Ao final de cada fase, rode `npm run dev`, confira no navegador (tamanhos mobile 390px e desktop 1280px) e corrija os problemas antes de seguir.

1. **Base:** criar o projeto, configurar Tailwind com os tokens, fontes, Prisma, schema, catálogo mock, seed e imagens placeholder.
2. **Componentes base** da seção 6.
3. **Serviços:** ShopeeService e AIService mock, `calc.ts`, `podeMudarStatus` e testes.
4. **Vitrine:** layout, Home, Catálogo, Página do produto, Bio, Sobre, Privacidade e rota `/ir/[id]`.
5. **Autenticação:** login, middleware, sessão e logout.
6. **Painel:** Início, Para revisar, Adicionar, Editar, Descobrir, Meus produtos e Configurações.
7. **Rotinas:** `atualizar` e `buscar-novos`.
8. **Acabamento:** SEO (sitemap, robots, Open Graph), estados vazios e de erro, acessibilidade, `npm run lint`, `npm run test` e `npm run build` sem erros.
9. **README:** visão geral, como rodar passo a passo, credenciais de demonstração, aviso de que os dados são simulados, onde trocar os mocks pelas integrações reais e a seção "Decisões".

---

## 15. Fora do escopo (não implementar)

Checkout, carrinho, pagamentos, frete, estoque, pedidos, cupons, cadastro de visitantes, avaliações, depoimentos, selos de segurança, integração real com a Shopee, Mercado Livre, Amazon, notificações por WhatsApp/e-mail e múltiplas administradoras.

---

## 16. Critérios de pronto (checklist final)

- [ ] `npm install`, `npm run db:reset` e `npm run dev` funcionam sem nenhuma conta externa.
- [ ] A vitrine mostra apenas produtos `NO_AR` e `PRECO_MUDOU`.
- [ ] Clicar em "Ver oferta" registra o clique com a origem correta e redireciona.
- [ ] O aviso de afiliado aparece no rodapé de todas as páginas da vitrine.
- [ ] A legenda "Preço consultado em..." aparece em todas as páginas de produto.
- [ ] O compartilhamento no WhatsApp abre com o texto pronto e o link com `?origem=whatsapp`.
- [ ] O painel exige login, e nenhuma tela usa os termos proibidos.
- [ ] Colar um link da Shopee cria um produto para revisar, com conteúdo gerado.
- [ ] Publicar, editar, ocultar, ignorar e confirmar novo preço funcionam e atualizam a vitrine.
- [ ] `npm run atualizar` muda status e preços e imprime o resumo.
- [ ] Todas as telas funcionam bem em 390px e em 1280px.
- [ ] `npm run lint`, `npm run test` e `npm run build` passam sem erros.
