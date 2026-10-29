-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopeeItemId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "destaques" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "imagens" TEXT NOT NULL,
    "precoShopee" REAL NOT NULL,
    "precoAnterior" REAL,
    "precoConsultadoEm" DATETIME NOT NULL,
    "comissaoPercentual" REAL NOT NULL,
    "linkOriginal" TEXT NOT NULL,
    "linkAfiliado" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "alertasIA" TEXT NOT NULL DEFAULT '[]',
    "publicadoEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Clique" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produtoId" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Clique_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comissao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produtoId" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    CONSTRAINT "Comissao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "categoriasPermitidas" TEXT NOT NULL,
    "frequenciaBusca" TEXT NOT NULL,
    "publicarAutomaticamente" BOOLEAN NOT NULL DEFAULT false,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Produto_shopeeItemId_key" ON "Produto"("shopeeItemId");

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
