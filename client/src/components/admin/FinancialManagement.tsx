import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FinancialManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const [summaryData, paymentsData, transactionsData] = await Promise.all([
        apiGet('/api/financial/summary'),
        apiGet('/api/financial/payments'),
        apiGet('/api/financial/transactions')
      ]);
      
      setStats({
        ...summaryData,
        payments: paymentsData.payments || [],
        transactions: transactionsData.transactions || []
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: "Erro ao carregar dados financeiros",
        description: "Não foi possível carregar os dados financeiros.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Real data from API
  const financialSummary = {
    totalRevenue: stats?.totalRevenue || 0,
    monthlyFees: stats?.monthlyFees || 0,
    otherIncome: stats?.otherIncome || 0,
    pendingPayments: stats?.pendingPayments || 0,
    totalMembers: stats?.totalMembers || 0,
    payingMembers: stats?.payingMembers || 0,
    pendingMembersCount: stats?.pendingMembersCount || 0
  };

  const monthlyPayments = stats?.payments || [];
  const otherTransactions = stats?.transactions || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600/20 text-green-400">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600/20 text-yellow-400">Pendente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-600/20 text-red-400">Atrasado</Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-400">{status}</Badge>;
    }
  };

  const getTransactionBadge = (type: string) => {
    return type === 'income' 
      ? <Badge className="bg-green-600/20 text-green-400">Entrada</Badge>
      : <Badge className="bg-red-600/20 text-red-400">Saída</Badge>;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Receita Total (Mês)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-military-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {financialSummary.totalRevenue}</div>
              <p className="text-xs text-green-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Mensalidades
              </CardTitle>
              <Users className="h-4 w-4 text-military-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {financialSummary.monthlyFees}</div>
              <p className="text-xs text-gray-400">
                {financialSummary.payingMembers}/{financialSummary.totalMembers} pagantes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Outras Receitas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-military-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {financialSummary.otherIncome}</div>
              <p className="text-xs text-green-400">
                Eventos, doações, vendas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Pagamentos Pendentes
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {financialSummary.pendingPayments}</div>
              <p className="text-xs text-red-400">
                {financialSummary.pendingMembersCount} membros em atraso
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Management Tabs */}
        <Tabs defaultValue="monthly-fees" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-military-black-light">
            <TabsTrigger value="monthly-fees" className="text-white data-[state=active]:bg-military-gold data-[state=active]:text-black">
              Mensalidades
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-white data-[state=active]:bg-military-gold data-[state=active]:text-black">
              Outras Transações
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-white data-[state=active]:bg-military-gold data-[state=active]:text-black">
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly-fees">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-military-gold">Controle de Mensalidades</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar membro..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-military-black border-military-gold/30 text-white w-64"
                      />
                    </div>
                    <Button size="sm" className="bg-military-gold hover:bg-military-gold-dark text-black">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                    <Button size="sm" variant="outline" className="border-military-gold/30 text-white hover:bg-military-gold/20">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-military-gold/20">
                      <TableHead className="text-gray-400">Nome</TableHead>
                      <TableHead className="text-gray-400">Patente</TableHead>
                      <TableHead className="text-gray-400">CIA</TableHead>
                      <TableHead className="text-gray-400">Valor</TableHead>
                      <TableHead className="text-gray-400">Vencimento</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                          Carregando pagamentos...
                        </TableCell>
                      </TableRow>
                    ) : monthlyPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                          Nenhum pagamento registrado para este mês.
                        </TableCell>
                      </TableRow>
                    ) : (
                      monthlyPayments.map((payment) => (
                        <TableRow key={payment.id} className="border-military-gold/20">
                          <TableCell className="text-white font-medium">{payment.user_name}</TableCell>
                          <TableCell className="text-gray-300">{payment.user_rank}</TableCell>
                          <TableCell className="text-gray-300">{payment.user_company}</TableCell>
                          <TableCell className="text-white">R$ {Number(payment.amount).toFixed(2)}</TableCell>
                          <TableCell className="text-gray-300">{new Date(payment.due_date).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost" className="text-military-gold hover:bg-military-gold/20">
                                Editar
                              </Button>
                              {payment.status !== 'Pago' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                  Confirmar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-military-gold">Outras Transações</CardTitle>
                  <Button className="bg-military-gold hover:bg-military-gold-dark text-black">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Transação
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-military-gold/20">
                      <TableHead className="text-gray-400">Descrição</TableHead>
                      <TableHead className="text-gray-400">Valor</TableHead>
                      <TableHead className="text-gray-400">Tipo</TableHead>
                      <TableHead className="text-gray-400">Data</TableHead>
                      <TableHead className="text-gray-400">Categoria</TableHead>
                      <TableHead className="text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                          Carregando transações...
                        </TableCell>
                      </TableRow>
                    ) : otherTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                          Nenhuma transação registrada para este período.
                        </TableCell>
                      </TableRow>
                    ) : (
                      otherTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="border-military-gold/20">
                          <TableCell className="text-white font-medium">{transaction.description}</TableCell>
                          <TableCell className={`font-medium ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                            R$ {Number(transaction.amount).toFixed(2)}
                          </TableCell>
                          <TableCell>{getTransactionBadge(transaction.type)}</TableCell>
                          <TableCell className="text-gray-300">{new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="text-gray-300">{transaction.category_name || 'Sem categoria'}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" className="text-military-gold hover:bg-military-gold/20">
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-military-black-light border-military-gold/20">
                <CardHeader>
                  <CardTitle className="text-military-gold">Gerar Relatório</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Tipo de Relatório</Label>
                    <Select>
                      <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Relatório Mensal</SelectItem>
                        <SelectItem value="quarterly">Relatório Trimestral</SelectItem>
                        <SelectItem value="annual">Relatório Anual</SelectItem>
                        <SelectItem value="payments">Inadimplência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Data Início</Label>
                      <Input type="date" className="bg-military-black border-military-gold/30 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Data Fim</Label>
                      <Input type="date" className="bg-military-black border-military-gold/30 text-white" />
                    </div>
                  </div>

                  <Button className="w-full bg-military-gold hover:bg-military-gold-dark text-black">
                    <Download className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-military-black-light border-military-gold/20">
                <CardHeader>
                  <CardTitle className="text-military-gold">Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Receita Janeiro 2025</span>
                      <span className="text-green-400 font-bold">R$ 2.470</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Despesas Janeiro 2025</span>
                      <span className="text-red-400 font-bold">R$ 80</span>
                    </div>
                    <div className="border-t border-military-gold/20 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Saldo Líquido</span>
                        <span className="text-military-gold font-bold text-lg">R$ 2.390</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-2">
                      <p className="text-gray-400 text-sm">Taxa de Pagamento</p>
                      <div className="w-full bg-military-black rounded-full h-2">
                        <div className="bg-military-gold h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                      <p className="text-xs text-gray-400">94% dos membros em dia</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FinancialManagement;