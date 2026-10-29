import "dotenv/config";
import { prisma } from "../lib/db";

async function main() {
  console.log("Iniciando seed de configuração padrão...");

  const todasCategorias = [
    "cozinha-mesa",
    "conforto-banho",
    "decoracao-aromas",
    "utilidades",
    "organizacao",
  ];

  await prisma.configuracao.upsert({
    where: { id: 1 },
    update: {
      categoriasPermitidas: todasCategorias,
      frequenciaBusca: "DIARIA",
      publicarAutomaticamente: false,
    },
    create: {
      id: 1,
      categoriasPermitidas: todasCategorias,
      frequenciaBusca: "DIARIA",
      publicarAutomaticamente: false,
    },
  });

  console.log("Configuração padrão criada com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
