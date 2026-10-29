import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados...");

  // Limpa registros existentes
  await prisma.clique.deleteMany({});
  await prisma.comissao.deleteMany({});
  await prisma.produto.deleteMany({});
  await prisma.configuracao.deleteMany({});

  // 1. Configuração padrão
  const todasCategorias = [
    "cozinha-mesa",
    "conforto-banho",
    "decoracao-aromas",
    "utilidades",
    "organizacao"
  ];

  await prisma.configuracao.upsert({
    where: { id: 1 },
    update: {
      categoriasPermitidas: JSON.stringify(todasCategorias),
      frequenciaBusca: "DIARIA",
      publicarAutomaticamente: false
    },
    create: {
      id: 1,
      categoriasPermitidas: JSON.stringify(todasCategorias),
      frequenciaBusca: "DIARIA",
      publicarAutomaticamente: false
    }
  });

  // 2. Carrega catálogo mock
  const catalogoPath = path.join(process.cwd(), "prisma/data/catalogo-shopee-mock.json");
  const catalogo: Array<{
    shopeeItemId: string;
    nome: string;
    descricaoOriginal: string;
    preco: number;
    comissaoPercentual: number;
    categoria: string;
    imagens: string[];
    linkOriginal: string;
    disponivel: boolean;
  }> = JSON.parse(fs.readFileSync(catalogoPath, "utf8"));

  // 22 produtos a selecionar:
  // 14 NO_AR (índices 0 a 13)
  // 3 PARA_REVISAR (índices 14, 15, 16) - índice 15 com alerta
  // 2 PRECO_MUDOU (índices 17, 18)
  // 1 OFERTA_ACABOU (índice 19)
  // 1 OCULTO (índice 20)
  // 1 IGNORADO (índice 21)

  const now = new Date();
  const produtosCriados: Array<{ id: string; preco: number; comissaoPercentual: number; status: string }> = [];

  for (let i = 0; i < 22; i++) {
    const item = catalogo[i];
    let status = "NO_AR";
    let publicadoEm: Date | null = new Date(now.getTime() - (22 - i) * 24 * 60 * 60 * 1000);
    let precoShopee = item.preco;
    let precoAnterior: number | null = null;
    let alertasIA = "[]";

    if (i >= 0 && i < 14) {
      status = "NO_AR";
    } else if (i === 14) {
      status = "PARA_REVISAR";
      publicadoEm = null;
    } else if (i === 15) {
      status = "PARA_REVISAR";
      publicadoEm = null;
      alertasIA = JSON.stringify([
        "Descrição original resumida: verifique dimensões exatas na Shopee antes de publicar."
      ]);
    } else if (i === 16) {
      status = "PARA_REVISAR";
      publicadoEm = null;
    } else if (i === 17) {
      status = "PRECO_MUDOU";
      precoAnterior = Number((item.preco * 1.15).toFixed(2));
      precoShopee = item.preco;
    } else if (i === 18) {
      status = "PRECO_MUDOU";
      precoAnterior = Number((item.preco * 0.85).toFixed(2));
      precoShopee = item.preco;
    } else if (i === 19) {
      status = "OFERTA_ACABOU";
    } else if (i === 20) {
      status = "OCULTO";
    } else if (i === 21) {
      status = "IGNORADO";
      publicadoEm = null;
    }

    // Gerar 3 destaques simples coerentes
    const destaquesPadrao = [
      "Design pensado para o dia a dia",
      "Excelente durabilidade e acabamento",
      "Ótimo custo-benefício comprovado"
    ];

    const prod = await prisma.produto.create({
      data: {
        shopeeItemId: item.shopeeItemId,
        titulo: item.nome,
        descricao: item.descricaoOriginal,
        destaques: JSON.stringify(destaquesPadrao),
        categoria: item.categoria,
        imagens: JSON.stringify(item.imagens),
        precoShopee,
        precoAnterior,
        precoConsultadoEm: new Date(now.getTime() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000),
        comissaoPercentual: item.comissaoPercentual,
        linkOriginal: item.linkOriginal,
        linkAfiliado: `${item.linkOriginal}?af_id=DEMO&sub_id=seed`,
        status,
        alertasIA,
        publicadoEm,
        criadoEm: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000)
      }
    });

    produtosCriados.push({
      id: prod.id,
      preco: prod.precoShopee,
      comissaoPercentual: prod.comissaoPercentual,
      status: prod.status
    });
  }

  console.log(`22 produtos criados com sucesso.`);

  // 3. Gerar ~600 cliques nos últimos 30 dias
  // 60% site, 30% whatsapp, 10% bio
  // Concentrar mais cliques nos produtos NO_AR populares (produtos 0, 1, 6, 12, 17)
  const produtosVisiveis = produtosCriados.filter(
    (p) => p.status === "NO_AR" || p.status === "PRECO_MUDOU"
  );

  const origens = [
    ...Array(60).fill("site"),
    ...Array(30).fill("whatsapp"),
    ...Array(10).fill("bio")
  ];

  const totalCliques = 600;
  const cliquesData: Array<{ produtoId: string; origem: string; criadoEm: Date }> = [];

  for (let c = 0; c < totalCliques; c++) {
    // Probabilidade ponderada: os primeiros 5 produtos têm 65% dos cliques
    let prodIndex: number;
    const r = Math.random();
    if (r < 0.65) {
      prodIndex = Math.floor(Math.random() * Math.min(5, produtosVisiveis.length));
    } else {
      prodIndex = Math.floor(Math.random() * produtosVisiveis.length);
    }
    const produtoEscolhido = produtosVisiveis[prodIndex];

    const origem = origens[Math.floor(Math.random() * origens.length)];
    // Distribuído nos últimos 30 dias (mais cliques na última semana)
    const diasAtras = Math.random() < 0.5 ? Math.random() * 7 : Math.random() * 30;
    const dataClique = new Date(now.getTime() - diasAtras * 24 * 60 * 60 * 1000);

    cliquesData.push({
      produtoId: produtoEscolhido.id,
      origem,
      criadoEm: dataClique
    });
  }

  await prisma.clique.createMany({
    data: cliquesData
  });

  console.log(`${totalCliques} cliques registrados nos últimos 30 dias.`);

  // 4. Gerar ~25 comissões
  // Últimos 30 dias: PENDENTE
  // Mais de 30 dias: CONFIRMADA
  const comissoesData: Array<{
    produtoId: string;
    valor: number;
    status: string;
    data: Date;
  }> = [];

  for (let k = 0; k < 25; k++) {
    const prod = produtosVisiveis[k % produtosVisiveis.length];
    const valor = Number((prod.preco * prod.comissaoPercentual).toFixed(2));
    
    // 15 mais recentes (últimos 30 dias) -> PENDENTE
    // 10 mais antigas (31 a 60 dias) -> CONFIRMADA
    const isPendente = k < 15;
    const diasAtras = isPendente ? 1 + Math.random() * 28 : 31 + Math.random() * 30;
    const dataComissao = new Date(now.getTime() - diasAtras * 24 * 60 * 60 * 1000);

    comissoesData.push({
      produtoId: prod.id,
      valor,
      status: isPendente ? "PENDENTE" : "CONFIRMADA",
      data: dataComissao
    });
  }

  await prisma.comissao.createMany({
    data: comissoesData
  });

  console.log(`25 comissões registradas (15 pendentes, 10 confirmadas).`);
  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

