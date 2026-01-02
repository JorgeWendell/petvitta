import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function migrateRoles() {
  try {
    console.log("Criando enum user_role...");
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'CLINIC', 'TUTOR');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("Criando coluna role...");
    
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'TUTOR';
    `);

    console.log("Migrando dados das colunas antigas para role...");
    
    await db.execute(sql`
      UPDATE users
      SET role = CASE
        WHEN is_administrator = true THEN 'ADMIN'::user_role
        WHEN is_operator = true THEN 'CLINIC'::user_role
        WHEN is_manager = true THEN 'CLINIC'::user_role
        ELSE 'TUTOR'::user_role
      END;
    `);

    console.log("Migração de roles concluída com sucesso!");
    console.log("Agora você pode executar: npx drizzle-kit push para remover as colunas antigas");
  } catch (error) {
    console.error("Erro na migração de roles:", error);
    throw error;
  }
}

if (require.main === module) {
  migrateRoles()
    .then(() => {
      console.log("Migração finalizada");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro fatal:", error);
      process.exit(1);
    });
}

export { migrateRoles };
