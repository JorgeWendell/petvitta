import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function migrateSubscriptions() {
  try {
    console.log("Criando enum subscription_status...");
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE subscription_status AS ENUM ('ATIVA', 'CANCELADA', 'SUSPENSA', 'EXPIRADA');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("Criando tabela subscriptions...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
        status subscription_status NOT NULL DEFAULT 'ATIVA',
        start_date DATE NOT NULL,
        end_date DATE,
        next_billing_date DATE,
        asaas_subscription_id TEXT UNIQUE,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    console.log("Migração de assinaturas concluída com sucesso!");
  } catch (error) {
    console.error("Erro na migração de assinaturas:", error);
    throw error;
  }
}

if (require.main === module) {
  migrateSubscriptions()
    .then(() => {
      console.log("Migração finalizada");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro fatal:", error);
      process.exit(1);
    });
}

export { migrateSubscriptions };

