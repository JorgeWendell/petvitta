import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function migratePetsCodigo() {
  try {
    console.log("Adicionando coluna codigo na tabela pets...");
    
    await db.execute(sql`
      DO $$ BEGIN
        ALTER TABLE pets 
        ADD COLUMN IF NOT EXISTS codigo NUMERIC(16, 0) UNIQUE;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `);

    console.log("Migração de codigo concluída com sucesso!");
  } catch (error) {
    console.error("Erro na migração de codigo:", error);
    throw error;
  }
}

if (require.main === module) {
  migratePetsCodigo()
    .then(() => {
      console.log("Migração finalizada");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro fatal:", error);
      process.exit(1);
    });
}

export { migratePetsCodigo };

