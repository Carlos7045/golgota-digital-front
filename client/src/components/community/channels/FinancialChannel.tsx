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
  QrCode,
  Heart,
  Gift,
  TrendingUp
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

const paymentCategories = [
  {
    id: 'mensalidade',
    name: 'Mensalidade',
    description: 'Taxa mensal de membro ativo',
    value: 10.00,
    icon: CreditCard,
    color: 'text-military-gold',
    eligibleRanks: ['soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante']
  },
  {
    id: 'doacao',
    name: 'Doação',
    description: 'Contribuição voluntária para a obra',
    value: 0, // Variable amount
    icon: Heart,
    color: 'text-red-400',
    eligibleRanks: ['aluno', 'soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante']
  },
  {
    id: 'evento',
    name: 'Eventos',
    description: 'Inscrições para acampamentos e eventos',
    value: 0, // Variable amount
    icon: Calendar,
    color: 'text-blue-400',
    eligibleRanks: ['aluno', 'soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante']
  },
  {
    id: 'oferta',
    name: 'Ofertas Especiais',
    description: 'Contribuições para projetos especiais',
    value: 0, // Variable amount
    icon: Gift,
    color: 'text-purple-400',
    eligibleRanks: ['aluno', 'soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante']
  }
];

const FinancialChannel = () => {
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
      
      setSubscription(subscriptionRes || null);
      setPayments(paymentsRes || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados de pagamento:', error);
      // Don't show error toast for normal "no data" responses
      if (error.message && !error.message.includes('404') && !error.message.includes('Unauthorized')) {
        // Show error only for actual errors, not missing data
      }
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
      const response = await apiPost('/api/payments/create-subscription', { billingType });
      
      if (response.redirect_url) {
        // Redirecionar para a página de pagamento
        window.open(response.redirect_url, '_blank');
        toast({
          title: "Redirecionando para pagamento",
          description: `Você será direcionado para a página de pagamento ${billingType}!`
        });
      } else {
        toast({
          title: "Pagamento criado",
          description: "Seu pagamento foi criado com sucesso!"
        });
      }
      
      await fetchPaymentData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar pagamento",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
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

  const isEligibleForCategory = (category: any) => {
    if (!profile?.rank) return false;
    return category.eligibleRanks.includes(profile.rank.toLowerCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Carregando informações financeiras...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-military-black-light border border-military-gold/20 rounded-lg">
        <DollarSign className="w-6 h-6 text-military-gold" />
        <div>
          <h2 className="text-xl font-bold text-white">Painel Financeiro</h2>
          <p className="text-gray-400">Gerencie suas contribuições e mensalidades</p>
        </div>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="bg-military-black-light border border-military-gold/20">
          <TabsTrigger value="status" className="text-gray-400 data-[state=active]:text-military-gold">
            Meu Status
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-gray-400 data-[state=active]:text-military-gold">
            Categorias
          </TabsTrigger>
          <TabsTrigger value="history" className="text-gray-400 data-[state=active]:text-military-gold">
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader>
              <CardTitle className="text-white">Status das Mensalidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-military-gold/20 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Assinatura Mensal Ativa</p>
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
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-semibold mb-2">
                    Sem Assinatura Ativa
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {isEligibleForCategory({ eligibleRanks: ['soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante'] }) 
                      ? 'Active sua mensalidade para manter acesso completo'
                      : 'Mensalidades aplicáveis a partir do rank Soldado'
                    }
                  </p>
                  
                  {profile?.rank && isEligibleForCategory({ eligibleRanks: ['soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante'] }) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
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
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentCategories.map((category) => {
              const Icon = category.icon;
              const isEligible = isEligibleForCategory(category);
              
              return (
                <Card 
                  key={category.id} 
                  className={`bg-military-black-light border-military-gold/20 ${!isEligible ? 'opacity-50' : 'hover:border-military-gold/40 transition-colors'}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-military-black ${category.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{category.name}</h3>
                        <p className="text-gray-400 text-sm mb-3">{category.description}</p>
                        
                        {category.value > 0 && (
                          <div className="text-military-gold font-bold text-lg mb-2">
                            {formatCurrency(category.value)}
                          </div>
                        )}
                        
                        {!isEligible && (
                          <Badge variant="secondary" className="text-xs">
                            Requer rank: {category.eligibleRanks[0]}
                          </Badge>
                        )}
                        
                        {isEligible && category.id === 'mensalidade' && !subscription && (
                          <p className="text-xs text-gray-500">
                            Disponível para ativação
                          </p>
                        )}
                        
                        {isEligible && category.id !== 'mensalidade' && (
                          <p className="text-xs text-gray-500">
                            Em breve: sistema de contribuições
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
                  <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhum pagamento encontrado</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Seus pagamentos aparecerão aqui quando realizados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialChannel;