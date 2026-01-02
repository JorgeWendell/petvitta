import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function migrateClinics() {
  try {
    console.log("Criando enum clinic_status...");
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE clinic_status AS ENUM ('ATIVO', 'INATIVO');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("Criando tabela clinics...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS clinics (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cnpj TEXT UNIQUE,
        phone TEXT,
        email TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        status clinic_status NOT NULL DEFAULT 'ATIVO',
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    console.log("Migração de clínicas concluída com sucesso!");
  } catch (error) {
    console.error("Erro na migração de clínicas:", error);
    throw error;
  }
}

if (require.main === module) {
  migrateClinics()
    .then(() => {
      console.log("Migração finalizada");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro fatal:", error);
      process.exit(1);
    });
}

export { migrateClinics };

