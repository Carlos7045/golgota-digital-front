import { AsaasCustomer, AsaasSubscription, AsaasPayment } from '@shared/schema';

export { AsaasCreatePaymentData };

export interface AsaasCustomerData {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface AsaasSubscriptionData {
  customer: string;
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UNDEFINED';
  nextDueDate: string;
  value: number;
  cycle: 'MONTHLY' | 'WEEKLY' | 'BIMONTHLY' | 'QUARTERLY' | 'YEARLY';
  description?: string;
  externalReference?: string;
}

export interface AsaasPaymentData {
  id: string;
  customer: string;
  subscription?: string;
  value: number;
  netValue?: number;
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'OVERDUE' | 'CANCELLED';
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UNDEFINED';
  dueDate: string;
  paymentDate?: string;
  description?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixCode?: string;
  installmentCount?: number;
  installmentValue?: number;
}

export interface AsaasCreatePaymentData {
  customer: string;
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UNDEFINED';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  interest?: {
    value: number;
  };
  fine?: {
    value: number;
  };
  discount?: {
    value: number;
    dueDateLimitDays: number;
  };
}

export interface AsaasWebhookData {
  id: string;
  event: string;
  dateCreated: string;
  payment?: AsaasPaymentData;
  subscription?: any;
  customer?: any;
}

export class AsaasService {
  private apiKey: string;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(apiKey: string, sandbox: boolean = true) {
    this.apiKey = apiKey;
    this.baseUrl = sandbox 
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://api.asaas.com/v3';
    
    this.headers = {
      'access_token': this.apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'Comando-Golgota/1.0'
    };
  }

  async createCustomer(customerData: AsaasCustomerData): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(customerData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao criar cliente: ${error.errors?.[0]?.description || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar cliente no Asaas:', error);
      throw error;
    }
  }

  async createSubscription(subscriptionData: AsaasSubscriptionData): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao criar assinatura: ${error.errors?.[0]?.description || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar assinatura no Asaas:', error);
      throw error;
    }
  }

  async updateSubscription(subscriptionId: string, updateData: Partial<AsaasSubscriptionData>): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao atualizar assinatura: ${error.errors?.[0]?.description || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar assinatura no Asaas:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao cancelar assinatura: ${error.errors?.[0]?.description || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao cancelar assinatura no Asaas:', error);
      throw error;
    }
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao buscar assinatura: ${error.errors?.[0]?.description || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar assinatura no Asaas:', error);
      throw error;
    }
  }

  async getSubscriptionPayments(subscriptionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}/payments`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao buscar pagamentos: ${error.errors?.[0]?.description || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar pagamentos no Asaas:', error);
      throw error;
    }
  }

  async createPayment(paymentData: AsaasCreatePaymentData): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao criar pagamento: ${error.errors?.[0]?.description || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar pagamento no Asaas:', error);
      throw error;
    }
  }

  async createPaymentLink(paymentLinkData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/paymentLinks`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(paymentLinkData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao criar link de pagamento: ${error.errors?.[0]?.description || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar link de pagamento no Asaas:', error);
      throw error;
    }
  }

  async getPixQrCode(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}/pixQrCode`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao buscar QR Code PIX: ${error.errors?.[0]?.description || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar QR Code PIX no Asaas:', error);
      throw error;
    }
  }

  async saveCheckoutCustomization(customization: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/myAccount/paymentCheckoutConfig`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(customization)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao personalizar checkout: ${error.errors?.[0]?.description || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao personalizar checkout no Asaas:', error);
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao buscar pagamento: ${error.errors?.[0]?.description || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar pagamento no Asaas:', error);
      throw error;
    }
  }

  // Utility methods
  static getNextDueDate(daysFromNow: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  static isEligibleForPayment(rank: string): boolean {
    const eligibleRanks = ['soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante'];
    return eligibleRanks.includes(rank.toLowerCase());
  }

  static formatCPF(cpf: string): string {
    // Remove all non-numeric characters
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Validate CPF length
    if (cleanCPF.length !== 11) {
      throw new Error('CPF deve ter 11 dígitos');
    }
    
    return cleanCPF;
  }

  static validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implement webhook signature validation if needed
    // For now, we'll just return true
    return true;
  }
}

export const asaasService = new AsaasService(
  process.env.ASAAS_API_KEY || '',
  process.env.NODE_ENV !== 'production'
);

// Configure checkout customization with Comando Gólgota theme
export const configureAsaasCheckout = async () => {
  try {
    const customization = {
      paymentCheckoutConfig: {
        logoBackgroundColor: '#1A1A1A',
        infoBackgroundColor: '#2A2A2A',
        fontColor: '#FFFFFF',
        primaryColor: '#D4AF37',
        primaryFontColor: '#000000',
        hideAsaasLogo: false
      },
      paymentCompanyInfoConfig: {
        name: 'Comando Gólgota',
        description: 'Comunidade Militar Cristã',
        logoUrl: null, // Can be added later when you have a logo URL
        primaryColor: '#D4AF37',
        backgroundColor: '#1A1A1A'
      }
    };

    await asaasService.saveCheckoutCustomization(customization);
    console.log('Checkout customization configured successfully');
  } catch (error) {
    console.log('Checkout customization skipped:', error.message);
    // Don't fail startup if customization fails
  }
};