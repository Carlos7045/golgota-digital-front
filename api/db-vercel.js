import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { pgTable, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';

// Schema inline para evitar problemas de importação
const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  force_password_change: boolean('force_password_change').default(false)
});

const profiles = pgTable('profiles', {
  id: integer('id').primaryKey(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  cpf: text('cpf').unique().notNull(),
  birth_date: text('birth_date').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  rank: text('rank').notNull().default('aluno'),
  company: text('company').notNull(),
  avatar: text('avatar'),
  created_at: timestamp('created_at').defaultNow()
});

// Configuração do banco para Vercel
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export class VercelStorage {
  async getUserByEmail(email) {
    try {
      const result = await db.select({
        id: users.id,
        email: users.email,
        password: users.password,
        created_at: users.created_at,
        force_password_change: users.force_password_change
      }).from(users).where(eq(users.email, email)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async getUser(id) {
    try {
      const result = await db.select({
        id: users.id,
        email: users.email,
        password: users.password,
        created_at: users.created_at,
        force_password_change: users.force_password_change
      }).from(users).where(eq(users.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getUserProfile(userId) {
    try {
      const result = await db
        .select()
        .from(profiles)
        .where(eq(profiles.user_id, userId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async getUsersByRank() {
    try {
      const result = await db
        .select({
          user_id: profiles.user_id,
          cpf: profiles.cpf,
          rank: profiles.rank,
          name: profiles.name
        })
        .from(profiles);
      return result;
    } catch (error) {
      console.error('Error getting users by rank:', error);
      return [];
    }
  }
}