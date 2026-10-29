import "dotenv/config";
import { prisma } from "../lib/db";
import fs from "fs";
import path from "path";

interface ProdutoJson {
  mlItemId: string;
  tituloOriginal?: string;
  titulo: string;
  descricao: string;
  destaques: string[];
  categoria: string;
  preco: number;
  precoAnterior: number | null;
  precoConsultadoEm: string;
  linkAnuncio: string;
  imagens: string[];
  atributos: Array<{ nome: string; valor: string }>;
  alertas: string[];
}

async function importarProdutos() {
  console.log("Iniciando importação de produtos do Mercado Livre...");

  const jsonPath = path.join(process.cwd(), "prisma/data/produtos-mercadolivre.json");
  if (!fs.existsSync(jsonPath)) {
    console.error(`Arquivo não encontrado: ${jsonPath}`);
    process.exit(1);
  }

  const produtos: ProdutoJson[] = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  console.log(`Lidos ${produtos.length} produtos do arquivo JSON.`);

  let criados = 0;
  let ignorados = 0;

  for (let i = 0; i < produtos.length; i++) {
    const p = produtos[i];
    const isNoAr = i < 7; // Primeiros 7 NO_AR, últimos 3 PARA_REVISAR

    const existente = await prisma.produto.findUnique({
      where: { mlItemId: p.mlItemId },
    });

    if (existente) {
      console.log(`[IGNORADO] ${p.mlItemId} já cadastrado no banco.`);
      ignorados++;
      continue;
    }

    const dataColeta = new Date(p.precoConsultadoEm);

    await prisma.produto.create({
      data: {
        mlItemId: p.mlItemId,
        titulo: p.titulo,
        descricao: p.descricao,
        descricaoOriginal: p.tituloOriginal || p.titulo,
        destaques: p.destaques,
        categoria: p.categoria,
        imagens: p.imagens,
        atributos: p.atributos || [],
        preco: p.preco,
        precoAnterior: null,
        precoConsultadoEm: dataColeta,
        comissaoPercentual: null,
        linkAnuncio: p.linkAnuncio,
        linkAfiliado: null,
        status: isNoAr ? "NO_AR" : "PARA_REVISAR",
        alertas: p.alertas || [],
        publicadoEm: isNoAr ? dataColeta : null,
      },
    });

    console.log(`[CRIADO] ${p.mlItemId} -> ${isNoAr ? "NO_AR" : "PARA_REVISAR"}: ${p.titulo}`);
    criados++;
  }

  console.log(`\nImportação concluída!`);
  console.log(`- Produtos criados: ${criados}`);
  console.log(`- Produtos já existentes (ignorados): ${ignorados}`);
  console.log(`- Total no banco: ${await prisma.produto.count()}`);
}

importarProdutos()
  .catch((e) => {
    console.error("Erro na importação:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

