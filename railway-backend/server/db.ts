import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../shared/schema.js";

// Validar e configurar DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  throw new Error('DATABASE_URL is required');
}

console.log('🔗 Connecting to database...');

export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: true
});

export const db = drizzle({ client: pool, schema });

// Testar conexão
pool.query('SELECT 1').then(() => {
  console.log('✅ Database connection successful');
}).catch(error => {
  console.error('❌ Database connection failed:', error.message);
});