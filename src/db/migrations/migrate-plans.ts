import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function migratePlans() {
  try {
    console.log("Criando enum plan_status...");
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE plan_status AS ENUM ('ATIVO', 'INATIVO');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("Criando tabela plans...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        care_period_days INTEGER NOT NULL DEFAULT 30,
        status plan_status NOT NULL DEFAULT 'ATIVO',
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    console.log("Adicionando foreign key plan_id na tabela pets...");
    
    await db.execute(sql`
      DO $$ BEGIN
        ALTER TABLE pets 
        ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES plans(id) ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `);

    console.log("Migração de planos concluída com sucesso!");
  } catch (error) {
    console.error("Erro na migração de planos:", error);
    throw error;
  }
}

if (require.main === module) {
  migratePlans()
    .then(() => {
      console.log("Migração finalizada");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro fatal:", error);
      process.exit(1);
    });
}

export { migratePlans };

