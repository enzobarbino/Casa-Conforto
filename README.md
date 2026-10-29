# Casa & Conforto 🏡✨

> Vitrine de afiliados da Shopee com painel administrativo e curadoria assistida por inteligência artificial.

Projeto de estudo e portfólio desenvolvido com arquitetura moderna, responsividade total (mobile-first), acessibilidade (WCAG AA) e execução 100% local — **sem necessidade de nenhuma conta externa ou chaves pagas** para rodar a demonstração.

---

## 📋 Sumário
- [Visão Geral e Modelo de Negócio](#-visão-geral-e-modelo-de-negócio)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
- [Credenciais de Demonstração](#-credenciais-de-demonstração)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Camada de Serviços (Mocks vs. Integrações Reais)](#-camada-de-serviços-mocks-vs-integrações-reais)
- [Decisões Técnicas de Projeto](#-decisões-técnicas-de-projeto)

---

## 🎯 Visão Geral e Modelo de Negócio

O site **não vende produtos diretamente**. Não há carrinho, checkout, estoque nem processamento de pagamento.
1. A administradora (dona do site) seleciona ou busca produtos da Shopee através do painel.
2. A inteligência artificial gera títulos acolhedores (máx. 70 caracteres), descrições focadas em praticidade e 3 destaques objetivos.
3. A administradora revisa o produto antes de colocá-lo no ar (a publicação automática pode ser ativada nas configurações).
4. O visitante acessa a vitrine (pelo computador ou celular via links do WhatsApp/Instagram) e clica em **"Ver oferta na Shopee"**.
5. O link passa pela rota interna `/ir/[id]`, que:
   - Filtra robôs e crawlers de prévia de links.
   - Registra o clique e sua origem (`site`, `whatsapp` ou `bio`).
   - Redireciona via HTTP 302 com o link parametrizado de afiliado.
6. A dona do site recebe comissões pelas vendas concluídas na Shopee.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions, TypeScript em modo `strict`)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com Design System customizado "Lumina"
- **Banco de Dados:** [Prisma ORM](https://www.prisma.io/) com **SQLite** local (`prisma/dev.db`)
- **Autenticação:** [iron-session](https://github.com/vvo/iron-session) (cookies assinados e selados `httpOnly`) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Validação de Dados:** [Zod](https://zod.dev/)
- **Ícones:** [lucide-react](https://lucide.dev/)
- **Testes Unitários:** [Vitest](https://vitest.dev/)
- **Tipografia:** Google Fonts (*Plus Jakarta Sans* para títulos e *Inter* para corpo)

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js versão 20 ou superior (testado com Node.js v22).
- NPM.

### Passo a Passo

1. **Clone ou abra o repositório:**
   ```bash
   cd "Casa & Conforto"
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o arquivo `.env.example` para `.env` (o arquivo `.env` já vem pré-configurado para uso local):
   ```bash
   cp .env.example .env
   ```

4. **Inicialize o banco de dados e execute o seed:**
   ```bash
   npm run db:reset
   ```
   *Este comando cria o banco SQLite local (`prisma/dev.db`), aplica as migrações e popula o banco com 22 produtos, ~600 cliques e ~25 comissões demonstrativas.*

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Acesse as interfaces no navegador:**
   - **Vitrine pública:** [http://localhost:3000](http://localhost:3000)
   - **Catálogo com filtros:** [http://localhost:3000/produtos](http://localhost:3000/produtos)
   - **Página de link da bio (Instagram):** [http://localhost:3000/bio](http://localhost:3000/bio)
   - **Painel administrativo:** [http://localhost:3000/painel](http://localhost:3000/painel)

---

## 🔐 Credenciais de Demonstração

Para acessar o painel administrativo (`/painel`), utilize as credenciais padrão configuradas no `.env`:

- **E-mail:** `admin@casaeconforto.local`
- **Senha:** `admin123`

### Como gerar um novo hash de senha:
Caso queira alterar a senha da administradora, execute:
```bash
npm run gerar-senha novaSenhaAqui
```
O script exibirá a linha pronta para ser colada na variável `ADMIN_PASSWORD_HASH` do arquivo `.env`.

---

## 📁 Estrutura do Projeto

```
├── app/
│   ├── (vitrine)/
│   │   ├── layout.tsx              # Header com busca e Footer com aviso legal
│   │   ├── page.tsx                # Home (Hero, Categorias, Mais Clicados, Novidades, Como Funciona)
│   │   ├── produtos/page.tsx       # Catálogo com filtros de categoria e preço
│   │   ├── produtos/[id]/page.tsx  # Página detalhada com galeria, destaques e WhatsApp share
│   │   ├── bio/page.tsx            # Link da bio enxuto para Instagram
│   │   ├── sobre/page.tsx          # Sobre o projeto e curadoria
│   │   └── privacidade/page.tsx    # Política de privacidade e aviso de cliques
│   ├── ir/[id]/route.ts            # Rota de clique e redirecionamento de afiliado
│   ├── painel/
│   │   ├── login/page.tsx          # Tela de login da administradora
│   │   └── (protegido)/
│   │       ├── layout.tsx          # Sidebar (desktop) e barra com 5 itens (mobile)
│   │       ├── page.tsx            # Início: métricas semanais e mais clicados
│   │       ├── revisar/page.tsx    # Produtos para revisar com ReviewCard
│   │       ├── adicionar/page.tsx  # Adição rápida colando link da Shopee
│   │       ├── descobrir/page.tsx  # Busca e sugestões do catálogo da Shopee
│   │       ├── produtos/page.tsx   # Meus produtos com abas e estatísticas
│   │       ├── produtos/[id]/page.tsx # Edição completa com prévia em tempo real
│   │       └── configuracoes/page.tsx # Categorias, frequência e publicação auto
│   ├── sitemap.ts                  # Sitemap dinâmico com produtos no ar
│   ├── robots.ts                   # Robots.txt protegendo o painel e rotas internas
│   ├── not-found.tsx               # Página 404 amigável
│   └── layout.tsx                  # Layout raiz com fontes e tokens CSS
├── components/
│   ├── ui/                         # Design System Lumina (Button, Card, Badge, etc.)
│   ├── vitrine/                    # Componentes da vitrine (Header, Footer, ProductCard, etc.)
│   └── painel/                     # Componentes do painel (PainelNav, ReviewCard, etc.)
├── lib/
│   ├── db.ts                       # Singleton do Prisma Client
│   ├── auth.ts                     # Autenticação segura via iron-session e bcrypt
│   ├── calc.ts                     # Cálculos de comissão, ganho estimado e métricas
│   ├── status.ts                   # Máquina de estados e transições permitidas
│   ├── validation.ts               # Schemas de validação Zod
│   ├── actions/                    # Server Actions para mutações protegidas
│   └── services/
│       ├── shopee/                 # Serviço de integração da Shopee (Mock e Tipos)
│       └── ai/                     # Serviço de curadoria com IA (Mock e LLM)
├── prisma/
│   ├── schema.prisma               # Modelo relacional no SQLite
│   ├── seed.ts                     # Seed com 22 produtos, 600 cliques e 25 comissões
│   └── data/catalogo-shopee-mock.json # 30 produtos fictícios sem marcas reais
├── public/produtos/                # SVGs das miniaturas dos produtos
├── scripts/
│   ├── atualizar.ts                # Rotina de atualização de preços e disponibilidade
│   ├── buscar-novos.ts             # Rotina de busca de novas ofertas da Shopee
│   ├── gerar-placeholders.ts       # Gerador dos 30 SVGs com a identidade visual
│   └── gerar-senha.ts              # Utilitário para gerar hash bcrypt
└── tests/                          # Suíte de testes unitários com Vitest
```

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor local de desenvolvimento na porta 3000 |
| `npm run build` | Compila o projeto em modo produção com checagem de tipos |
| `npm run start` | Inicia o servidor de produção compilado |
| `npm run lint` | Executa o ESLint em todo o código |
| `npm run test` | Executa os testes unitários via Vitest |
| `npm run db:reset` | Reseta o banco SQLite, roda as migrações e executa o seed |
| `npm run atualizar` | Roda a rotina de atualização de preços e disponibilidade |
| `npm run buscar-novos` | Garimpa novas ofertas e gera conteúdo com IA |
| `npm run gerar-senha [senha]` | Cria o hash bcrypt para a senha informada |

> **Nota sobre agendamento (Cron):** Em um ambiente de produção real, os comandos `npm run atualizar` e `npm run buscar-novos` seriam configurados para rodar periodicamente via agendador de tarefas (como cron jobs ou tarefas agendadas em nuvem).

---

## 🔌 Camada de Serviços (Mocks vs. Integrações Reais)

O projeto foi projetado com uma clara separação em camadas de serviço (`lib/services/`), permitindo trocar as simulações locais pelas integrações reais de forma transparente:

### 1. Shopee (`lib/services/shopee/`)
- **Implementação atual:** `mock.ts` lê os produtos de `prisma/data/catalogo-shopee-mock.json`, simula latência de rede (300–800ms) e variações aleatórias de preço/estoque na rotina de atualização.
- **Onde trocar pela API real:** Em `lib/services/shopee/index.ts`, implemente a chamada à *Shopee Affiliate Open API* utilizando as credenciais de parceiro da Shopee.

### 2. Inteligência Artificial (`lib/services/ai/`)
- **Implementação atual:** `mock.ts` gera títulos, resumos acolhedores e 3 destaques objetivos a partir das características do produto recebido, respeitando estritamente o tamanho máximo de caracteres e as 5 categorias fixas.
- **Onde ativar o modelo de linguagem real:** Em `lib/services/ai/llm.ts`, defina a variável `AI_API_KEY` no arquivo `.env`. O serviço fará chamadas ao modelo e, caso haja qualquer indisponibilidade na API ou formato inesperado, o sistema faz fallback automático para o mock com aviso de revisão.

---

## 💡 Decisões Técnicas de Projeto

1. **Design System "Lumina" construído do zero:** Em conformidade com o requisito do projeto de não utilizar bibliotecas genéricas prontas (shadcn, MUI, Chakra), todos os componentes de interface (`components/ui/`) foram implementados do zero com Tailwind CSS, foco visível, contraste WCAG AA e alvos de toque mínimos de 44px para dispositivos móveis.
2. **SQLite com JSON serializado:** Como o SQLite não possui suporte nativo a tipos array nem enums, listas (como caminhos de imagens, destaques e alertas da IA) são armazenadas como strings JSON válidas no banco e tipadas/validadas na aplicação com Zod e TypeScript.
3. **Tratamento de caminhos com caracteres especiais no Windows:** O workspace local continha o caractere ampersand (`&`) no nome do diretório (`Casa & Conforto`). Como o `cmd.exe` do Windows interpreta `&` como separador de comandos quando executado via scripts npm, configurou-se `script-shell=powershell` no arquivo `.npmrc` e caminhos diretos com `node`, garantindo execução estável tanto no Windows quanto em ambientes Unix/Linux.
4. **Máquina de Estados de Status:** As transições de status dos produtos (`PARA_REVISAR`, `NO_AR`, `PRECO_MUDOU`, `OFERTA_ACABOU`, `OCULTO`, `IGNORADO`) foram centralizadas na função `podeMudarStatus` em `lib/status.ts`, diferenciando permissões manuais da administradora e automáticas das rotinas.
5. **Prevenção de Redirecionamento Aberto:** A rota `/ir/[id]` só realiza redirecionamento para a URL salva previamente no banco de dados na coluna `linkAfiliado`, jamais aceitando URLs arbitrárias via query string.

---

## 📄 Licença

Projeto desenvolvido para fins de estudo e portfólio.
