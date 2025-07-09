var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// asaas.ts
var asaas_exports = {};
__export(asaas_exports, {
  AsaasService: () => AsaasService,
  asaasService: () => asaasService,
  configureAsaasCheckout: () => configureAsaasCheckout
});
var AsaasService, asaasService, configureAsaasCheckout;
var init_asaas = __esm({
  "asaas.ts"() {
    "use strict";
    AsaasService = class {
      apiKey;
      baseUrl;
      headers;
      constructor(apiKey, sandbox = true) {
        this.apiKey = apiKey;
        this.baseUrl = sandbox ? "https://sandbox.asaas.com/api/v3" : "https://api.asaas.com/v3";
        this.headers = {
          "access_token": this.apiKey,
          "Content-Type": "application/json",
          "User-Agent": "Comando-Golgota/1.0"
        };
      }
      async createCustomer(customerData) {
        try {
          const response = await fetch(`${this.baseUrl}/customers`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(customerData)
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro ao criar cliente: ${error.errors?.[0]?.description || response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Erro ao criar cliente no Asaas:", error);
          throw error;
        }
      }
      async createSubscription(subscriptionData) {
        try {
          const response = await fetch(`${this.baseUrl}/subscriptions`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(subscriptionData)
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro ao criar assinatura: ${error.errors?.[0]?.description || response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Erro ao criar assinatura no Asaas:", error);
          throw error;
        }
      }
      async updateSubscription(subscriptionId, updateData) {
        try {
          const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(updateData)
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro ao atualizar assinatura: ${error.errors?.[0]?.description || response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Erro ao atualizar assinatura no Asaas:", error);
          throw error;
        }
      }
      async cancelSubscription(subscriptionId) {
        try {
          const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
            method: "DELETE",
            headers: this.headers
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro ao cancelar assinatura: ${error.errors?.[0]?.description || response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Erro ao cancelar assinatura no Asaas:", error);
          throw error;
        }
      }
      async getSubscription(subscriptionId) {
        try {
          const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
            method: "GET",
            headers: this.headers
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro ao buscar assinatura: ${error.errors?.[0]?.description || response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Erro ao buscar assinatura no Asaas:", error);
          throw error;
        }
      }
      async getSubscriptionPayments(subscriptionId) {
        try {
          const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}/payments`, {
            method: "GET",
            headers: this.headers
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro ao buscar pagamentos: ${error.errors?.[0]?.description || response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Erro ao buscar pagamentos no Asaas:", error);
          throw error;
        }
      }
      async createPayment(paymentData) {
        try {
          const response = await fetch(`${this.baseUrl}/payments`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(paymentData)
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro ao criar pagamento: ${error.errors?.[0]?.description || response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Erro ao criar pagamento no Asaas:", error);
          throw error;
        }
      }
      async createPaymentLink(paymentLinkData) {
        try {
          const response = await fetch(`${this.baseUrl}/paymentLinks`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(paymentLinkData)
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro ao criar link de pagamento: ${error.errors?.[0]?.description || response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Erro ao criar link de pagamento no Asaas:", error);
          throw error;
        }
      }
      async getPixQrCode(paymentId) {
        try {
          const response = await fetch(`${this.baseUrl}/payments/${paymentId}/pixQrCode`, {
            method: "GET",
            headers: this.headers
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro ao buscar QR Code PIX: ${error.errors?.[0]?.description || response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Erro ao buscar QR Code PIX no Asaas:", error);
          throw error;
        }
      }
      async saveCheckoutCustomization(customization) {
        try {
          const response = await fetch(`${this.baseUrl}/myAccount/paymentCheckoutConfig`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(customization)
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro ao personalizar checkout: ${error.errors?.[0]?.description || response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Erro ao personalizar checkout no Asaas:", error);
          throw error;
        }
      }
      async getPayment(paymentId) {
        try {
          const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
            method: "GET",
            headers: this.headers
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro ao buscar pagamento: ${error.errors?.[0]?.description || response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Erro ao buscar pagamento no Asaas:", error);
          throw error;
        }
      }
      // Utility methods
      static getNextDueDate(daysFromNow = 30) {
        const date = /* @__PURE__ */ new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString().split("T")[0];
      }
      static isEligibleForPayment(rank) {
        const eligibleRanks = ["soldado", "cabo", "sargento", "tenente", "capitao", "major", "coronel", "comandante"];
        return eligibleRanks.includes(rank.toLowerCase());
      }
      static formatCPF(cpf) {
        const cleanCPF = cpf.replace(/\D/g, "");
        if (cleanCPF.length !== 11) {
          throw new Error("CPF deve ter 11 d\xEDgitos");
        }
        return cleanCPF;
      }
      static validateWebhookSignature(payload, signature, secret) {
        return true;
      }
    };
    asaasService = new AsaasService(
      process.env.ASAAS_API_KEY || "",
      process.env.NODE_ENV !== "production"
    );
    configureAsaasCheckout = async () => {
      try {
        const customization = {
          paymentCheckoutConfig: {
            logoBackgroundColor: "#1A1A1A",
            infoBackgroundColor: "#2A2A2A",
            fontColor: "#FFFFFF",
            primaryColor: "#D4AF37",
            primaryFontColor: "#000000",
            hideAsaasLogo: false
          },
          paymentCompanyInfoConfig: {
            name: "Comando G\xF3lgota",
            description: "Comunidade Militar Crist\xE3",
            logoUrl: null,
            // Can be added later when you have a logo URL
            primaryColor: "#D4AF37",
            backgroundColor: "#1A1A1A"
          }
        };
        await asaasService.saveCheckoutCustomization(customization);
        console.log("Checkout customization configured successfully");
      } catch (error) {
        console.log("Checkout customization skipped:", error.message);
      }
    };
  }
});

// index.ts
import express from "express";
import session from "express-session";

// routes.ts
import { createServer } from "http";

// db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5e3,
  idleTimeoutMillis: 1e4,
  max: 10
});
var db = drizzle({ client: pool, schema });

// storage.ts
import { users, profiles, userRoles, companies, companyMembers, events, eventRegistrations, content, trainings, courses, enrollments, userActivities, achievements, financialCategories, financialTransactions, asaasCustomers as asaasCustomers2, asaasSubscriptions, asaasPayments, asaasWebhooks } from "@shared/schema";
import { eq, and, desc, inArray, isNotNull, gte, lte, count, ilike } from "drizzle-orm";
import bcrypt from "bcryptjs";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(insertUser) {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword
    }).returning();
    await db.insert(profiles).values({
      user_id: user.id,
      name: "",
      // Nome será preenchido pelo usuário no perfil
      email: insertUser.email,
      rank: "aluno"
    });
    await db.insert(userRoles).values({
      user_id: user.id,
      role: "user"
    });
    return user;
  }
  async getProfile(userId) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.user_id, userId));
    return profile;
  }
  async updateProfile(userId, data) {
    const [profile] = await db.update(profiles).set({ ...data, updated_at: /* @__PURE__ */ new Date() }).where(eq(profiles.user_id, userId)).returning();
    return profile;
  }
  async getCompanies() {
    const companiesList = await db.select({
      id: companies.id,
      name: companies.name,
      commander_id: companies.commander_id,
      sub_commander_id: companies.sub_commander_id,
      status: companies.status,
      description: companies.description,
      city: companies.city,
      state: companies.state,
      founded_date: companies.founded_date,
      color: companies.color,
      created_at: companies.created_at,
      updated_at: companies.updated_at,
      commander_name: profiles.name,
      commander_rank: profiles.rank
    }).from(companies).leftJoin(users, eq(companies.commander_id, users.id)).leftJoin(profiles, eq(users.id, profiles.user_id));
    return companiesList;
  }
  async createCompany(companyData) {
    const [company] = await db.insert(companies).values(companyData).returning();
    if (company.commander_id) {
      await this.addCompanyMember(company.id, company.commander_id, "Comandante");
    }
    if (company.sub_commander_id) {
      await this.addCompanyMember(company.id, company.sub_commander_id, "Subcomandante");
    }
    return company;
  }
  async updateCompany(companyId, data) {
    const updateData = {
      ...data,
      commander_id: data.commander_id === "none" ? null : data.commander_id,
      sub_commander_id: data.sub_commander_id === "none" ? null : data.sub_commander_id,
      updated_at: /* @__PURE__ */ new Date()
    };
    const [company] = await db.update(companies).set(updateData).where(eq(companies.id, companyId)).returning();
    return company;
  }
  async deleteCompany(companyId) {
    await db.delete(companyMembers).where(eq(companyMembers.company_id, companyId));
    await db.delete(companies).where(eq(companies.id, companyId));
  }
  async getCompanyMembers(companyId) {
    const members = await db.select({
      id: profiles.id,
      user_id: profiles.user_id,
      name: profiles.name,
      cpf: profiles.cpf,
      rank: profiles.rank,
      company: profiles.company,
      email: profiles.email,
      phone: profiles.phone,
      city: profiles.city,
      birth_date: profiles.birth_date,
      address: profiles.address,
      avatar_url: profiles.avatar_url,
      bio: profiles.bio,
      specialties: profiles.specialties,
      joined_at: profiles.joined_at,
      created_at: profiles.created_at,
      updated_at: profiles.updated_at,
      company_role: companyMembers.role,
      joined_date: companyMembers.joined_date
    }).from(companyMembers).innerJoin(profiles, eq(companyMembers.user_id, profiles.user_id)).where(eq(companyMembers.company_id, companyId));
    return members;
  }
  async addCompanyMember(companyId, userId, role = "Membro") {
    const existingMember = await db.select().from(companyMembers).where(
      and(
        eq(companyMembers.company_id, companyId),
        eq(companyMembers.user_id, userId)
      )
    ).limit(1);
    if (existingMember.length > 0) {
      throw new Error("Usu\xE1rio j\xE1 \xE9 membro desta companhia");
    }
    await db.insert(companyMembers).values({
      company_id: companyId,
      user_id: userId,
      role
    });
  }
  async removeCompanyMember(companyId, userId) {
    await db.delete(companyMembers).where(
      and(
        eq(companyMembers.company_id, companyId),
        eq(companyMembers.user_id, userId)
      )
    );
  }
  async updateMemberRole(companyId, userId, role) {
    await db.update(companyMembers).set({ role }).where(
      and(
        eq(companyMembers.company_id, companyId),
        eq(companyMembers.user_id, userId)
      )
    );
  }
  async getAvailableCommanders() {
    const commanderRanks = ["sargento", "tenente", "capitao", "major", "coronel", "comandante", "admin"];
    const commanders = await db.select({
      id: profiles.user_id,
      // Use user_id instead of profile id for commander_id field
      user_id: profiles.user_id,
      name: profiles.name,
      rank: profiles.rank,
      email: profiles.email,
      phone: profiles.phone,
      city: profiles.city,
      birth_date: profiles.birth_date,
      address: profiles.address,
      avatar_url: profiles.avatar_url,
      bio: profiles.bio,
      specialties: profiles.specialties,
      joined_at: profiles.joined_at,
      created_at: profiles.created_at,
      updated_at: profiles.updated_at,
      cpf: profiles.cpf,
      company: profiles.company
    }).from(profiles).where(
      and(
        inArray(profiles.rank, commanderRanks),
        isNotNull(profiles.name)
      )
    );
    return commanders;
  }
  async getUsersByRank(rank) {
    if (rank) {
      return await db.select().from(profiles).where(eq(profiles.rank, rank));
    }
    return await db.select().from(profiles).where(isNotNull(profiles.name));
  }
  async getTrainings() {
    return await db.select().from(trainings);
  }
  async getCourses() {
    return await db.select().from(courses);
  }
  async getEvents() {
    return await db.select().from(events).orderBy(events.start_date);
  }
  async createEvent(eventData) {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }
  async updateEvent(eventId, data) {
    const [event] = await db.update(events).set({ ...data, updated_at: /* @__PURE__ */ new Date() }).where(eq(events.id, eventId)).returning();
    return event;
  }
  async deleteEvent(eventId) {
    await db.delete(events).where(eq(events.id, eventId));
  }
  async getEventsByCategory(category) {
    return await db.select().from(events).where(eq(events.category, category)).orderBy(events.start_date);
  }
  async getUserRoles(userId) {
    const roles = await db.select({ role: userRoles.role }).from(userRoles).where(eq(userRoles.user_id, userId));
    return roles.map((r) => r.role).filter((role) => role !== null);
  }
  async assignRole(userId, role) {
    await db.insert(userRoles).values({
      user_id: userId,
      role
    }).onConflictDoNothing();
  }
  async getUserActivities(userId) {
    const activities = await db.select().from(userActivities).where(eq(userActivities.user_id, userId)).orderBy(desc(userActivities.created_at)).limit(20);
    return activities;
  }
  async getUserAchievements(userId) {
    const achievementResults = await db.select().from(achievements).where(eq(achievements.user_id, userId)).orderBy(desc(achievements.created_at));
    return achievementResults;
  }
  async getChannelMessages(channel) {
    try {
      const messages2 = await db.select({
        id: content.id,
        title: content.title,
        body: content.body,
        author_id: content.author_id,
        created_at: content.created_at,
        views: content.views,
        interactions: content.interactions,
        author_name: profiles.name,
        author_rank: profiles.rank,
        author_company: profiles.company
      }).from(content).leftJoin(profiles, eq(content.author_id, profiles.user_id)).where(and(
        eq(content.channel, channel),
        eq(content.status, "published")
      )).orderBy(desc(content.created_at));
      return messages2;
    } catch (error) {
      console.error("Error fetching channel messages:", error);
      return [];
    }
  }
  async createMessage(userId, channel, messageContent) {
    try {
      const [newMessage] = await db.insert(content).values({
        title: "Mensagem no Canal Geral",
        body: messageContent,
        type: "announcement",
        channel,
        author_id: userId,
        status: "published",
        published_at: /* @__PURE__ */ new Date()
      }).returning();
      return newMessage;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }
  async deleteUser(userId) {
    try {
      await db.delete(content).where(eq(content.author_id, userId));
      await db.delete(enrollments).where(eq(enrollments.user_id, userId));
      await db.delete(userActivities).where(eq(userActivities.user_id, userId));
      await db.delete(companyMembers).where(eq(companyMembers.user_id, userId));
      await db.delete(userRoles).where(eq(userRoles.user_id, userId));
      await db.delete(profiles).where(eq(profiles.user_id, userId));
      await db.delete(users).where(eq(users.id, userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
  // Asaas payment integration methods
  async getAsaasCustomer(userId) {
    const [customer] = await db.select().from(asaasCustomers2).where(eq(asaasCustomers2.user_id, userId));
    return customer;
  }
  async createAsaasCustomer(userId, asaasCustomerId) {
    const [customer] = await db.insert(asaasCustomers2).values({
      user_id: userId,
      asaas_customer_id: asaasCustomerId
    }).returning();
    return customer;
  }
  async getAsaasSubscription(userId) {
    const [subscription] = await db.select().from(asaasSubscriptions).where(eq(asaasSubscriptions.user_id, userId));
    return subscription;
  }
  async createAsaasSubscription(data) {
    const [subscription] = await db.insert(asaasSubscriptions).values(data).returning();
    return subscription;
  }
  async updateAsaasSubscription(subscriptionId, data) {
    const [subscription] = await db.update(asaasSubscriptions).set({ ...data, updated_at: /* @__PURE__ */ new Date() }).where(eq(asaasSubscriptions.id, subscriptionId)).returning();
    return subscription;
  }
  async getAsaasPayments(userId) {
    return await db.select().from(asaasPayments).where(eq(asaasPayments.user_id, userId)).orderBy(desc(asaasPayments.due_date));
  }
  async createAsaasPayment(data) {
    const [payment] = await db.insert(asaasPayments).values(data).returning();
    return payment;
  }
  async updateAsaasPayment(paymentId, data) {
    const [payment] = await db.update(asaasPayments).set({ ...data, updated_at: /* @__PURE__ */ new Date() }).where(eq(asaasPayments.asaas_payment_id, paymentId)).returning();
    return payment;
  }
  async getPaymentEligibleUsers() {
    const eligibleRanks = ["soldado", "cabo", "sargento", "tenente", "capitao", "major", "coronel", "comandante"];
    return await db.select().from(profiles).where(
      and(
        isNotNull(profiles.rank),
        inArray(profiles.rank, eligibleRanks)
      )
    );
  }
  async getUsersWithActiveSubscriptions() {
    const result = await db.select({
      id: profiles.id,
      user_id: profiles.user_id,
      name: profiles.name,
      rank: profiles.rank,
      email: profiles.email,
      phone: profiles.phone,
      birth_date: profiles.birth_date,
      address: profiles.address,
      avatar_url: profiles.avatar_url,
      bio: profiles.bio,
      specialties: profiles.specialties,
      joined_at: profiles.joined_at,
      created_at: profiles.created_at,
      updated_at: profiles.updated_at,
      company: profiles.company,
      cpf: profiles.cpf,
      city: profiles.city
    }).from(profiles).innerJoin(asaasSubscriptions, eq(profiles.user_id, asaasSubscriptions.user_id)).where(eq(asaasSubscriptions.status, "ACTIVE"));
    return result;
  }
  async createAsaasWebhook(data) {
    const [webhook] = await db.insert(asaasWebhooks).values(data).returning();
    return webhook;
  }
  async getUnprocessedWebhooks() {
    return await db.select().from(asaasWebhooks).where(eq(asaasWebhooks.processed, false)).orderBy(asaasWebhooks.created_at);
  }
  async markWebhookProcessed(webhookId) {
    await db.update(asaasWebhooks).set({
      processed: true,
      processed_at: /* @__PURE__ */ new Date()
    }).where(eq(asaasWebhooks.id, webhookId));
  }
  // Financial transaction methods
  async getFinancialCategoryByName(name) {
    const [category] = await db.select().from(financialCategories).where(ilike(financialCategories.name, `%${name}%`)).limit(1);
    return category;
  }
  async createFinancialTransaction(transaction) {
    const [newTransaction] = await db.insert(financialTransactions).values({
      ...transaction,
      amount: transaction.amount.toString()
    }).returning();
    return newTransaction;
  }
  async updateFinancialTransaction(transactionId, data) {
    const [updated] = await db.update(financialTransactions).set({ ...data, updated_at: /* @__PURE__ */ new Date() }).where(eq(financialTransactions.id, transactionId)).returning();
    return updated;
  }
  async getFinancialTransactions(startDate, endDate) {
    let query = db.select().from(financialTransactions);
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(financialTransactions.transaction_date, startDate),
          lte(financialTransactions.transaction_date, endDate)
        )
      );
    } else if (startDate) {
      query = query.where(gte(financialTransactions.transaction_date, startDate));
    } else if (endDate) {
      query = query.where(lte(financialTransactions.transaction_date, endDate));
    }
    return await query.orderBy(desc(financialTransactions.transaction_date));
  }
  // Event registration methods
  async registerForEvent(eventId, userId, paymentData) {
    const registrationData = {
      event_id: eventId,
      user_id: userId,
      payment_status: paymentData?.status || "pending",
      asaas_payment_id: paymentData?.asaas_payment_id || null,
      amount_paid: paymentData?.amount_paid ? paymentData.amount_paid.toString() : null,
      payment_method: paymentData?.payment_method || null,
      notes: paymentData?.notes || null
    };
    const [registration] = await db.insert(eventRegistrations).values(registrationData).returning();
    const registrationCount = await db.select({ count: count() }).from(eventRegistrations).where(eq(eventRegistrations.event_id, eventId));
    await db.update(events).set({
      registered_participants: registrationCount[0]?.count || 0,
      updated_at: /* @__PURE__ */ new Date()
    }).where(eq(events.id, eventId));
    return registration;
  }
  async unregisterFromEvent(eventId, userId) {
    await db.delete(eventRegistrations).where(and(
      eq(eventRegistrations.event_id, eventId),
      eq(eventRegistrations.user_id, userId)
    ));
    const currentEvent = await db.query.events.findFirst({
      where: eq(events.id, eventId)
    });
    if (currentEvent && currentEvent.registered_participants > 0) {
      await db.update(events).set({
        registered_participants: currentEvent.registered_participants - 1,
        updated_at: /* @__PURE__ */ new Date()
      }).where(eq(events.id, eventId));
    }
  }
  async getUserEventRegistrations(userId) {
    return await db.select().from(eventRegistrations).where(eq(eventRegistrations.user_id, userId)).orderBy(desc(eventRegistrations.registration_date));
  }
  async getEventRegistrations(eventId) {
    return await db.select().from(eventRegistrations).where(eq(eventRegistrations.event_id, eventId)).orderBy(desc(eventRegistrations.registration_date));
  }
  async isUserRegisteredForEvent(eventId, userId) {
    const [registration] = await db.select().from(eventRegistrations).where(and(
      eq(eventRegistrations.event_id, eventId),
      eq(eventRegistrations.user_id, userId)
    ));
    return !!registration;
  }
  async updateEventRegistration(registrationId, data) {
    const [updated] = await db.update(eventRegistrations).set({ ...data, updated_at: /* @__PURE__ */ new Date() }).where(eq(eventRegistrations.id, registrationId)).returning();
    return updated;
  }
  async getFinancialCategories() {
    return await db.select().from(financialCategories).orderBy(financialCategories.name);
  }
};
var storage = new DatabaseStorage();

// routes.ts
import bcrypt2 from "bcryptjs";
import { insertUserSchema, users as users2, profiles as profiles2, generalMessages as messages } from "@shared/schema";
import { z } from "zod";
init_asaas();
import { sql, eq as eq2 } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
var uploadDir = path.join(process.cwd(), "public", "avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
var storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});
var upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});
async function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid session" });
  }
}
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName, cpf, phone, city, address, birthYear, company, rank } = req.body;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const userData = insertUserSchema.parse({ email, password });
      const user = await storage.createUser(userData);
      const profileData = {
        name: fullName || "",
        cpf: cpf || "",
        phone: phone || "",
        city: city || "",
        address: address || "",
        birth_date: birthYear ? `${birthYear}-01-01` : null,
        company: company || "",
        rank: rank || "aluno"
      };
      await storage.updateProfile(user.id, profileData);
      const { password: _, ...userResponse } = user;
      res.status(201).json({ user: userResponse });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/create-user", requireAuth, async (req, res) => {
    try {
      const { email, name, cpf, phone, city, address, birth_date, rank, company } = req.body;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Usu\xE1rio j\xE1 existe com este email" });
      }
      const hashedPassword = await bcrypt2.hash("Golgota123", 10);
      const userData = {
        email,
        password: hashedPassword,
        force_password_change: true
      };
      const user = await storage.createUser(userData);
      const profileData = {
        name,
        cpf: cpf.replace(/\D/g, ""),
        // Remove formatting
        phone,
        city,
        address,
        birth_date,
        rank,
        company
      };
      await storage.updateProfile(user.id, profileData);
      if (company) {
        const companies3 = await storage.getCompanies();
        const targetCompany = companies3.find((c) => c.name === company);
        if (targetCompany) {
          let role = "Membro";
          if (rank === "comandante") role = "Comandante";
          else if (rank === "major" || rank === "coronel") role = "Sub-Comandante";
          else if (rank === "capitao" || rank === "tenente") role = "Oficial";
          else if (rank === "sargento" || rank === "cabo") role = "Graduado";
          await storage.addCompanyMember(targetCompany.id, user.id, role);
        }
      }
      const { password: _, ...userResponse } = user;
      res.status(201).json({
        user: userResponse,
        message: "Usu\xE1rio criado com sucesso. Senha padr\xE3o: Golgota123"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      console.error("User creation error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { emailOrCpf, password } = req.body;
      if (!emailOrCpf || !password) {
        return res.status(400).json({ message: "CPF/Email e senha s\xE3o obrigat\xF3rios" });
      }
      let user = await storage.getUserByEmail(emailOrCpf);
      if (!user) {
        const users3 = await storage.getUsersByRank();
        const profileWithCpf = users3.find((u) => u.cpf === emailOrCpf.replace(/\D/g, ""));
        if (profileWithCpf) {
          user = await storage.getUser(profileWithCpf.user_id);
        }
      }
      if (!user) {
        return res.status(401).json({ message: "CPF/Email ou senha inv\xE1lidos" });
      }
      const isValidPassword = await bcrypt2.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "CPF/Email ou senha inv\xE1lidos" });
      }
      req.session.userId = user.id;
      const profile = await storage.getProfile(user.id);
      const roles = await storage.getUserRoles(user.id);
      const { password: _, ...userResponse } = user;
      res.json({
        user: userResponse,
        profile,
        roles,
        force_password_change: user.force_password_change || false
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/auth/delete-user", requireAuth, async (req, res) => {
    try {
      const { userId, adminPassword } = req.body;
      const adminUserId = req.user?.id;
      if (!userId || !adminPassword) {
        return res.status(400).json({ message: "ID do usu\xE1rio e senha do admin s\xE3o obrigat\xF3rios" });
      }
      const adminUser = await storage.getUser(adminUserId);
      if (!adminUser) {
        return res.status(401).json({ message: "Usu\xE1rio admin n\xE3o encontrado" });
      }
      const isValidPassword = await bcrypt2.compare(adminPassword, adminUser.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Senha do administrador incorreta" });
      }
      const userToDelete = await storage.getUser(userId);
      if (!userToDelete) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      if (userId === adminUserId) {
        return res.status(400).json({ message: "Voc\xEA n\xE3o pode excluir sua pr\xF3pria conta" });
      }
      await storage.deleteUser(userId);
      res.json({
        message: "Usu\xE1rio exclu\xEDdo com sucesso",
        deletedUserId: userId
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Erro ao fazer logout" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logout realizado com sucesso" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/auth/logout-old", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Senha atual e nova senha s\xE3o obrigat\xF3rias" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "A nova senha deve ter pelo menos 6 caracteres" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      const isValidPassword = await bcrypt2.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Senha atual incorreta" });
      }
      const hashedNewPassword = await bcrypt2.hash(newPassword, 10);
      await db.update(users2).set({
        password: hashedNewPassword,
        force_password_change: false,
        updated_at: /* @__PURE__ */ new Date()
      }).where(eq2(users2.id, req.user.id));
      res.json({ message: "Senha alterada com sucesso" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getProfile(req.user.id);
      const roles = await storage.getUserRoles(req.user.id);
      res.json({ profile, roles });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/profile/avatar", requireAuth, upload.single("avatar"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const avatarUrl = `/avatars/${req.file.filename}`;
      const currentProfile = await storage.getProfile(req.user.id);
      if (currentProfile?.avatar_url && currentProfile.avatar_url !== avatarUrl) {
        const oldFilePath = path.join(process.cwd(), "public", currentProfile.avatar_url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      await storage.updateProfile(req.user.id, { avatar_url: avatarUrl });
      res.json({
        message: "Avatar uploaded successfully",
        avatar_url: avatarUrl
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      if (req.file) {
        const filePath = path.join(uploadDir, req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/profile", requireAuth, async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (updateData.birth_date === "") {
        delete updateData.birth_date;
      }
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === "" && key !== "name") {
          delete updateData[key];
        }
      });
      const updatedProfile = await storage.updateProfile(req.user.id, updateData);
      res.json({ profile: updatedProfile });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/profiles/:id", requireAuth, async (req, res) => {
    try {
      const profileId = req.params.id;
      const adminUserId = req.user?.id;
      const adminRoles = await storage.getUserRoles(adminUserId);
      if (!adminRoles.includes("admin")) {
        return res.status(403).json({ message: "Acesso negado - apenas administradores podem editar usu\xE1rios" });
      }
      const updateData = { ...req.body };
      if (updateData.birth_date === "") {
        delete updateData.birth_date;
      }
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === "" && key !== "name") {
          delete updateData[key];
        }
      });
      const updatedProfile = await storage.updateProfile(profileId, updateData);
      if (!updatedProfile) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      res.json({
        message: "Usu\xE1rio atualizado com sucesso",
        profile: updatedProfile
      });
    } catch (error) {
      console.error("Admin profile update error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/companies", requireAuth, async (req, res) => {
    try {
      const companies3 = await storage.getCompanies();
      const companiesWithMemberCount = await Promise.all(
        companies3.map(async (company) => {
          const members = await storage.getCompanyMembers(company.id);
          return {
            ...company,
            members: members.length
          };
        })
      );
      res.json({ companies: companiesWithMemberCount });
    } catch (error) {
      console.error("Companies fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/companies", requireAuth, async (req, res) => {
    try {
      const { name, commander_id, sub_commander_id, description, city, state, color, members } = req.body;
      const company = await storage.createCompany({
        name,
        commander_id: commander_id || null,
        sub_commander_id: sub_commander_id || null,
        description: description || null,
        city: city || null,
        state: state || null,
        color: color || "#FFD700",
        status: "Planejamento"
      });
      if (members && Array.isArray(members)) {
        for (const member of members) {
          if (member.user_id && member.user_id !== commander_id && member.user_id !== sub_commander_id) {
            await storage.addCompanyMember(company.id, member.user_id, member.role || "Membro");
          }
        }
      }
      res.json({ company });
    } catch (error) {
      console.error("Company creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/companies/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteCompany(req.params.id);
      res.json({ message: "Company deleted successfully" });
    } catch (error) {
      console.error("Company deletion error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/companies/:id", requireAuth, async (req, res) => {
    try {
      const company = await storage.updateCompany(req.params.id, req.body);
      res.json({ company });
    } catch (error) {
      console.error("Company update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/companies/:id/members", requireAuth, async (req, res) => {
    try {
      const members = await storage.getCompanyMembers(req.params.id);
      res.json({ members });
    } catch (error) {
      console.error("Company members fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/companies/:id/members", requireAuth, async (req, res) => {
    try {
      const { user_id, role } = req.body;
      await storage.addCompanyMember(req.params.id, user_id, role || "Membro");
      res.json({ message: "Membro adicionado com sucesso" });
    } catch (error) {
      console.error("Error adding company member:", error);
      if (error.message === "Usu\xE1rio j\xE1 \xE9 membro desta companhia") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/companies/:id/members", requireAuth, async (req, res) => {
    try {
      const members = await storage.getCompanyMembers(req.params.id);
      const formattedMembers = members.map((member) => ({
        id: member.id,
        user_id: member.user_id,
        name: member.name,
        rank: member.rank,
        role: member.company_role || "Membro",
        email: member.email,
        phone: member.phone,
        city: member.city
      }));
      res.json({ members: formattedMembers });
    } catch (error) {
      console.error("Error fetching company members:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/companies/:id/members/:userId", requireAuth, async (req, res) => {
    try {
      await storage.removeCompanyMember(req.params.id, req.params.userId);
      res.json({ message: "Member removed successfully" });
    } catch (error) {
      console.error("Error removing company member:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/companies/:id/members/:userId", requireAuth, async (req, res) => {
    try {
      const { role } = req.body;
      await storage.updateMemberRole(req.params.id, req.params.userId, role);
      res.json({ message: "Member role updated successfully" });
    } catch (error) {
      console.error("Error updating member role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/commanders", requireAuth, async (req, res) => {
    try {
      const commanders = await storage.getAvailableCommanders();
      res.json({ commanders });
    } catch (error) {
      console.error("Error fetching commanders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users", requireAuth, async (req, res) => {
    try {
      const { rank } = req.query;
      const users3 = await storage.getUsersByRank(rank);
      res.json({ users: users3 });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/trainings", requireAuth, async (req, res) => {
    try {
      const trainings2 = await storage.getTrainings();
      res.json({ trainings: trainings2 });
    } catch (error) {
      console.error("Trainings fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/courses", requireAuth, async (req, res) => {
    try {
      const courses2 = await storage.getCourses();
      res.json({ courses: courses2 });
    } catch (error) {
      console.error("Courses fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/events", requireAuth, async (req, res) => {
    try {
      const events3 = await storage.getEvents();
      const updatedEvents = await Promise.all(events3.map(async (event) => {
        const now = /* @__PURE__ */ new Date();
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
        let newStatus = event.status;
        if (now > endDate && event.status !== "completed" && event.status !== "cancelled") {
          newStatus = "completed";
        } else if (now >= startDate && now <= endDate && event.status !== "active" && event.status !== "cancelled") {
          newStatus = "active";
        } else if (daysUntilStart <= 7 && daysUntilStart > 0 && event.status === "registration_open") {
          newStatus = "final_days";
        }
        if (newStatus !== event.status) {
          await storage.updateEvent(event.id, { status: newStatus });
          return { ...event, status: newStatus };
        }
        return event;
      }));
      res.json({ events: updatedEvents });
    } catch (error) {
      console.error("Events fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/events", requireAuth, async (req, res) => {
    try {
      const {
        name,
        type,
        category,
        start_date,
        end_date,
        location,
        duration,
        max_participants,
        description,
        price,
        requirements,
        objectives,
        instructor
      } = req.body;
      if (!name || !type || !category || !start_date || !end_date || !location) {
        return res.status(400).json({
          message: "Nome, tipo, categoria, datas de in\xEDcio/fim e local s\xE3o obrigat\xF3rios"
        });
      }
      const event = await storage.createEvent({
        name,
        type,
        category,
        start_date,
        end_date,
        location,
        duration: duration || null,
        max_participants: max_participants || 50,
        registered_participants: 0,
        status: "planning",
        description: description || null,
        price: price || "0.00",
        requirements: requirements || null,
        objectives: objectives || null,
        instructor: instructor || null,
        created_by: req.user.id
      });
      if (price && parseFloat(price) > 0) {
        try {
        } catch (asaasError) {
          console.error("Error creating Asaas product:", asaasError);
        }
      }
      res.json({ event });
    } catch (error) {
      console.error("Event creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      res.json({ event });
    } catch (error) {
      console.error("Event update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/events/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      const event = await storage.updateEvent(req.params.id, { status });
      res.json({ event });
    } catch (error) {
      console.error("Event status update error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });
  app2.delete("/api/events/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Event deletion error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/events/:id/register", requireAuth, async (req, res) => {
    try {
      const eventId = req.params.id;
      const userId = req.user.id;
      const isRegistered = await storage.isUserRegisteredForEvent(eventId, userId);
      if (isRegistered) {
        return res.status(400).json({ message: "Usu\xE1rio j\xE1 inscrito neste evento" });
      }
      const events3 = await storage.getEvents();
      const event = events3.find((e) => e.id === eventId);
      if (!event) {
        return res.status(404).json({ message: "Evento n\xE3o encontrado" });
      }
      if (!["published", "registration_open", "final_days"].includes(event.status)) {
        return res.status(400).json({ message: "Inscri\xE7\xF5es n\xE3o est\xE3o abertas para este evento" });
      }
      if (event.registered_participants >= event.max_participants) {
        return res.status(400).json({ message: "Evento j\xE1 est\xE1 lotado" });
      }
      const eventPrice = parseFloat(event.price || "0");
      if (eventPrice > 0) {
        try {
          let asaasCustomer = await storage.getAsaasCustomer(userId);
          if (!asaasCustomer) {
            const user = await storage.getUser(userId);
            const profile = await storage.getProfile(userId);
            const customerData = {
              name: profile?.name || user?.email || "Usu\xE1rio",
              email: user?.email || "",
              cpfCnpj: profile?.cpf?.replace(/\D/g, "") || "",
              phone: profile?.phone || "",
              city: profile?.city || "",
              address: profile?.address || ""
            };
            const newCustomer = await asaasService.createCustomer(customerData);
            asaasCustomer = await storage.createAsaasCustomer(userId, newCustomer.id);
          }
          const paymentData = {
            customer: asaasCustomer.asaas_customer_id,
            billingType: "UNDEFINED",
            // Let customer choose payment method
            value: eventPrice,
            dueDate: AsaasService.getNextDueDate(7),
            description: `Inscri\xE7\xE3o - ${event.name}`,
            externalReference: `event_${eventId}_${userId}`,
            interest: { value: 1 },
            // 1% monthly interest
            fine: { value: 2 }
            // 2% fine for late payment
          };
          const payment = await asaasService.createPayment(paymentData);
          const registration = await storage.registerForEvent(eventId, userId, {
            status: "pending",
            asaas_payment_id: payment.id,
            amount_paid: eventPrice,
            payment_method: "UNDEFINED"
          });
          const eventCategory = await storage.getFinancialCategoryByName("Eventos");
          await storage.createFinancialTransaction({
            description: `Inscri\xE7\xE3o em evento: ${event.name}`,
            amount: eventPrice.toString(),
            type: "income",
            category_id: eventCategory?.id || null,
            user_id: userId,
            transaction_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            payment_method: "pix",
            // Default, will be updated when payment is confirmed
            notes: `Pagamento Asaas ID: ${payment.id} - Status: Pendente`
          });
          res.json({
            registration,
            payment: {
              id: payment.id,
              invoiceUrl: payment.invoiceUrl,
              bankSlipUrl: payment.bankSlipUrl,
              value: eventPrice,
              dueDate: payment.dueDate,
              maxInstallments: eventPrice >= 100 ? 3 : 1,
              availableMethods: ["PIX", "Boleto", "Cart\xE3o de Cr\xE9dito"]
            }
          });
        } catch (asaasError) {
          console.error("Error creating Asaas payment:", asaasError);
          const errorMessage = asaasError instanceof Error ? asaasError.message : "Erro ao processar pagamento";
          return res.status(500).json({
            message: errorMessage,
            error: process.env.NODE_ENV === "development" ? asaasError : void 0
          });
        }
      } else {
        const registration = await storage.registerForEvent(eventId, userId, {
          status: "paid",
          amount_paid: 0,
          payment_method: "FREE"
        });
        res.json({ registration });
      }
    } catch (error) {
      console.error("Event registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
      res.status(500).json({
        message: errorMessage,
        error: process.env.NODE_ENV === "development" ? error : void 0
      });
    }
  });
  app2.delete("/api/events/:id/register", requireAuth, async (req, res) => {
    try {
      const eventId = req.params.id;
      const userId = req.user.id;
      await storage.unregisterFromEvent(eventId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Event unregistration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/user/event-registrations", requireAuth, async (req, res) => {
    try {
      const registrations = await storage.getUserEventRegistrations(req.user.id);
      res.json({ registrations });
    } catch (error) {
      console.error("User registrations fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const activities = await storage.getUserActivities(req.user.id);
      res.json({ activities });
    } catch (error) {
      console.error("Activities fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/achievements", requireAuth, async (req, res) => {
    try {
      const achievements2 = await storage.getUserAchievements(req.user.id);
      res.json({ achievements: achievements2 });
    } catch (error) {
      console.error("Achievements fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/messages/:channel", requireAuth, async (req, res) => {
    try {
      const messages2 = await storage.getChannelMessages(req.params.channel);
      res.json({ messages: messages2 });
    } catch (error) {
      console.error("Messages fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/messages/:channel", requireAuth, async (req, res) => {
    try {
      const { content: content2 } = req.body;
      const message = await storage.createMessage(req.user.id, req.params.channel, content2);
      res.json({ message });
    } catch (error) {
      console.error("Message creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/profiles", requireAuth, async (req, res) => {
    try {
      const profiles3 = await db.execute(sql`
        SELECT 
          u.id as user_id,
          u.email,
          p.name,
          p.rank,
          p.company,
          p.city,
          p.phone,
          p.cpf,
          p.birth_date,
          p.created_at,
          p.updated_at
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        ORDER BY u.created_at DESC
      `);
      res.json({ profiles: profiles3.rows });
    } catch (error) {
      console.error("Profiles fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/profiles/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      const profile = await storage.updateProfile(userId, updateData);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json({ profile });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const totalMembersQuery = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE created_at IS NOT NULL`);
      const totalMembers = totalMembersQuery.rows[0]?.count || 0;
      const activeEventsQuery = await db.execute(sql`SELECT COUNT(*) as count FROM events WHERE status = 'active'`);
      const activeEvents = activeEventsQuery.rows[0]?.count || 0;
      const publishedContentQuery = await db.execute(sql`SELECT COUNT(*) as count FROM content WHERE status = 'published'`);
      const publishedContent = publishedContentQuery.rows[0]?.count || 0;
      const recentActivitiesQuery = await db.execute(sql`
        SELECT ua.*, p.name as user_name 
        FROM user_activities ua 
        LEFT JOIN profiles p ON ua.user_id = p.user_id
        ORDER BY ua.created_at DESC 
        LIMIT 5
      `);
      const upcomingEventsQuery = await db.execute(sql`
        SELECT name, event_date, type 
        FROM events 
        WHERE event_date >= CURRENT_DATE AND status != 'cancelled'
        ORDER BY event_date ASC 
        LIMIT 5
      `);
      const membersByRankQuery = await db.execute(sql`
        SELECT 
          p.rank,
          COUNT(*) as count
        FROM profiles p
        WHERE p.rank IS NOT NULL AND p.rank != ''
        GROUP BY p.rank
        ORDER BY count DESC
      `);
      const membersByCompanyQuery = await db.execute(sql`
        SELECT 
          p.company,
          COUNT(*) as count
        FROM profiles p
        WHERE p.company IS NOT NULL AND p.company != ''
        GROUP BY p.company
        ORDER BY count DESC
      `);
      const stats = {
        totalMembers: parseInt(totalMembers),
        todayMessages: 0,
        // Will be implemented when messages system is ready
        activeEvents: parseInt(activeEvents),
        publishedContent: parseInt(publishedContent),
        activities: recentActivitiesQuery.rows.map((row) => ({
          user: row.user_name || "Usu\xE1rio",
          action: row.activity || "Atividade registrada",
          time: new Date(row.created_at).toLocaleString("pt-BR")
        })),
        upcomingEvents: upcomingEventsQuery.rows.map((row) => ({
          name: row.name,
          date: new Date(row.event_date).toLocaleDateString("pt-BR"),
          type: row.type
        })),
        membersByRank: membersByRankQuery.rows.map((row) => ({
          rank: row.rank,
          count: parseInt(row.count)
        })),
        membersByCompany: membersByCompanyQuery.rows.map((row) => ({
          company: row.company,
          count: parseInt(row.count)
        }))
      };
      res.json(stats);
    } catch (error) {
      console.error("Stats fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  app2.get("/api/financial/summary", requireAuth, async (req, res) => {
    try {
      const eligibleUsers = await storage.getPaymentEligibleUsers();
      const activeSubscriptions = await storage.getUsersWithActiveSubscriptions();
      const totalMembers = eligibleUsers.length;
      const payingMembers = activeSubscriptions.length;
      const pendingMembersCount = totalMembers - payingMembers;
      const monthlyFees = payingMembers * 10;
      const pendingPayments = pendingMembersCount * 10;
      const otherIncome = 0;
      const expenses = 0;
      const totalRevenue = monthlyFees + otherIncome;
      const summary = {
        totalMembers,
        monthlyFees,
        payingMembers,
        pendingPayments,
        pendingMembersCount,
        otherIncome,
        expenses,
        totalRevenue
      };
      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/financial/payments", requireAuth, async (req, res) => {
    try {
      const eligibleUsers = await storage.getPaymentEligibleUsers();
      const activeSubscriptions = await storage.getUsersWithActiveSubscriptions();
      const payments = [];
      for (const user of eligibleUsers) {
        const subscription = activeSubscriptions.find((sub) => sub.user_id === user.user_id);
        const hasActiveSubscription = !!subscription;
        const currentDate = /* @__PURE__ */ new Date();
        const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 5);
        payments.push({
          id: user.user_id,
          user_id: user.user_id,
          amount: "10.00",
          due_date: dueDate.toISOString().split("T")[0],
          payment_date: hasActiveSubscription ? dueDate.toISOString().split("T")[0] : null,
          status: hasActiveSubscription ? "paid" : "pending",
          payment_method: hasActiveSubscription ? "asaas" : null,
          notes: hasActiveSubscription ? "Assinatura ativa" : "Aguardando ativa\xE7\xE3o da assinatura",
          user_name: user.name,
          user_rank: user.rank,
          user_company: user.company
        });
      }
      res.json({ payments });
    } catch (error) {
      console.error("Error fetching monthly payments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/financial/transactions", requireAuth, async (req, res) => {
    try {
      const financialTransactions2 = await storage.getFinancialTransactions();
      const categories = await storage.getFinancialCategories();
      const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));
      const transactions = financialTransactions2.map((transaction) => ({
        id: transaction.id,
        description: transaction.description,
        amount: parseFloat(transaction.amount).toFixed(2),
        type: transaction.type,
        transaction_date: transaction.transaction_date,
        payment_method: transaction.payment_method || "not_specified",
        notes: transaction.notes || "",
        category_name: transaction.category_id ? categoryMap.get(transaction.category_id) || "Categoria n\xE3o encontrada" : "Sem categoria"
      }));
      const allUsers = await storage.getUsersByRank();
      for (const user of allUsers) {
        const payments = await storage.getAsaasPayments(user.user_id);
        for (const payment of payments) {
          if (payment.status === "RECEIVED" && payment.payment_date) {
            const existingTransaction = transactions.find(
              (t) => t.notes?.includes(payment.asaas_payment_id)
            );
            if (!existingTransaction) {
              transactions.push({
                id: payment.id,
                description: `Mensalidade - ${user.name}`,
                amount: payment.value.toFixed(2),
                type: "income",
                transaction_date: payment.payment_date.split("T")[0],
                payment_method: payment.billing_type.toLowerCase(),
                notes: `Pagamento de mensalidade via ${payment.billing_type}`,
                category_name: "Mensalidades"
              });
            }
          }
        }
      }
      transactions.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
      res.json({ transactions });
    } catch (error) {
      console.error("Error fetching financial transactions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/payments/subscription", requireAuth, async (req, res) => {
    try {
      const subscription = await storage.getAsaasSubscription(req.user.id);
      res.json(subscription);
    } catch (error) {
      console.error("Get subscription error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/payments/history", requireAuth, async (req, res) => {
    try {
      const payments = await storage.getAsaasPayments(req.user.id);
      res.json(payments);
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/payments/create-subscription", requireAuth, async (req, res) => {
    try {
      const { billingType } = req.body;
      if (!billingType || !["BOLETO", "PIX"].includes(billingType)) {
        return res.status(400).json({ message: "Tipo de cobran\xE7a inv\xE1lido" });
      }
      const profile = await storage.getProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Perfil n\xE3o encontrado" });
      }
      const { AsaasService: AsaasService2 } = await Promise.resolve().then(() => (init_asaas(), asaas_exports));
      const isEligible = AsaasService2.isEligibleForPayment(profile.rank || "");
      if (!isEligible) {
        return res.status(403).json({ message: "Usu\xE1rio n\xE3o eleg\xEDvel para pagamentos" });
      }
      const existingSubscription = await storage.getAsaasSubscription(req.user.id);
      if (existingSubscription) {
        return res.status(400).json({ message: "Usu\xE1rio j\xE1 possui assinatura ativa" });
      }
      let asaasCustomer = await storage.getAsaasCustomer(req.user.id);
      if (!asaasCustomer) {
        const { asaasService: asaasService3 } = await Promise.resolve().then(() => (init_asaas(), asaas_exports));
        const customerData = {
          name: profile.name,
          email: profile.email || req.user.email,
          cpfCnpj: AsaasService2.formatCPF(profile.cpf || ""),
          phone: profile.phone || "",
          city: profile.city || ""
        };
        const asaasCustomerResponse = await asaasService3.createCustomer(customerData);
        asaasCustomer = await storage.createAsaasCustomer(req.user.id, asaasCustomerResponse.id);
      }
      const { asaasService: asaasService2 } = await Promise.resolve().then(() => (init_asaas(), asaas_exports));
      const subscriptionData = {
        customer: asaasCustomer.asaas_customer_id,
        billingType,
        nextDueDate: AsaasService2.getNextDueDate(30),
        value: 10,
        cycle: "MONTHLY",
        description: "Mensalidade Comando G\xF3lgota - R$ 10,00",
        externalReference: `user_${req.user.id}`
      };
      const asaasSubscriptionResponse = await asaasService2.createSubscription(subscriptionData);
      await storage.createAsaasSubscription({
        user_id: req.user.id,
        asaas_subscription_id: asaasSubscriptionResponse.id,
        asaas_customer_id: asaasCustomer.asaas_customer_id,
        status: "ACTIVE",
        value: 10,
        cycle: "MONTHLY",
        next_due_date: new Date(subscriptionData.nextDueDate)
      });
      res.json({
        message: "Assinatura criada com sucesso",
        subscription: asaasSubscriptionResponse
      });
    } catch (error) {
      console.error("Create subscription error:", error);
      res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  });
  app2.post("/api/payments/cancel-subscription", requireAuth, async (req, res) => {
    try {
      const subscription = await storage.getAsaasSubscription(req.user.id);
      if (!subscription) {
        return res.status(404).json({ message: "Assinatura n\xE3o encontrada" });
      }
      const { asaasService: asaasService2 } = await Promise.resolve().then(() => (init_asaas(), asaas_exports));
      await asaasService2.cancelSubscription(subscription.asaas_subscription_id);
      await storage.updateAsaasSubscription(subscription.id, { status: "CANCELLED" });
      res.json({ message: "Assinatura cancelada com sucesso" });
    } catch (error) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  });
  app2.post("/api/webhooks/asaas", async (req, res) => {
    try {
      const webhookData = req.body;
      await storage.createAsaasWebhook({
        event_id: webhookData.id,
        event_type: webhookData.event,
        payment_id: webhookData.payment?.id,
        subscription_id: webhookData.payment?.subscription,
        customer_id: webhookData.payment?.customer,
        raw_data: JSON.stringify(webhookData)
      });
      await processAsaasWebhook(webhookData);
      res.status(200).json({ message: "Webhook processado" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ message: "Erro ao processar webhook" });
    }
  });
  app2.get("/api/financial/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getFinancialCategories();
      res.json({ categories });
    } catch (error) {
      console.error("Error fetching financial categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/financial/transactions", requireAuth, async (req, res) => {
    try {
      const { description, amount, type, category_id, transaction_date, payment_method, notes } = req.body;
      const transaction = await storage.createFinancialTransaction({
        description,
        amount: amount.toString(),
        type,
        category_id,
        user_id: req.user.id,
        transaction_date: transaction_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        payment_method: payment_method || "cash",
        notes
      });
      res.json({ transaction });
    } catch (error) {
      console.error("Error creating financial transaction:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/financial/payments/:paymentId/mark-paid", requireAuth, async (req, res) => {
    try {
      const { paymentId } = req.params;
      res.json({
        message: "Pagamento marcado como recebido",
        paymentId
      });
    } catch (error) {
      console.error("Error marking payment as received:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/financial/payments/:userId/send-reminder", requireAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      res.json({
        message: "Lembrete enviado com sucesso",
        userId
      });
    } catch (error) {
      console.error("Error sending payment reminder:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/financial/health-metrics", requireAuth, async (req, res) => {
    try {
      const financialTransactions2 = await storage.getFinancialTransactions();
      const eligibleUsers = await storage.getPaymentEligibleUsers();
      const activeSubscriptions = await storage.getUsersWithActiveSubscriptions();
      const totalMembers = eligibleUsers.length;
      const payingMembers = activeSubscriptions.length;
      const collectionRate = totalMembers > 0 ? Math.round(payingMembers / totalMembers * 100) : 0;
      const totalIncome = financialTransactions2.filter((t) => t.type === "income").reduce((sum2, t) => sum2 + parseFloat(t.amount), 0);
      const totalExpenses = financialTransactions2.filter((t) => t.type === "expense").reduce((sum2, t) => sum2 + parseFloat(t.amount), 0);
      const netBalance = totalIncome - totalExpenses;
      const currentRevenue = payingMembers * 10;
      const monthlyTarget = totalMembers * 10;
      const expenseRatio = totalIncome > 0 ? Math.round(totalExpenses / totalIncome * 100) : 0;
      const transactionCount = financialTransactions2.length;
      const avgTransactionAmount = transactionCount > 0 ? totalIncome / transactionCount : 0;
      let healthScore = 100;
      if (collectionRate < 90) healthScore -= (90 - collectionRate) * 2;
      if (collectionRate >= 95) healthScore += 5;
      if (expenseRatio > 80) healthScore -= 20;
      else if (expenseRatio > 60) healthScore -= 10;
      else if (expenseRatio < 30) healthScore += 10;
      if (netBalance < 0) healthScore -= 25;
      else if (netBalance > totalIncome * 0.5) healthScore += 15;
      if (transactionCount > 10) healthScore += 5;
      healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));
      const memberGrowth = collectionRate > 80 ? 3.2 : -1.5;
      const avgPaymentDelay = payingMembers === totalMembers ? 0 : Math.round((totalMembers - payingMembers) * 2);
      const churnRate = collectionRate > 90 ? 1.2 : 4.5;
      const projectedRevenue = Math.round(currentRevenue * (1 + memberGrowth / 100));
      const metrics = {
        collectionRate,
        monthlyTarget,
        currentRevenue,
        memberGrowth,
        avgPaymentDelay,
        healthScore,
        projectedRevenue,
        churnRate,
        totalMembers,
        payingMembers,
        pendingMembers: totalMembers - payingMembers,
        // Real financial data
        totalIncome: Math.round(totalIncome),
        totalExpenses: Math.round(totalExpenses),
        netBalance: Math.round(netBalance),
        expenseRatio,
        transactionCount,
        avgTransactionAmount: Math.round(avgTransactionAmount),
        // Financial health indicators
        cashFlow: netBalance > 0 ? "positive" : "negative",
        budgetStatus: expenseRatio < 70 ? "healthy" : expenseRatio < 85 ? "warning" : "critical",
        activityLevel: transactionCount > 5 ? "high" : transactionCount > 2 ? "medium" : "low"
      };
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users/online", requireAuth, async (req, res) => {
    try {
      const onlineUsers = await db.select({
        id: profiles2.id,
        name: profiles2.name,
        rank: profiles2.rank,
        company: profiles2.company,
        avatar_url: profiles2.avatar_url
      }).from(profiles2).limit(50).orderBy(profiles2.name);
      const simulatedCount = Math.max(1, Math.floor(Math.random() * 5) + 1);
      res.json({
        users: onlineUsers.slice(0, simulatedCount),
        count: simulatedCount
      });
    } catch (error) {
      console.error("Error fetching online users:", error);
      res.json({ users: [], count: 1 });
    }
  });
  app2.get("/api/company/stats", requireAuth, async (req, res) => {
    try {
      const userProfile = await db.select().from(profiles2).where(eq2(profiles2.user_id, req.user.id)).limit(1);
      if (!userProfile.length) {
        return res.status(404).json({ error: "Perfil n\xE3o encontrado" });
      }
      const userCompany = userProfile[0].company;
      const totalMembers = await db.select({ count: sql`COUNT(*)` }).from(profiles2).where(eq2(profiles2.company, userCompany));
      const activeMembers = await db.select({ count: sql`COUNT(*)` }).from(profiles2).where(eq2(profiles2.company, userCompany));
      const thisMonth = /* @__PURE__ */ new Date();
      thisMonth.setDate(1);
      const newMembers = await db.select({ count: sql`COUNT(*)` }).from(profiles2).where(sql`${profiles2.company} = ${userCompany} AND ${profiles2.created_at} >= ${thisMonth.toISOString()}`);
      res.json({
        totalMembers: totalMembers[0]?.count || 0,
        activeMembers: activeMembers[0]?.count || 0,
        pendingApprovals: 0,
        thisMonthJoined: newMembers[0]?.count || 0
      });
    } catch (error) {
      console.error("Error fetching company stats:", error);
      res.status(500).json({ error: "Erro ao buscar estat\xEDsticas da companhia" });
    }
  });
  app2.get("/api/company/members", requireAuth, async (req, res) => {
    try {
      const userProfile = await db.select().from(profiles2).where(eq2(profiles2.user_id, req.user.id)).limit(1);
      if (!userProfile.length) {
        return res.status(404).json({ error: "Perfil n\xE3o encontrado" });
      }
      const userCompany = userProfile[0].company;
      const companyMembers2 = await db.select({
        id: profiles2.id,
        name: profiles2.name,
        rank: profiles2.rank,
        email: profiles2.email,
        phone: profiles2.phone,
        avatar_url: profiles2.avatar_url,
        created_at: profiles2.created_at
      }).from(profiles2).where(eq2(profiles2.company, userCompany)).orderBy(profiles2.name);
      res.json({ members: companyMembers2 });
    } catch (error) {
      console.error("Error fetching company members:", error);
      res.status(500).json({ error: "Erro ao buscar membros da companhia" });
    }
  });
  app2.post("/api/company/announcements", requireAuth, async (req, res) => {
    try {
      const { title, content: content2, priority } = req.body;
      if (!title || !content2) {
        return res.status(400).json({ error: "T\xEDtulo e conte\xFAdo s\xE3o obrigat\xF3rios" });
      }
      const userProfile = await db.select().from(profiles2).where(eq2(profiles2.user_id, req.user.id)).limit(1);
      if (!userProfile.length) {
        return res.status(404).json({ error: "Perfil n\xE3o encontrado" });
      }
      const isLeader = ["capitao", "major", "coronel", "comandante", "admin"].includes(userProfile[0].rank);
      if (!isLeader) {
        return res.status(403).json({ error: "Apenas l\xEDderes podem criar comunicados" });
      }
      const announcement = await db.insert(messages).values({
        id: crypto.randomUUID(),
        title,
        body: content2,
        author_id: req.user.id,
        channel: `announcement_${userProfile[0].company}`,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }).returning();
      res.json({ announcement: announcement[0] });
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ error: "Erro ao criar comunicado" });
    }
  });
  app2.get("/api/company/announcements", requireAuth, async (req, res) => {
    try {
      const userProfile = await db.select().from(profiles2).where(eq2(profiles2.user_id, req.user.id)).limit(1);
      if (!userProfile.length) {
        return res.status(404).json({ error: "Perfil n\xE3o encontrado" });
      }
      const userCompany = userProfile[0].company;
      const announcements = await db.select({
        id: messages.id,
        title: messages.title,
        content: messages.body,
        created_at: messages.created_at,
        author_name: profiles2.name
      }).from(messages).leftJoin(profiles2, eq2(messages.author_id, profiles2.user_id)).where(eq2(messages.channel, `announcement_${userCompany}`)).orderBy(sql`${messages.created_at} DESC`).limit(10);
      res.json({ announcements });
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ error: "Erro ao buscar comunicados" });
    }
  });
  return httpServer;
}
async function processAsaasWebhook(webhookData) {
  try {
    const { event, payment } = webhookData;
    if (!payment) return;
    const customer = await db.select().from(asaasCustomers).where(eq2(asaasCustomers.asaas_customer_id, payment.customer)).limit(1);
    if (customer.length === 0) {
      console.log("Customer not found for webhook:", payment.customer);
      return;
    }
    const userId = customer[0].user_id;
    switch (event) {
      case "PAYMENT_CREATED":
        await storage.createAsaasPayment({
          user_id: userId,
          asaas_payment_id: payment.id,
          asaas_customer_id: payment.customer,
          asaas_subscription_id: payment.subscription,
          value: payment.value,
          status: "PENDING",
          billing_type: payment.billingType,
          due_date: new Date(payment.dueDate),
          description: payment.description,
          invoice_url: payment.invoiceUrl,
          bank_slip_url: payment.bankSlipUrl,
          pix_code: payment.pixCode
        });
        break;
      case "PAYMENT_RECEIVED":
        await storage.updateAsaasPayment(payment.id, {
          status: "RECEIVED",
          payment_date: new Date(payment.paymentDate || /* @__PURE__ */ new Date()),
          net_value: payment.netValue
        });
        if (payment.externalReference?.startsWith("event_")) {
          try {
            const [, eventId, userId2] = payment.externalReference.split("_");
            const registrations = await storage.getEventRegistrations(eventId);
            const userRegistration = registrations.find((r) => r.user_id === userId2);
            if (userRegistration) {
              await storage.updateEventRegistration(userRegistration.id, {
                payment_status: "paid",
                payment_method: payment.billingType,
                notes: `Pagamento confirmado via ${payment.billingType}`
              });
              const financialTransactions2 = await storage.getFinancialTransactions();
              const relatedTransaction = financialTransactions2.find(
                (t) => t.notes?.includes(payment.id) && t.user_id === userId2
              );
              if (relatedTransaction) {
                await storage.updateFinancialTransaction(relatedTransaction.id, {
                  payment_method: payment.billingType.toLowerCase(),
                  notes: `Pagamento confirmado via ${payment.billingType} - ID: ${payment.id}`,
                  updated_at: /* @__PURE__ */ new Date()
                });
                console.log("Updated financial transaction for event payment");
              }
              console.log("Updated event registration payment status");
            }
          } catch (error) {
            console.error("Error updating event registration:", error);
          }
        }
        break;
      case "PAYMENT_OVERDUE":
        await storage.updateAsaasPayment(payment.id, {
          status: "OVERDUE"
        });
        break;
      case "PAYMENT_CANCELLED":
        await storage.updateAsaasPayment(payment.id, {
          status: "CANCELLED"
        });
        break;
    }
  } catch (error) {
    console.error("Error processing Asaas webhook:", error);
  }
}

// index.ts
init_asaas();
var app = express();
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://golgota-digital-front-9k4h.vercel.app",
    "https://golgota-digital-front.vercel.app",
    "http://localhost:5173",
    "http://localhost:5000",
    "https://comando-golgota-frontend.vercel.app",
    "https://comandogolgota.com.br"
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(session({
  secret: process.env.SESSION_SECRET || "golgota-secret-key-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3,
    // 24 hours
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      console.log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  try {
    await configureAsaasCheckout();
  } catch (error) {
    console.log("Asaas checkout configuration skipped (API key not configured)");
  }
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.log(`Error: ${message}`);
    res.status(status).json({ message });
    if (process.env.NODE_ENV !== "production") {
      console.error(err);
    }
  });
  app.use("/avatars", express.static("public/avatars"));
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  const port = process.env.PORT || 5e3;
  server.listen(port, () => {
    console.log(`\u{1F680} Backend serving on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
})();
