import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function migrateAppointments() {
  try {
    console.log("Criando tabela appointments...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        price_in_cents INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(doctor_id, appointment_date, appointment_time)
      );
    `);

    console.log("Criando índice para busca por data e médico...");
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date 
      ON appointments(doctor_id, appointment_date);
    `);

    console.log("Migração de agendamentos concluída com sucesso!");
  } catch (error) {
    console.error("Erro na migração de agendamentos:", error);
    throw error;
  }
}

if (require.main === module) {
  migrateAppointments()
    .then(() => {
      console.log("Migração concluída!");
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateAppointments };

