// Teste simples de conexão com banco
import { Pool } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

console.log('🔍 Testing database connection...');
console.log('DATABASE_URL:', databaseUrl ? 'Set' : 'Not set');

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: true
});

try {
  const result = await pool.query('SELECT NOW() as current_time');
  console.log('✅ Database connection successful!');
  console.log('Current time:', result.rows[0].current_time);
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  process.exit(1);
}

process.exit(0);