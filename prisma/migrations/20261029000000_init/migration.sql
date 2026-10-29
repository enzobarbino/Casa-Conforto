-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StatusProduto" AS ENUM ('PARA_REVISAR', 'NO_AR', 'PRECO_MUDOU', 'OFERTA_ACABOU', 'OCULTO', 'IGNORADO');

-- CreateEnum
CREATE TYPE "OrigemClique" AS ENUM ('SITE', 'WHATSAPP', 'BIO');

-- CreateEnum
CREATE TYPE "StatusComissao" AS ENUM ('PENDENTE', 'CONFIRMADA');

-- CreateEnum
CREATE TYPE "FrequenciaBusca" AS ENUM ('DIARIA', 'A_CADA_2_DIAS', 'SEMANAL');

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "mlItemId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "descricaoOriginal" TEXT NOT NULL DEFAULT '',
    "destaques" TEXT[],
    "categoria" TEXT NOT NULL,
    "mlCategoriaId" TEXT,
    "imagens" TEXT[],
    "atributos" JSONB NOT NULL DEFAULT '[]',
    "preco" DECIMAL(10,2) NOT NULL,
    "precoAnterior" DECIMAL(10,2),
    "precoConsultadoEm" TIMESTAMP(3) NOT NULL,
    "comissaoPercentual" DECIMAL(5,4),
    "linkAnuncio" TEXT NOT NULL,
    "linkAfiliado" TEXT,
    "status" "StatusProduto" NOT NULL DEFAULT 'PARA_REVISAR',
    "alertas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publicadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clique" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "origem" "OrigemClique" NOT NULL DEFAULT 'SITE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comissao" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "StatusComissao" NOT NULL DEFAULT 'PENDENTE',
    "data" TIMESTAMP(3) NOT NULL,
    "observacao" TEXT NOT NULL DEFAULT '',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "categoriasPermitidas" TEXT[],
    "termosBusca" TEXT[],
    "frequenciaBusca" "FrequenciaBusca" NOT NULL DEFAULT 'DIARIA',
    "publicarAutomaticamente" BOOLEAN NOT NULL DEFAULT false,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenMercadoLivre" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "mlUserId" TEXT NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenMercadoLivre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Produto_mlItemId_key" ON "Produto"("mlItemId");

-- CreateIndex
CREATE INDEX "Produto_status_idx" ON "Produto"("status");

-- CreateIndex
CREATE INDEX "Produto_categoria_idx" ON "Produto"("categoria");

-- CreateIndex
CREATE INDEX "Clique_produtoId_idx" ON "Clique"("produtoId");

-- CreateIndex
CREATE INDEX "Clique_criadoEm_idx" ON "Clique"("criadoEm");

-- CreateIndex
CREATE INDEX "Comissao_status_idx" ON "Comissao"("status");

-- CreateIndex
CREATE INDEX "Comissao_data_idx" ON "Comissao"("data");

-- AddForeignKey
ALTER TABLE "Clique" ADD CONSTRAINT "Clique_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

