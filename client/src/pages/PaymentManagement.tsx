import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Download,
  QrCode
} from 'lucide-react';

interface UserSubscription {
  id: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  value: number;
  next_due_date: string;
  asaas_subscription_id: string;
}

interface Payment {
  id: string;
  value: number;
  net_value: number;
  status: 'PENDING' | 'RECEIVED' | 'OVERDUE' | 'CANCELLED';
  billing_type: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
  due_date: string;
  payment_date?: string;
  description: string;
  invoice_url?: string;
  bank_slip_url?: string;
  pix_code?: string;
}

const PaymentManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchPaymentData = async () => {
    try {
      const [subscriptionRes, paymentsRes] = await Promise.all([
        apiGet('/api/payments/subscription'),
        apiGet('/api/payments/history')
      ]);
      
      setSubscription(subscriptionRes);
      setPayments(paymentsRes);
    } catch (error: any) {
      console.error('Erro ao carregar dados de pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const createSubscription = async (billingType: 'BOLETO' | 'PIX') => {
    setCreating(true);
    try {
      await apiPost('/api/payments/create-subscription', { billingType });
      toast({
        title: "Assinatura criada",
        description: "Sua assinatura mensal foi criada com sucesso!"
      });
      await fetchPaymentData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar assinatura",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      await apiPost('/api/payments/cancel-subscription', {});
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada com sucesso"
      });
      await fetchPaymentData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cancelar assinatura",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'RECEIVED': { label: 'Pago', variant: 'default' as const, icon: CheckCircle },
      'PENDING': { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      'OVERDUE': { label: 'Vencido', variant: 'destructive' as const, icon: XCircle },
      'CANCELLED': { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle },
      'ACTIVE': { label: 'Ativa', variant: 'default' as const, icon: CheckCircle },
      'EXPIRED': { label: 'Expirada', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="secondary">{status}</Badge>;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isEligible = profile?.rank && ['soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante'].includes(profile.rank.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-military-black p-6 flex items-center justify-center">
        <div className="text-white">Carregando informações de pagamento...</div>
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="min-h-screen bg-military-black p-6">
        <Card className="max-w-2xl mx-auto bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-military-gold" />
              Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                Pagamentos são aplicáveis apenas para membros com rank de <strong>Soldado</strong> ou superior.
              </p>
              <p className="text-gray-500">
                Seu rank atual: <strong>{profile?.rank || 'Não definido'}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-military-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-military-gold" />
              Gerenciamento de Pagamentos
            </CardTitle>
            <p className="text-gray-400">
              Mensalidade: <strong>{formatCurrency(10)}</strong> • Rank: <strong>{profile?.rank}</strong>
            </p>
          </CardHeader>
        </Card>

        <Tabs defaultValue="subscription" className="space-y-4">
          <TabsList className="bg-military-black-light border border-military-gold/20">
            <TabsTrigger value="subscription" className="text-gray-400 data-[state=active]:text-military-gold">
              Assinatura
            </TabsTrigger>
            <TabsTrigger value="history" className="text-gray-400 data-[state=active]:text-military-gold">
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscription">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-white">Status da Assinatura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Assinatura Mensal</p>
                        <p className="text-gray-400">
                          Próximo vencimento: {formatDate(subscription.next_due_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-military-gold font-bold text-lg">
                          {formatCurrency(subscription.value)}
                        </div>
                        {getStatusBadge(subscription.status)}
                      </div>
                    </div>

                    {subscription.status === 'ACTIVE' && (
                      <Button
                        variant="destructive"
                        onClick={cancelSubscription}
                        className="w-full"
                      >
                        Cancelar Assinatura
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <DollarSign className="w-12 h-12 text-military-gold mx-auto mb-4" />
                      <h3 className="text-white text-lg font-semibold mb-2">
                        Ativar Mensalidade
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Ative sua mensalidade de {formatCurrency(10)} para manter acesso completo à plataforma
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          onClick={() => createSubscription('BOLETO')}
                          disabled={creating}
                          className="bg-military-gold text-black hover:bg-military-gold-dark"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Pagar com Boleto
                        </Button>
                        
                        <Button
                          onClick={() => createSubscription('PIX')}
                          disabled={creating}
                          className="bg-military-gold text-black hover:bg-military-gold-dark"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Pagar com PIX
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-white">Histórico de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border border-military-gold/20 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-white font-medium">{payment.description}</p>
                            {getStatusBadge(payment.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Venc: {formatDate(payment.due_date)}
                            </span>
                            {payment.payment_date && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Pago: {formatDate(payment.payment_date)}
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {payment.billing_type}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-military-gold font-bold">
                            {formatCurrency(payment.value)}
                          </div>
                          {payment.net_value && (
                            <div className="text-xs text-gray-500">
                              Líquido: {formatCurrency(payment.net_value)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum pagamento encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PaymentManagement;