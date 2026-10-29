import "dotenv/config";
import { prisma } from "../lib/db";

async function testarConexoes() {
  console.log("=== Teste de Conexão com o Banco de Dados ===\n");
  try {
    const res: any = await prisma.$queryRawUnsafe("SELECT current_database()::text as db, current_user::text as user;");
    const info = res?.[0];
    console.log(`OK! Conectado com sucesso ao banco de dados PostgreSQL (Neon): "${info?.db}" como "${info?.user}".`);
  } catch (err: any) {
    console.error(`FALHA ao conectar com o banco de dados:\n${err.message || err}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testarConexoes();
