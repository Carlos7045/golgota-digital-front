import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, UserPlus, MoreHorizontal, Shield, UserCheck } from 'lucide-react';
import { UserRank } from '@/pages/Community';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface CommunityUser {
  id: string;
  name: string;
  email: string;
  rank: UserRank;
  company: string;
  joinDate: string;
  lastActive: string;
  status: 'active' | 'inactive';
  cpglRegister?: string;
  city?: string;
  cpglYear?: number;
  cpglMonth?: number;
}

const addUserSchema = z.object({
  cpglRegister: z.string().min(1, 'Registro CPGL é obrigatório'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  company: z.string().min(1, 'Companhia é obrigatória'),
  rank: z.string().min(1, 'Patente é obrigatória'),
  cpglYear: z.string().min(1, 'Ano do CPGL é obrigatório'),
  cpglMonth: z.string().min(1, 'Mês do CPGL é obrigatório'),
});

type AddUserForm = z.infer<typeof addUserSchema>;

// Dados fictícios removidos - agora conectado ao Supabase

const rankColors: Record<UserRank, string> = {
  'aluno': 'bg-gray-500',
  'soldado': 'bg-green-600',
  'cabo': 'bg-green-700',
  'sargento': 'bg-blue-600',
  'tenente': 'bg-blue-700',
  'capitao': 'bg-purple-600',
  'major': 'bg-purple-700',
  'coronel': 'bg-red-600',
  'comandante': 'bg-red-700',
  'admin': 'bg-military-gold'
};

const UserManagement = () => {
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          name,
          email,
          rank,
          created_at,
          updated_at
        `);

      if (error) throw error;

      const formattedUsers: CommunityUser[] = profiles.map(profile => ({
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        rank: (profile.rank as UserRank) || 'soldado',
        company: 'Alpha', // Simplificado por enquanto
        joinDate: profile.created_at.split('T')[0],
        lastActive: profile.updated_at.split('T')[0],
        status: 'active' as const
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<AddUserForm>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      cpglRegister: '',
      name: '',
      email: '',
      city: '',
      company: '',
      rank: '',
      cpglYear: '',
      cpglMonth: '',
    },
  });

  const handleAddUser = (data: AddUserForm) => {
    const newUser: CommunityUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      rank: data.rank as UserRank,
      company: data.company,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      status: 'active',
      cpglRegister: data.cpglRegister,
      city: data.city,
      cpglYear: parseInt(data.cpglYear),
      cpglMonth: parseInt(data.cpglMonth),
    };

    setUsers([...users, newUser]);
    setIsAddUserOpen(false);
    form.reset();
    
    toast({
      title: "Usuário adicionado",
      description: `${data.name} foi adicionado com sucesso`,
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = rankFilter === 'all' || user.rank === rankFilter;
    const matchesCompany = companyFilter === 'all' || user.company === companyFilter;
    
    return matchesSearch && matchesRank && matchesCompany;
  });

  const handlePromoteUser = (userId: string) => {
    const rankHierarchy: UserRank[] = ['aluno', 'soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante'];
    
    setUsers(users.map(user => {
      if (user.id === userId) {
        const currentIndex = rankHierarchy.findIndex(rank => rank === user.rank);
        const newRank = currentIndex < rankHierarchy.length - 1 ? rankHierarchy[currentIndex + 1] : user.rank;
        
        if (newRank !== user.rank) {
          toast({
            title: "Usuário promovido",
            description: `${user.name} foi promovido para ${newRank}`,
          });
        }
        
        return { ...user, rank: newRank };
      }
      return user;
    }));
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        toast({
          title: "Status alterado",
          description: `${user.name} está agora ${newStatus === 'active' ? 'ativo' : 'inativo'}`,
        });
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Gestão de Usuários</h2>
            <p className="text-gray-400">Gerencie membros da comunidade</p>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-military-gold text-black hover:bg-military-gold/80">
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-military-black-light border-military-gold/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-military-gold">Adicionar Novo Membro</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cpglRegister"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Registro CPGL</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-military-black border-gray-600 text-white"
                              placeholder="Ex: CPGL-2024-001"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Nome Completo</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-military-black border-gray-600 text-white"
                              placeholder="Nome completo do membro"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Email</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              className="bg-military-black border-gray-600 text-white"
                              placeholder="email@exemplo.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Cidade</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-military-black border-gray-600 text-white"
                              placeholder="Cidade onde mora"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Companhia</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-military-black border-gray-600 text-white">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A">Cia A</SelectItem>
                              <SelectItem value="B">Cia B</SelectItem>
                              <SelectItem value="C">Cia C</SelectItem>
                              <SelectItem value="D">Cia D</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="rank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Patente</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-military-black border-gray-600 text-white">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="aluno">Aluno</SelectItem>
                              <SelectItem value="soldado">Soldado</SelectItem>
                              <SelectItem value="cabo">Cabo</SelectItem>
                              <SelectItem value="sargento">Sargento</SelectItem>
                              <SelectItem value="tenente">Tenente</SelectItem>
                              <SelectItem value="capitao">Capitão</SelectItem>
                              <SelectItem value="major">Major</SelectItem>
                              <SelectItem value="coronel">Coronel</SelectItem>
                              <SelectItem value="comandante">Comandante</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cpglYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Ano do CPGL</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-military-black border-gray-600 text-white">
                                <SelectValue placeholder="Selecione o ano" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cpglMonth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Mês do CPGL</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-military-black border-gray-600 text-white">
                                <SelectValue placeholder="Selecione o mês" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Janeiro</SelectItem>
                              <SelectItem value="2">Fevereiro</SelectItem>
                              <SelectItem value="3">Março</SelectItem>
                              <SelectItem value="4">Abril</SelectItem>
                              <SelectItem value="5">Maio</SelectItem>
                              <SelectItem value="6">Junho</SelectItem>
                              <SelectItem value="7">Julho</SelectItem>
                              <SelectItem value="8">Agosto</SelectItem>
                              <SelectItem value="9">Setembro</SelectItem>
                              <SelectItem value="10">Outubro</SelectItem>
                              <SelectItem value="11">Novembro</SelectItem>
                              <SelectItem value="12">Dezembro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddUserOpen(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-military-gold text-black hover:bg-military-gold/80"
                    >
                      Adicionar Membro
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="bg-military-black-light border-military-gold/20">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-military-black border-gray-600 text-white"
                  />
                </div>
              </div>
              <Select value={rankFilter} onValueChange={setRankFilter}>
                <SelectTrigger className="w-48 bg-military-black border-gray-600 text-white">
                  <SelectValue placeholder="Filtrar por patente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as patentes</SelectItem>
                  <SelectItem value="aluno">Aluno</SelectItem>
                  <SelectItem value="soldado">Soldado</SelectItem>
                  <SelectItem value="cabo">Cabo</SelectItem>
                  <SelectItem value="sargento">Sargento</SelectItem>
                  <SelectItem value="tenente">Tenente</SelectItem>
                  <SelectItem value="capitao">Capitão</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="coronel">Coronel</SelectItem>
                  <SelectItem value="comandante">Comandante</SelectItem>
                </SelectContent>
              </Select>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-32 bg-military-black border-gray-600 text-white">
                  <SelectValue placeholder="Cia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="A">Cia A</SelectItem>
                  <SelectItem value="B">Cia B</SelectItem>
                  <SelectItem value="C">Cia C</SelectItem>
                  <SelectItem value="D">Cia D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-military-gold">
              Membros ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-400">Nome</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Patente</TableHead>
                  <TableHead className="text-gray-400">Cia</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Última Atividade</TableHead>
                  <TableHead className="text-gray-400">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-gray-700">
                    <TableCell className="text-white font-medium">{user.name}</TableCell>
                    <TableCell className="text-gray-300">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`${rankColors[user.rank]} text-white text-xs uppercase`}>
                        {user.rank}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">Cia {user.company}</TableCell>
                    <TableCell>
                      <Badge className={user.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{user.lastActive}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePromoteUser(user.id)}
                          className="text-military-gold hover:bg-military-gold/20"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(user.id)}
                          className="text-gray-400 hover:bg-gray-600/20"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:bg-gray-600/20"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;