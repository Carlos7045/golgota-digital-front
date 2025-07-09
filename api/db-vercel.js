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
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  cpf: text('cpf').unique().notNull(),
  birth_date: text('birth_date'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  rank: text('rank').notNull().default('aluno'),
  company: text('company'),
  avatar_url: text('avatar_url'),
  email: text('email'),
  bio: text('bio'),
  specialties: text('specialties').array(),
  joined_at: timestamp('joined_at').defaultNow(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

const user_roles = pgTable('user_roles', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  role: text('role').notNull(),
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

  async getUserRoles(userId) {
    try {
      console.log('🔍 Buscando roles para usuário:', userId);
      
      const result = await db
        .select({
          role: user_roles.role
        })
        .from(user_roles)
        .where(eq(user_roles.user_id, userId));
      
      const roles = result.map(r => r.role);
      console.log('✅ Roles encontrados:', roles);
      
      // Se não tem roles definidos, usar roles padrão baseado no rank
      if (roles.length === 0) {
        const profile = await this.getUserProfile(userId);
        if (profile?.rank === 'comandante' || profile?.rank === 'major' || profile?.rank === 'coronel') {
          roles.push('admin');
        }
        roles.push('user');
      }
      
      return roles;
    } catch (error) {
      console.error('Error getting user roles:', error);
      return ['user']; // Role padrão em caso de erro
    }
  }
}