import { PrismaClient } from "@prisma/client";
import { MockShopeeService } from "../lib/services/shopee/mock";
import { podeMudarStatus } from "../lib/status";

const prisma = new PrismaClient();
const shopeeService = new MockShopeeService();

async function main() {
  console.log("Iniciando rotina de atualização de preços e disponibilidade...");

  // Para cada produto com status NO_AR, PRECO_MUDOU ou OFERTA_ACABOU
  const produtos = await prisma.produto.findMany({
    where: {
      status: { in: ["NO_AR", "PRECO_MUDOU", "OFERTA_ACABOU"] },
    },
  });

  let verificados = 0;
  let mudaramPreco = 0;
  let ofertasAcabaram = 0;
  let voltaram = 0;

  for (const prod of produtos) {
    verificados++;
    const oferta = await shopeeService.consultarProduto(prod.shopeeItemId);
    const now = new Date();

    // 1. Se null ou indisponível
    if (!oferta || !oferta.disponivel) {
      if (prod.status !== "OFERTA_ACABOU") {
        if (podeMudarStatus(prod.status, "OFERTA_ACABOU", "ROTINA")) {
          await prisma.produto.update({
            where: { id: prod.id },
            data: {
              status: "OFERTA_ACABOU",
              precoConsultadoEm: now,
            },
          });
          ofertasAcabaram++;
          console.log(`[OFERTA ACABOU] ${prod.titulo}`);
        }
      } else {
        await prisma.produto.update({
          where: { id: prod.id },
          data: { precoConsultadoEm: now },
        });
      }
      continue;
    }

    // 2. Se estava OFERTA_ACABOU e voltou a ficar disponível
    if (prod.status === "OFERTA_ACABOU" && oferta.disponivel) {
      if (podeMudarStatus("OFERTA_ACABOU", "NO_AR", "ROTINA")) {
        await prisma.produto.update({
          where: { id: prod.id },
          data: {
            status: "NO_AR",
            precoShopee: oferta.preco,
            precoConsultadoEm: now,
          },
        });
        voltaram++;
        console.log(`[VOLTOU DISPONÍVEL] ${prod.titulo}`);
      }
      continue;
    }

    // 3. Se o preço mudou (diferença maior que 5 centavos)
    const precoDiferente = Math.abs(prod.precoShopee - oferta.preco) > 0.05;
    if (precoDiferente) {
      if (podeMudarStatus(prod.status, "PRECO_MUDOU", "ROTINA")) {
        await prisma.produto.update({
          where: { id: prod.id },
          data: {
            status: "PRECO_MUDOU",
            precoAnterior: prod.precoShopee,
            precoShopee: oferta.preco,
            precoConsultadoEm: now,
          },
        });
        mudaramPreco++;
        console.log(
          `[PREÇO MUDOU] ${prod.titulo}: R$ ${prod.precoShopee.toFixed(2)} -> R$ ${oferta.preco.toFixed(2)}`
        );
      }
    } else {
      // Apenas atualiza a data de consulta
      await prisma.produto.update({
        where: { id: prod.id },
        data: { precoConsultadoEm: now },
      });
    }
  }

  console.log("\n==========================================");
  console.log(
    `Resumo da atualização:\n${verificados} verificados, ${mudaramPreco} mudaram de preço, ${ofertasAcabaram} ofertas acabaram, ${voltaram} voltaram.`
  );
  console.log("==========================================\n");
}

main()
  .catch((e) => {
    console.error("Erro na rotina de atualização:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

