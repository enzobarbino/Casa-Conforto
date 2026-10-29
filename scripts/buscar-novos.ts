import { PrismaClient } from "@prisma/client";
import { MockShopeeService } from "../lib/services/shopee/mock";
import { MockAIService } from "../lib/services/ai/mock";

const prisma = new PrismaClient();
const shopeeService = new MockShopeeService();
const aiService = new MockAIService();

async function main() {
  console.log("Iniciando rotina de busca de novas ofertas da Shopee...");

  // 1. Lê a configuração salva no banco
  const config = await prisma.configuracao.findFirst();
  let categorias = [
    "cozinha-mesa",
    "conforto-banho",
    "decoracao-aromas",
    "utilidades",
    "organizacao",
  ];

  if (config?.categoriasPermitidas) {
    try {
      categorias = JSON.parse(config.categoriasPermitidas);
    } catch {}
  }

  const publicarAuto = config?.publicarAutomaticamente ?? false;

  // 2. Busca ofertas
  const ofertas = await shopeeService.buscarOfertas({
    categorias,
    limite: 30,
  });

  // 3. Checa quais já estão no banco
  const existentes = await prisma.produto.findMany({
    select: { shopeeItemId: true },
  });
  const existentesSet = new Set(existentes.map((e) => e.shopeeItemId));

  const candidatos = ofertas.filter((o) => !existentesSet.has(o.shopeeItemId));
  const paraProcessar = candidatos.slice(0, 5); // máx. 5 por execução

  console.log(
    `Ofertas candidatas: ${candidatos.length}. Processando até 5 novos achados...`
  );

  let criados = 0;
  for (const oferta of paraProcessar) {
    const linkAfiliado = await shopeeService.gerarLinkAfiliado(
      oferta.linkOriginal,
      "cron"
    );
    const conteudo = await aiService.gerarConteudo(oferta);

    let status = "PARA_REVISAR";
    let publicadoEm: Date | null = null;

    if (publicarAuto && (!conteudo.alertas || conteudo.alertas.length === 0)) {
      status = "NO_AR";
      publicadoEm = new Date();
    }

    await prisma.produto.create({
      data: {
        shopeeItemId: oferta.shopeeItemId,
        titulo: conteudo.titulo,
        descricao: conteudo.descricao,
        destaques: JSON.stringify(conteudo.destaques),
        categoria: conteudo.categoria,
        imagens: JSON.stringify(oferta.imagens),
        precoShopee: oferta.preco,
        precoConsultadoEm: new Date(),
        comissaoPercentual: oferta.comissaoPercentual,
        linkOriginal: oferta.linkOriginal,
        linkAfiliado,
        status,
        alertasIA: JSON.stringify(conteudo.alertas),
        publicadoEm,
      },
    });

    criados++;
    console.log(
      `[${status === "NO_AR" ? "PUBLICADO DIRETO" : "PARA REVISAR"}] ${conteudo.titulo}`
    );
  }

  console.log("\n==========================================");
  console.log(
    `Busca de novos concluída:\n${candidatos.length} novos disponíveis, ${criados} adicionados ao banco com sucesso.`
  );
  console.log("==========================================\n");
}

main()
  .catch((e) => {
    console.error("Erro na busca de novos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

