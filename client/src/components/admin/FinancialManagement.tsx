import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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

const expenseSchema = z.object({
  description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
  notes: z.string().optional()
});

const FinancialManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    paymentRate: 0
  });
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Estados para transações
  const [monthlyPayments, setMonthlyPayments] = useState<any[]>([]);
  const [otherTransactions, setOtherTransactions] = useState<any[]>([]);
  
  // Form para adicionar despesas
  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });

  useEffect(() => {
    fetchFinancialData();
    fetchExpenseCategories();
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

      // Configurar dados reais para o resumo financeiro
      const transactions = transactionsData.transactions || [];
      const totalIncome = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
      const totalExpenses = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
      const netBalance = totalIncome - totalExpenses;
      
      // Calcular taxa de pagamento baseada nos pagamentos mensais
      const payments = paymentsData.payments || [];
      const totalPayments = payments.length;
      const paidPayments = payments.filter((p: any) => p.status === 'paid').length;
      const paymentRate = totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0;

      setFinancialSummary({
        totalIncome,
        totalExpenses,
        netBalance,
        paymentRate
      });

      setMonthlyPayments(payments);
      setOtherTransactions(transactions);
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

  const markPaymentAsReceived = async (paymentId: string) => {
    try {
      await apiPost(`/api/financial/payments/${paymentId}/mark-paid`);
      toast({
        title: "Pagamento confirmado",
        description: "O pagamento foi marcado como recebido."
      });
      await fetchFinancialData();
    } catch (error) {
      console.error('Error marking payment as received:', error);
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o pagamento.",
        variant: "destructive"
      });
    }
  };

  const sendPaymentReminder = async (userId: string) => {
    try {
      await apiPost(`/api/financial/payments/${userId}/send-reminder`);
      toast({
        title: "Lembrete enviado",
        description: "O lembrete de pagamento foi enviado ao membro."
      });
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o lembrete.",
        variant: "destructive"
      });
    }
  };

  const fetchExpenseCategories = async () => {
    try {
      const data = await apiGet('/api/financial/categories');
      setExpenseCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching expense categories:', error);
    }
  };

  const createExpense = async (data: z.infer<typeof expenseSchema>) => {
    try {
      await apiPost('/api/financial/transactions', {
        description: data.description,
        amount: data.amount,
        type: 'expense',
        category_id: data.category,
        transaction_date: data.date,
        payment_method: 'transfer',
        notes: data.notes
      });
      
      toast({
        title: "Despesa registrada",
        description: "A despesa foi registrada com sucesso."
      });
      
      setIsExpenseModalOpen(false);
      expenseForm.reset();
      await fetchFinancialData();
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a despesa.",
        variant: "destructive"
      });
    }
  };



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600/20 text-green-400">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600/20 text-yellow-400">Pendente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-600/20 text-red-400">Vencido</Badge>;
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
              <div className="text-2xl font-bold text-white">R$ {financialSummary.totalIncome.toFixed(2)}</div>
              <p className="text-xs text-green-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Dados atualizados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Despesas
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-military-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {financialSummary.totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-gray-400">
                Total de gastos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Saldo Líquido
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-military-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {financialSummary.netBalance.toFixed(2)}</div>
              <p className="text-xs text-gray-400">
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Taxa de Pagamento
              </CardTitle>
              <Users className="h-4 w-4 text-military-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{financialSummary.paymentRate.toFixed(1)}%</div>
              <p className="text-xs text-gray-400">
                Membros em dia
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
                              {payment.status !== 'paid' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => markPaymentAsReceived(payment.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Confirmar
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => sendPaymentReminder(payment.user_id)}
                                className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white"
                              >
                                Lembrar
                              </Button>
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
                  <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-military-gold hover:bg-military-gold-dark text-black">
                        <Plus className="h-4 w-4 mr-2" />
                        Registrar Despesa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-military-black-light border-military-gold/20">
                      <DialogHeader>
                        <DialogTitle className="text-military-gold">Registrar Nova Despesa</DialogTitle>
                      </DialogHeader>
                      <Form {...expenseForm}>
                        <form onSubmit={expenseForm.handleSubmit(createExpense)} className="space-y-4">
                          <FormField
                            control={expenseForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Descrição</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Aluguel do local" {...field} className="bg-military-black border-military-gold/30 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={expenseForm.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Valor</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="0.00" {...field} className="bg-military-black border-military-gold/30 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={expenseForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Categoria</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                                      <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {expenseCategories.map((category) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={expenseForm.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Data</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} className="bg-military-black border-military-gold/30 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={expenseForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Observações</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Informações adicionais..." {...field} className="bg-military-black border-military-gold/30 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsExpenseModalOpen(false)} className="border-gray-600 text-gray-400">
                              Cancelar
                            </Button>
                            <Button type="submit" className="bg-military-gold hover:bg-military-gold-dark text-black">
                              Registrar Despesa
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
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
                          <TableCell>
                            {transaction.type === 'income' ? (
                              <Badge className="bg-green-600/20 text-green-400">Receita</Badge>
                            ) : (
                              <Badge className="bg-red-600/20 text-red-400">Despesa</Badge>
                            )}
                          </TableCell>
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
                      <span className="text-gray-400">Receita (Total)</span>
                      <span className="text-green-400 font-bold">R$ {financialSummary.totalIncome.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Despesas (Total)</span>
                      <span className="text-red-400 font-bold">R$ {financialSummary.totalExpenses.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-military-gold/20 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Saldo Líquido</span>
                        <span className="text-military-gold font-bold text-lg">R$ {financialSummary.netBalance.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-2">
                      <p className="text-gray-400 text-sm">Taxa de Pagamento</p>
                      <div className="w-full bg-military-black rounded-full h-2">
                        <div className="bg-military-gold h-2 rounded-full" style={{ width: `${financialSummary.paymentRate}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-400">{financialSummary.paymentRate.toFixed(1)}% dos membros em dia</p>
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