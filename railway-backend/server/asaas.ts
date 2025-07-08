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
    this.baseUrl = sandbox ? 'https://sandbox.asaas.com/api/v3' : 'https://www.asaas.com/api/v3';
    this.headers = {
      'Content-Type': 'application/json',
      'access_token': this.apiKey,
      'User-Agent': 'ComandoGolgota/1.0.0'
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
        const errorData = await response.text();
        throw new Error(`Erro ao criar cliente: ${errorData}`);
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
        const errorData = await response.text();
        throw new Error(`Erro ao criar assinatura: ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar assinatura no Asaas:', error);
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
        const errorData = await response.text();
        throw new Error(`Erro ao criar pagamento: ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar pagamento no Asaas:', error);
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
        const errorData = await response.text();
        throw new Error(`Erro ao buscar pagamento: ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar pagamento no Asaas:', error);
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
        const errorData = await response.text();
        throw new Error(`Erro ao buscar QR Code PIX: ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar QR Code PIX:', error);
      throw error;
    }
  }

  static getNextDueDate(daysFromNow: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  static isEligibleForPayment(rank: string): boolean {
    const eligibleRanks = ['soldado', 'cabo', 'sargento', 'subtenente', 'tenente', 'capitao', 'major', 'coronel', 'comandante', 'admin'];
    return eligibleRanks.includes(rank.toLowerCase());
  }

  static formatCPF(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  static validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implementar validação de webhook se necessário
    return true;
  }
}

// Instância do serviço Asaas
export const asaasService = new AsaasService(
  process.env.ASAAS_API_KEY || '',
  process.env.ASAAS_SANDBOX !== 'false'
);

export const configureAsaasCheckout = async () => {
  try {
    // Configuração básica do checkout será feita aqui se necessário
    console.log('Asaas service initialized');
  } catch (error) {
    console.error('Erro ao configurar checkout Asaas:', error);
  }
};