import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
  console.log("Aplicando migração inicial no Neon...");
  const sql = neon(connectionString);

  const migrationPath = path.join(process.cwd(), "prisma/migrations/20261029000000_init/migration.sql");
  const migrationSql = fs.readFileSync(migrationPath, "utf8");

  // Executa o SQL da migração
  // Neon sql() aceita queries
  // Vamos criar _prisma_migrations se não existir e executar a migração
  await sql`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) PRIMARY KEY,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `;

  // Divide e executa os comandos DDL
  const statements = migrationSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await (sql as any).query(statement);
    } catch (err: any) {
      // Ignora erro se tipo já existir
      if (!err.message?.includes("already exists")) {
        console.error("Erro executando statement:", statement);
        throw err;
      }
    }
  }

  // Registra a migração como aplicada
  await sql`
    INSERT INTO "_prisma_migrations" (
      "id",
      "checksum",
      "finished_at",
      "migration_name",
      "applied_steps_count"
    ) VALUES (
      '20261029000000_init',
      'initial-migration-hash',
      now(),
      '20261029000000_init',
      1
    ) ON CONFLICT ("id") DO NOTHING;
  `;

  console.log("Migração inicial aplicada com sucesso no Neon!");

  // Lista as tabelas criadas
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log("Tabelas agora existentes no Neon:", tables.map((t: any) => t.table_name));
}

main().catch((e) => {
  console.error("Falha ao aplicar migração:", e);
  process.exit(1);
});
