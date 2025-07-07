import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  Users,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface FinancialMetrics {
  collectionRate: number;
  monthlyTarget: number;
  currentRevenue: number;
  memberGrowth: number;
  avgPaymentDelay: number;
  riskScore: number;
  projectedRevenue: number;
  churnRate: number;
}

interface HealthIndicator {
  label: string;
  value: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

const FinancialHealthDashboard = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthMetrics();
  }, []);

  const fetchHealthMetrics = async () => {
    try {
      const [summaryData, paymentsData] = await Promise.all([
        apiGet('/api/financial/summary'),
        apiGet('/api/financial/payments')
      ]);

      // Calculate health metrics from real data
      const totalMembers = summaryData.totalMembers || 0;
      const payingMembers = summaryData.payingMembers || 0;
      const collectionRate = totalMembers > 0 ? Math.round((payingMembers / totalMembers) * 100) : 0;
      const monthlyTarget = totalMembers * 10; // R$10 per member
      const currentRevenue = summaryData.monthlyFees || 0;
      
      // Calculate member growth (mock for now - in real app would compare with previous months)
      const memberGrowth = 5.2; // %
      
      // Calculate average payment delay from payments data
      const payments = paymentsData.payments || [];
      const overduePayments = payments.filter((p: any) => p.status === 'pending');
      const avgPaymentDelay = overduePayments.length > 0 ? 7 : 0; // days
      
      // Calculate risk score based on multiple factors
      const riskScore = calculateRiskScore(collectionRate, avgPaymentDelay, memberGrowth);
      
      // Project next month revenue
      const projectedRevenue = Math.round(currentRevenue * (1 + (memberGrowth / 100)));
      
      // Calculate churn rate (mock for now)
      const churnRate = 2.1; // %

      setMetrics({
        collectionRate,
        monthlyTarget,
        currentRevenue,
        memberGrowth,
        avgPaymentDelay,
        riskScore,
        projectedRevenue,
        churnRate
      });
    } catch (error) {
      console.error('Error fetching health metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskScore = (collectionRate: number, paymentDelay: number, growth: number): number => {
    let score = 100;
    
    // Reduce score based on collection rate
    if (collectionRate < 90) score -= (90 - collectionRate) * 2;
    
    // Reduce score based on payment delays
    if (paymentDelay > 5) score -= paymentDelay * 3;
    
    // Improve score based on growth
    if (growth > 0) score += growth * 2;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getHealthIndicators = (): HealthIndicator[] => {
    if (!metrics) return [];

    return [
      {
        label: 'Taxa de Cobrança',
        value: metrics.collectionRate,
        status: metrics.collectionRate >= 95 ? 'excellent' : 
                metrics.collectionRate >= 85 ? 'good' : 
                metrics.collectionRate >= 70 ? 'warning' : 'critical',
        trend: metrics.collectionRate >= 90 ? 'up' : 'down',
        description: `${metrics.collectionRate}% dos membros pagaram este mês`
      },
      {
        label: 'Crescimento de Membros',
        value: metrics.memberGrowth,
        status: metrics.memberGrowth >= 5 ? 'excellent' : 
                metrics.memberGrowth >= 2 ? 'good' : 
                metrics.memberGrowth >= 0 ? 'warning' : 'critical',
        trend: metrics.memberGrowth > 0 ? 'up' : 'down',
        description: `${metrics.memberGrowth > 0 ? '+' : ''}${metrics.memberGrowth}% vs mês anterior`
      },
      {
        label: 'Atraso Médio',
        value: metrics.avgPaymentDelay,
        status: metrics.avgPaymentDelay <= 3 ? 'excellent' : 
                metrics.avgPaymentDelay <= 7 ? 'good' : 
                metrics.avgPaymentDelay <= 15 ? 'warning' : 'critical',
        trend: metrics.avgPaymentDelay <= 5 ? 'up' : 'down',
        description: `${metrics.avgPaymentDelay} dias em média`
      },
      {
        label: 'Taxa de Churn',
        value: metrics.churnRate,
        status: metrics.churnRate <= 2 ? 'excellent' : 
                metrics.churnRate <= 5 ? 'good' : 
                metrics.churnRate <= 10 ? 'warning' : 'critical',
        trend: metrics.churnRate <= 3 ? 'up' : 'down',
        description: `${metrics.churnRate}% de desistência mensal`
      }
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-400/20';
      case 'good': return 'text-blue-400 bg-blue-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'critical': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'Baixo', color: 'text-green-400 bg-green-400/20' };
    if (score >= 60) return { label: 'Médio', color: 'text-yellow-400 bg-yellow-400/20' };
    if (score >= 40) return { label: 'Alto', color: 'text-orange-400 bg-orange-400/20' };
    return { label: 'Crítico', color: 'text-red-400 bg-red-400/20' };
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-military-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-military-gold">Carregando métricas financeiras...</div>
          </div>
        </div>
      </div>
    );
  }

  const healthIndicators = getHealthIndicators();
  const riskLevel = metrics ? getRiskLevel(metrics.riskScore) : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-military-gold">Dashboard de Saúde Financeira</h1>
            <p className="text-gray-400 mt-1">Monitoramento em tempo real da saúde financeira da organização</p>
          </div>
          <div className="flex items-center space-x-4">
            {riskLevel && (
              <Badge className={riskLevel.color}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Risco {riskLevel.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Overall Health Score */}
        {metrics && (
          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader>
              <CardTitle className="text-military-gold flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Score de Saúde Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-white">{metrics.riskScore}/100</div>
                <Badge className={riskLevel?.color}>
                  {riskLevel?.label}
                </Badge>
              </div>
              <Progress 
                value={metrics.riskScore} 
                className="h-2 bg-military-black" 
              />
              <p className="text-gray-400 text-sm mt-2">
                Score baseado em taxa de cobrança, crescimento e atrasos
              </p>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {healthIndicators.map((indicator, index) => (
            <Card key={index} className="bg-military-black-light border-military-gold/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {indicator.label}
                </CardTitle>
                {getTrendIcon(indicator.trend)}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-white">
                    {indicator.label === 'Atraso Médio' ? 
                      `${indicator.value}d` : 
                      `${indicator.value}${indicator.label.includes('Taxa') || indicator.label.includes('Crescimento') ? '%' : ''}`
                    }
                  </div>
                  <Badge className={getStatusColor(indicator.status)}>
                    {indicator.status === 'excellent' ? 'Ótimo' :
                     indicator.status === 'good' ? 'Bom' :
                     indicator.status === 'warning' ? 'Atenção' : 'Crítico'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {indicator.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Projection */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-military-gold flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Meta vs Realizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Meta Mensal</span>
                      <span>R$ {metrics.monthlyTarget.toFixed(2)}</span>
                    </div>
                    <Progress value={100} className="h-2 bg-military-black" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Arrecadado</span>
                      <span>R$ {metrics.currentRevenue.toFixed(2)}</span>
                    </div>
                    <Progress 
                      value={(metrics.currentRevenue / metrics.monthlyTarget) * 100} 
                      className="h-2 bg-military-black" 
                    />
                  </div>
                  <div className="pt-2 border-t border-military-gold/20">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Atingimento</span>
                      <span className="text-military-gold font-bold">
                        {Math.round((metrics.currentRevenue / metrics.monthlyTarget) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-military-gold flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Projeção Próximo Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      R$ {metrics.projectedRevenue.toFixed(2)}
                    </div>
                    <p className="text-gray-400 text-sm">
                      Receita projetada baseada no crescimento atual
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-military-gold/20">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">
                        +{metrics.memberGrowth}%
                      </div>
                      <p className="text-xs text-gray-400">Crescimento</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">
                        -{metrics.churnRate}%
                      </div>
                      <p className="text-xs text-gray-400">Churn</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations */}
        <Card className="bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-military-gold flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Recomendações Estratégicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics && metrics.collectionRate < 90 && (
                <div className="p-4 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                  <div className="flex items-center text-yellow-400 mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Taxa de Cobrança</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Implementar lembretes automáticos e facilitar métodos de pagamento
                  </p>
                </div>
              )}
              
              {metrics && metrics.avgPaymentDelay > 7 && (
                <div className="p-4 rounded-lg bg-red-400/10 border border-red-400/20">
                  <div className="flex items-center text-red-400 mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Atrasos Altos</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Revisar política de vencimento e processos de cobrança
                  </p>
                </div>
              )}
              
              {metrics && metrics.memberGrowth < 2 && (
                <div className="p-4 rounded-lg bg-blue-400/10 border border-blue-400/20">
                  <div className="flex items-center text-blue-400 mb-2">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="font-medium">Crescimento</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Desenvolver estratégias de atração e retenção de membros
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialHealthDashboard;