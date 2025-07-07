import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, UserPlus, MoreHorizontal, Shield, UserCheck, Eye, EyeOff, Trash2, AlertTriangle, Edit } from 'lucide-react';
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
  phone?: string;
  address?: string;
  birthDate?: string;
}

const addUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(14, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  rank: z.string().min(1, 'Patente é obrigatória'),
  company: z.string().min(1, 'Companhia é obrigatória'),
});

const editUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(14, 'CPF inválido').optional(),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').optional(),
  city: z.string().min(2, 'Cidade é obrigatória').optional(),
  address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres').optional(),
  birthDate: z.string().optional(),
  rank: z.string().min(1, 'Patente é obrigatória'),
  company: z.string().min(1, 'Companhia é obrigatória').optional(),
});

type AddUserForm = z.infer<typeof addUserSchema>;
type EditUserForm = z.infer<typeof editUserSchema>;

const UserManagement = () => {
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<CommunityUser | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<CommunityUser | null>(null);
  
  const { toast } = useToast();
  
  const ranks: UserRank[] = ['aluno', 'soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante', 'admin'];
  
  const form = useForm<AddUserForm>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: '',
      email: '',
      cpf: '',
      phone: '',
      city: '',
      address: '',
      birthDate: '',
      rank: '',
      company: '',
    },
  });

  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      cpf: '',
      phone: '',
      city: '',
      address: '',
      birthDate: '',
      rank: '',
      company: '',
    },
  });

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await apiGet('/api/companies');
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiGet('/api/profiles');
      const mappedUsers = (data.profiles || []).map((profile: any) => ({
        id: profile.user_id || profile.id,
        name: profile.name || 'Nome não informado',
        email: profile.email || 'Email não informado',
        rank: profile.rank || 'aluno',
        company: profile.company || 'Sem companhia',
        joinDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : 'N/A',
        lastActive: 'Hoje',
        status: 'active' as const,
        cpglRegister: profile.cpf || '',
        city: profile.city || '',
        cpglYear: profile.birth_date ? new Date(profile.birth_date).getFullYear() : undefined,
        cpglMonth: profile.birth_date ? new Date(profile.birth_date).getMonth() + 1 : undefined,
        phone: profile.phone || '',
        address: profile.address || '',
        birthDate: profile.birth_date || '',
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

  const handleAddUser = async (data: AddUserForm) => {
    try {
      const userData = {
        email: data.email,
        password: 'Golgota123', // Senha padrão
        force_password_change: true,
        name: data.name,
        cpf: data.cpf.replace(/\D/g, ''), // Remove formatação
        phone: data.phone,
        city: data.city,
        address: data.address,
        birth_date: data.birthDate,
        rank: data.rank,
        company: data.company
      };

      await apiPost('/api/auth/create-user', userData);

      toast({
        title: "Usuário criado com sucesso!",
        description: `${data.name} foi adicionado com senha padrão Golgota123. Será solicitado para alterar a senha no primeiro login.`,
      });

      setIsAddUserOpen(false);
      form.reset();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  const handleOldAddUser = (data: AddUserForm) => {
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
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = rankFilter === 'all' || user.rank === rankFilter;
    const matchesCompany = companyFilter === 'all' || user.company === companyFilter;
    
    return matchesSearch && matchesRank && matchesCompany;
  });

  const promoteUser = async (userId: string, newRank: UserRank) => {
    try {
      await apiPut(`/api/profiles/${userId}`, { rank: newRank });
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, rank: newRank } : user
      ));
      
      toast({
        title: "Usuário promovido",
        description: `Usuário foi promovido para ${newRank}!`
      });
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Erro ao promover usuário",
        description: "Não foi possível alterar a patente do usuário.",
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      // For now, just update locally since we don't have a status field in the database yet
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      toast({
        title: "Status alterado",
        description: `Usuário está agora ${newStatus === 'active' ? 'ativo' : 'inativo'}!`
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do usuário.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !deletePassword) {
      toast({
        title: "Erro",
        description: "Senha do administrador é obrigatória para excluir usuário",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiPost('/api/auth/delete-user', {
        userId: userToDelete.id,
        adminPassword: deletePassword
      });

      toast({
        title: "Usuário excluído",
        description: `${userToDelete.name} foi removido do sistema com sucesso!`
      });

      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      setDeletePassword('');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.response?.data?.message || "Senha incorreta ou erro interno.",
        variant: "destructive"
      });
    }
  };

  const openDeleteDialog = (user: CommunityUser) => {
    setUserToDelete(user);
    setDeletePassword('');
    setIsDeleteDialogOpen(true);
  };

  const openEditDialog = (user: CommunityUser) => {
    setUserToEdit(user);
    // Populate edit form with user data
    editForm.reset({
      name: user.name,
      email: user.email,
      cpf: user.cpglRegister || '',
      phone: user.phone || '',
      city: user.city || '',
      address: user.address || '',
      birthDate: user.birthDate || '',
      rank: user.rank,
      company: user.company,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditUser = async (data: EditUserForm) => {
    if (!userToEdit) return;

    try {
      await apiPut(`/api/profiles/${userToEdit.id}`, {
        name: data.name,
        email: data.email,
        cpf: data.cpf || undefined,
        phone: data.phone || undefined,
        city: data.city || undefined,
        address: data.address || undefined,
        birth_date: data.birthDate || undefined,
        rank: data.rank,
        company: data.company || undefined,
      });

      toast({
        title: "Usuário atualizado",
        description: `${data.name} foi atualizado com sucesso!`
      });

      setIsEditDialogOpen(false);
      setUserToEdit(null);
      editForm.reset();
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error.response?.data?.message || "Não foi possível atualizar o usuário.",
        variant: "destructive"
      });
    }
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
            <DialogContent className="max-w-2xl bg-military-black-light border-military-gold/20">
              <DialogHeader>
                <DialogTitle className="text-military-gold">Adicionar Novo Usuário</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Preencha todos os dados do novo membro da comunidade
                </DialogDescription>
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
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: joao@exemplo.com" {...field} className="bg-military-black border-military-gold/30 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">CPF *</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} className="bg-military-black border-military-gold/30 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Telefone *</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} className="bg-military-black border-military-gold/30 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Data de Nascimento *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-military-black border-military-gold/30 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Cidade *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: São Paulo" {...field} className="bg-military-black border-military-gold/30 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Endereço *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Endereço completo..." {...field} className="bg-military-black border-military-gold/30 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Patente *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                                <SelectValue placeholder="Selecione a patente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-military-black-light border-military-gold/20">
                              {ranks.map(rank => (
                                <SelectItem key={rank} value={rank} className="text-white hover:bg-military-gold/20">
                                  {rank.charAt(0).toUpperCase() + rank.slice(1)}
                                </SelectItem>
                              ))}
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
                          <FormLabel className="text-white">Companhia *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                                <SelectValue placeholder="Selecione a companhia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-military-black-light border-military-gold/20">
                              {companies.length > 0 ? (
                                companies.map(company => (
                                  <SelectItem key={company.id} value={company.name} className="text-white hover:bg-military-gold/20">
                                    {company.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="Sem Companhia" className="text-white hover:bg-military-gold/20">
                                  Sem Companhia
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-military-gold/10 p-4 rounded-lg">
                    <p className="text-military-gold text-sm">
                      <strong>Informações de Login:</strong><br/>
                      • Senha padrão: <code className="bg-military-black px-2 py-1 rounded">Golgota123</code><br/>
                      • O usuário poderá fazer login com CPF ou Email<br/>
                      • Será obrigatório alterar a senha no primeiro login
                    </p>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddUserOpen(false)}
                      className="border-military-gold/30 text-white hover:bg-military-gold/20"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-military-gold text-military-black hover:bg-military-gold/80">
                      Criar Usuário
                    </Button>
                  </DialogFooter>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-military-gold/20">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-military-black-light border-military-gold/20">
                            <DropdownMenuItem 
                              onClick={() => openEditDialog(user)}
                              className="text-white hover:bg-military-gold/20"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => promoteUser(user.id, user.rank === 'admin' ? 'comandante' : 'admin')}
                              className="text-white hover:bg-military-gold/20"
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Promover
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toggleUserStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}
                              className="text-white hover:bg-military-gold/20"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              {user.status === 'active' ? 'Desativar' : 'Ativar'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(user)}
                              className="text-red-400 hover:bg-red-600/20"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete User Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-military-black-light border-military-gold/20">
            <DialogHeader>
              <DialogTitle className="text-red-400 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Esta ação é irreversível. Para confirmar a exclusão do usuário{' '}
                <span className="text-military-gold font-semibold">{userToDelete?.name}</span>,
                digite sua senha de administrador abaixo.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-400 text-sm">
                    <strong>Atenção:</strong> O usuário será permanentemente removido do sistema, incluindo todos os seus dados e histórico.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Senha do Administrador *</label>
                <Input
                  type="password"
                  placeholder="Digite sua senha para confirmar"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="bg-military-black border-military-gold/30 text-white"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setUserToDelete(null);
                  setDeletePassword('');
                }}
                className="border-military-gold/30 text-white hover:bg-military-gold/20"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!deletePassword}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Confirmar Exclusão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl bg-military-black-light border-military-gold/20">
            <DialogHeader>
              <DialogTitle className="text-military-gold">Editar Usuário</DialogTitle>
              <DialogDescription className="text-gray-400">
                Edite os dados do usuário {userToEdit?.name}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
                <FormField
                  control={editForm.control}
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
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
                    control={editForm.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">CPF</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 12345678901" {...field} className="bg-military-black border-military-gold/30 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: (11) 99999-9999" {...field} className="bg-military-black border-military-gold/30 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: São Paulo" {...field} className="bg-military-black border-military-gold/30 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Rua das Flores, 123, Centro" {...field} className="bg-military-black border-military-gold/30 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={editForm.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="bg-military-black border-military-gold/30 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="rank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Patente</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                              <SelectValue placeholder="Selecione a patente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-military-black-light border-military-gold/20">
                            {ranks.map((rank) => (
                              <SelectItem key={rank} value={rank} className="text-white hover:bg-military-gold/20">
                                {rank.charAt(0).toUpperCase() + rank.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Companhia</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                              <SelectValue placeholder="Selecione a companhia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-military-black-light border-military-gold/20">
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.name} className="text-white hover:bg-military-gold/20">
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setUserToEdit(null);
                      editForm.reset();
                    }}
                    className="border-military-gold/30 text-white hover:bg-military-gold/20"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-military-gold text-military-black hover:bg-military-gold/80"
                  >
                    Salvar Alterações
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserManagement;