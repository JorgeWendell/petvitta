import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function migratePets() {
  try {
    console.log("Criando enums para pets...");
    
    // Criar enum pet_status
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE pet_status AS ENUM ('ATIVO', 'SUSPENSO');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Criar enum pet_species
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE pet_species AS ENUM ('CÃO', 'GATO', 'PASSARO', 'COELHO', 'HAMSTER', 'OUTRO');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Criar enum pet_gender
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE pet_gender AS ENUM ('MACHO', 'FÊMEA');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("Criando tabela pets...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        species pet_species NOT NULL DEFAULT 'CÃO',
        breed TEXT,
        date_of_birth DATE,
        gender pet_gender,
        status pet_status NOT NULL DEFAULT 'ATIVO',
        tutor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id TEXT,
        qr_code TEXT UNIQUE,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    console.log("Migração de pets concluída com sucesso!");
  } catch (error) {
    console.error("Erro na migração de pets:", error);
    throw error;
  }
}

if (require.main === module) {
  migratePets()
    .then(() => {
      console.log("Migração finalizada");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro fatal:", error);
      process.exit(1);
    });
}

export { migratePets };

