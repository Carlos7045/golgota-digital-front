import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, UserPlus, MoreHorizontal, Shield, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

export type UserRank = 'aluno' | 'soldado' | 'cabo' | 'sargento' | 'tenente' | 'capitao' | 'major' | 'coronel' | 'comandante' | 'admin';

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
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  rank: z.string().min(1, 'Patente é obrigatória'),
  company: z.string().min(1, 'Companhia é obrigatória'),
});

type AddUserForm = z.infer<typeof addUserSchema>;

const UserManagement = () => {
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  
  const { toast } = useToast();
  
  const form = useForm<AddUserForm>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: '',
      email: '',
      rank: '',
      company: '',
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiGet('/api/profiles');
      const mappedUsers = (data.profiles || []).map((profile: any) => ({
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        rank: profile.rank || 'soldado',
        company: 'Cia Gólgota',
        joinDate: new Date(profile.created_at).toLocaleDateString('pt-BR'),
        lastActive: 'Hoje',
        status: 'active'
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = (data: AddUserForm) => {
    const newUser: CommunityUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      rank: data.rank as UserRank,
      company: data.company,
      joinDate: new Date().toLocaleDateString('pt-BR'),
      lastActive: 'Agora',
      status: 'active'
    };

    setUsers([...users, newUser]);
    setIsAddUserOpen(false);
    form.reset();
    
    toast({
      title: "Sucesso",
      description: "Usuário foi adicionado com sucesso!"
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = rankFilter === 'all' || user.rank === rankFilter;
    const matchesCompany = companyFilter === 'all' || user.company === companyFilter;
    
    return matchesSearch && matchesRank && matchesCompany;
  });

  const promoteUser = (userId: string, newRank: UserRank) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, rank: newRank } : user
    ));
    
    toast({
      title: "Usuário promovido",
      description: `Usuário foi promovido para ${newRank}!`
    });
  };

  const toggleUserStatus = (userId: string, newStatus: 'active' | 'inactive') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    
    toast({
      title: "Status alterado",
      description: `Usuário está agora ${newStatus === 'active' ? 'ativo' : 'inativo'}!`
    });
  };

  const rankColors: Record<UserRank, string> = {
    aluno: 'bg-gray-600/20 text-gray-400',
    soldado: 'bg-green-600/20 text-green-400',
    cabo: 'bg-blue-600/20 text-blue-400',
    sargento: 'bg-purple-600/20 text-purple-400',
    tenente: 'bg-yellow-600/20 text-yellow-400',
    capitao: 'bg-orange-600/20 text-orange-400',
    major: 'bg-red-600/20 text-red-400',
    coronel: 'bg-pink-600/20 text-pink-400',
    comandante: 'bg-military-gold/20 text-military-gold',
    admin: 'bg-indigo-600/20 text-indigo-400'
  };

  const getRankBadge = (rank: UserRank) => (
    <Badge className={rankColors[rank]}>
      {rank.charAt(0).toUpperCase() + rank.slice(1)}
    </Badge>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-military-gold">Gerenciamento de Usuários</h1>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-military-gold text-military-black hover:bg-military-gold/80">
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-military-black-light border-military-gold/20">
              <DialogHeader>
                <DialogTitle className="text-military-gold">Adicionar Novo Usuário</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: João Silva" {...field} className="bg-military-black border-military-gold/30 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: joao@exemplo.com" {...field} className="bg-military-black border-military-gold/30 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Patente</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                              <SelectValue placeholder="Selecione a patente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-military-black-light border-military-gold/20">
                            <SelectItem value="aluno">Aluno</SelectItem>
                            <SelectItem value="soldado">Soldado</SelectItem>
                            <SelectItem value="cabo">Cabo</SelectItem>
                            <SelectItem value="sargento">Sargento</SelectItem>
                            <SelectItem value="tenente">Tenente</SelectItem>
                            <SelectItem value="capitao">Capitão</SelectItem>
                            <SelectItem value="major">Major</SelectItem>
                            <SelectItem value="coronel">Coronel</SelectItem>
                            <SelectItem value="comandante">Comandante</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Companhia</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                              <SelectValue placeholder="Selecione a companhia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-military-black-light border-military-gold/20">
                            <SelectItem value="Cia Gólgota">Cia Gólgota</SelectItem>
                            <SelectItem value="1ª Companhia">1ª Companhia</SelectItem>
                            <SelectItem value="2ª Companhia">2ª Companhia</SelectItem>
                            <SelectItem value="3ª Companhia">3ª Companhia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-military-gold text-military-black hover:bg-military-gold/80">
                    Adicionar Usuário
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card className="bg-military-black-light border-military-gold/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-military-black border-military-gold/30 text-white"
                />
              </div>
              <Select value={rankFilter} onValueChange={setRankFilter}>
                <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                  <SelectValue placeholder="Filtrar por patente" />
                </SelectTrigger>
                <SelectContent className="bg-military-black-light border-military-gold/20">
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
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                  <SelectValue placeholder="Filtrar por companhia" />
                </SelectTrigger>
                <SelectContent className="bg-military-black-light border-military-gold/20">
                  <SelectItem value="all">Todas as companhias</SelectItem>
                  <SelectItem value="Cia Gólgota">Cia Gólgota</SelectItem>
                  <SelectItem value="1ª Companhia">1ª Companhia</SelectItem>
                  <SelectItem value="2ª Companhia">2ª Companhia</SelectItem>
                  <SelectItem value="3ª Companhia">3ª Companhia</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-400 flex items-center">
                Total: {filteredUsers.length} usuários
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card className="bg-military-black-light border-military-gold/20">
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center text-gray-400 py-8">
                Carregando usuários...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-military-gold/20">
                    <TableHead className="text-military-gold">Nome</TableHead>
                    <TableHead className="text-military-gold">Email</TableHead>
                    <TableHead className="text-military-gold">Patente</TableHead>
                    <TableHead className="text-military-gold">Companhia</TableHead>
                    <TableHead className="text-military-gold">Ingresso</TableHead>
                    <TableHead className="text-military-gold">Status</TableHead>
                    <TableHead className="text-military-gold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-military-gold/10 hover:bg-military-gold/5">
                      <TableCell className="text-white font-medium">{user.name}</TableCell>
                      <TableCell className="text-gray-300">{user.email}</TableCell>
                      <TableCell>{getRankBadge(user.rank)}</TableCell>
                      <TableCell className="text-gray-300">{user.company}</TableCell>
                      <TableCell className="text-gray-300">{user.joinDate}</TableCell>
                      <TableCell>
                        <Badge className={user.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}>
                          {user.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-military-gold/30 text-white hover:bg-military-gold/10"
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}
                            className="border-military-gold/30 text-white hover:bg-military-gold/10"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;