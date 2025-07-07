import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building, 
  Users, 
  UserPlus, 
  Plus,
  Edit,
  Trash2,
  Shield,
  Star,
  Search,
  Filter
} from 'lucide-react';

const CompanyManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyMembers, setCompanyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [commanders, setCommanders] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    commander_id: 'none',
    sub_commander_id: 'none',
    description: '',
    city: '',
    state: '',
    color: '#FFD700',
    members: [] as any[]
  });

  const [newMemberData, setNewMemberData] = useState({
    user_id: ''
  });
  
  const { toast } = useToast();

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
  ];



  useEffect(() => {
    fetchCompanies();
    fetchCommanders();
    fetchAllUsers();
  }, []);

  // Fetch company members when a company is selected
  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyMembers(selectedCompany);
    } else {
      setCompanyMembers([]);
    }
  }, [selectedCompany]);

  const fetchCommanders = async () => {
    try {
      const response = await apiGet('/api/commanders');
      setCommanders(response.commanders || []);
    } catch (error) {
      console.error('Error fetching commanders:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar comandantes",
        variant: "destructive"
      });
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await apiGet('/api/users');
      setAllUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateCompany = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da companhia é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.city.trim() || !formData.state) {
      toast({
        title: "Erro",
        description: "Cidade e estado são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        commander_id: formData.commander_id === 'none' ? null : formData.commander_id,
        sub_commander_id: formData.sub_commander_id === 'none' ? null : formData.sub_commander_id,
        status: 'Planejamento'
      };

      await apiPost('/api/companies', dataToSend);

      toast({
        title: "Sucesso",
        description: "Companhia criada com sucesso!"
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar companhia",
        variant: "destructive"
      });
    }
  };

  const handleEditCompany = async () => {
    if (!editingCompany) return;

    try {
      await apiPut(`/api/companies/${editingCompany.id}`, formData);

      toast({
        title: "Sucesso",
        description: "Companhia atualizada com sucesso!"
      });

      setIsEditDialogOpen(false);
      setEditingCompany(null);
      resetForm();
      fetchCompanies();
    } catch (error: any) {
      console.error('Error updating company:', error);
      const errorMessage = error.response?.data?.message || error.message || "Erro ao atualizar companhia";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleAddMember = async () => {
    if (!selectedCompany || !newMemberData.user_id) {
      toast({
        title: "Erro",
        description: "Selecione um usuário",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedUser = allUsers.find(u => u.user_id === newMemberData.user_id);
      const memberData = {
        user_id: newMemberData.user_id,
        role: selectedUser?.rank || 'Membro' // Usa a patente como função
      };

      await apiPost(`/api/companies/${selectedCompany}/members`, memberData);

      toast({
        title: "Sucesso",
        description: "Membro adicionado com sucesso!"
      });

      setIsAddMemberDialogOpen(false);
      setNewMemberData({ user_id: '' });
      fetchCompanyMembers(selectedCompany);
    } catch (error: any) {
      console.error('Error adding member:', error);
      const errorMessage = error.response?.data?.message || error.message || "Erro ao adicionar membro";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedCompany) return;

    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      await apiDelete(`/api/companies/${selectedCompany}/members/${userId}`);

      toast({
        title: "Sucesso",
        description: "Membro removido com sucesso!"
      });

      fetchCompanyMembers(selectedCompany);
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover membro",
        variant: "destructive"
      });
    }
  };

  const handleUpdateMemberRole = async (userId: string, newRole: string) => {
    if (!selectedCompany) return;

    try {
      await apiPut(`/api/companies/${selectedCompany}/members/${userId}`, { role: newRole });

      toast({
        title: "Sucesso",
        description: "Função atualizada com sucesso!"
      });

      fetchCompanyMembers(selectedCompany);
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar função",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Tem certeza que deseja remover esta companhia?')) return;

    try {
      await apiDelete(`/api/companies/${companyId}`);

      toast({
        title: "Sucesso",
        description: "Companhia removida com sucesso!"
      });

      if (selectedCompany === companyId) {
        setSelectedCompany(null);
      }
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover companhia",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      commander_id: 'none',
      sub_commander_id: 'none',
      description: '',
      city: '',
      state: '',
      color: '#FFD700',
      members: []
    });
  };

  const fetchCompanyMembers = async (companyId: string) => {
    try {
      const response = await apiGet(`/api/companies/${companyId}/members`);
      setCompanyMembers(response.members || []);
    } catch (error) {
      console.error('Error fetching company members:', error);
    }
  };

  const openEditDialog = (company: any) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      commander_id: company.commander_id || 'none',
      sub_commander_id: company.sub_commander_id || 'none',
      description: company.description || '',
      city: company.city || '',
      state: company.state || '',
      color: company.color || '#FFD700',
      members: []
    });
    setIsEditDialogOpen(true);
  };

  const addMemberToForm = () => {
    if (!newMemberData.user_id) return;
    
    const user = allUsers.find(u => u.user_id === newMemberData.user_id);
    if (!user) return;

    const newMember = {
      user_id: newMemberData.user_id,
      name: user.name,
      role: user.rank // Usa a patente como função
    };

    setFormData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));

    setNewMemberData({ user_id: '' });
  };

  const removeMemberFromForm = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.user_id !== userId)
    }));
  };

  const fetchCompanies = async () => {
    try {
      const data = await apiGet('/api/companies');
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Erro ao carregar companhias",
        description: "Não foi possível carregar as companhias.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativa':
        return <Badge className="bg-green-600/20 text-green-400">Ativa</Badge>;
      case 'Reorganização':
        return <Badge className="bg-yellow-600/20 text-yellow-400">Reorganização</Badge>;
      case 'Planejamento':
        return <Badge className="bg-blue-600/20 text-blue-400">Planejamento</Badge>;
      case 'Inativa':
        return <Badge className="bg-red-600/20 text-red-400">Inativa</Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-400">{status}</Badge>;
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Soldado':
        return <Shield className="h-4 w-4" />;
      case 'Cabo':
        return <Star className="h-4 w-4" />;
      case 'Sargento':
        return <UserPlus className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Companies Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total de Companhias
              </CardTitle>
              <Building className="h-4 w-4 text-military-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{companies.length}</div>
              <p className="text-xs text-gray-400">
                {companies.filter(c => c.status === 'Ativa').length} ativas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total de Membros
              </CardTitle>
              <Users className="h-4 w-4 text-military-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {companies.reduce((sum, company) => sum + (company.members || 0), 0)}
              </div>
              <p className="text-xs text-green-400">
                Distribuídos em {companies.filter(c => c.status === 'Ativa').length} companhias
              </p>
            </CardContent>
          </Card>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Maior Companhia
              </CardTitle>
              <Star className="h-4 w-4 text-military-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {companies.length > 0 ? companies.reduce((a, b) => a.name.length > b.name.length ? a : b).name : 'N/A'}
              </div>
              <p className="text-xs text-gray-400">
                {companies.length > 0 ? '0 membros ativos' : 'Nenhuma companhia'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Média por CIA
              </CardTitle>
              <UserPlus className="h-4 w-4 text-military-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {companies.length > 0 && companies.filter(c => c.status === 'Ativa').length > 0 
                  ? Math.round(companies.reduce((sum, company) => sum + (company.members || 0), 0) / companies.filter(c => c.status === 'Ativa').length)
                  : 0}
              </div>
              <p className="text-xs text-gray-400">
                membros por companhia
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Companies Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Companies List */}
          <div className="lg:col-span-2">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-military-gold">Companhias</CardTitle>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-military-gold hover:bg-military-gold-dark text-black">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Companhia
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl bg-military-black-light border-military-gold/20">
                      <DialogHeader>
                        <DialogTitle className="text-military-gold">Criar Nova Companhia</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Preencha as informações da nova companhia e adicione membros
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Basic Info */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-white">Nome da Companhia *</Label>
                            <Input 
                              className="bg-military-black border-military-gold/30 text-white" 
                              placeholder="Ex: CIA Alpha"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-white">Cidade *</Label>
                              <Input 
                                className="bg-military-black border-military-gold/30 text-white" 
                                placeholder="Ex: São Paulo"
                                value={formData.city}
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white">Estado *</Label>
                              <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
                                <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent className="bg-military-black-light border-military-gold/20">
                                  {brazilianStates.map(state => (
                                    <SelectItem key={state} value={state} className="text-white hover:bg-military-gold/20">
                                      {state}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white">Comandante</Label>
                            <Select value={formData.commander_id} onValueChange={(value) => setFormData({...formData, commander_id: value})}>
                              <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                                <SelectValue placeholder="Selecione o comandante" />
                              </SelectTrigger>
                              <SelectContent className="bg-military-black-light border-military-gold/20">
                                <SelectItem value="none" className="text-white hover:bg-military-gold/20">Sem comandante</SelectItem>
                                {commanders.map((commander) => (
                                  <SelectItem key={commander.user_id} value={commander.user_id} className="text-white hover:bg-military-gold/20">
                                    {commander.name} - {commander.rank}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white">Subcomandante</Label>
                            <Select value={formData.sub_commander_id} onValueChange={(value) => setFormData({...formData, sub_commander_id: value})}>
                              <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                                <SelectValue placeholder="Selecione o subcomandante" />
                              </SelectTrigger>
                              <SelectContent className="bg-military-black-light border-military-gold/20">
                                <SelectItem value="none" className="text-white hover:bg-military-gold/20">Sem subcomandante</SelectItem>
                                {commanders
                                  .filter(c => c.user_id !== formData.commander_id)
                                  .map(commander => (
                                    <SelectItem key={commander.user_id} value={commander.user_id} className="text-white hover:bg-military-gold/20">
                                      {commander.name} - {commander.rank}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white">Descrição</Label>
                            <Textarea 
                              className="bg-military-black border-military-gold/30 text-white" 
                              placeholder="Descreva o propósito da companhia..."
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white">Cor Identificadora</Label>
                            <Input 
                              type="color" 
                              className="bg-military-black border-military-gold/30 h-10"
                              value={formData.color}
                              onChange={(e) => setFormData({...formData, color: e.target.value})}
                            />
                          </div>
                        </div>

                        {/* Right Column - Members */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-white font-medium">Adicionar Membros</Label>
                            <div className="flex gap-2">
                              <Select value={newMemberData.user_id} onValueChange={(value) => setNewMemberData({...newMemberData, user_id: value})}>
                                <SelectTrigger className="bg-military-black border-military-gold/30 text-white flex-1">
                                  <SelectValue placeholder="Selecione um membro" />
                                </SelectTrigger>
                                <SelectContent className="bg-military-black-light border-military-gold/20">
                                  {allUsers
                                    .filter(user => 
                                      user.user_id !== formData.commander_id && 
                                      user.user_id !== formData.sub_commander_id &&
                                      !formData.members.some(m => m.user_id === user.user_id)
                                    )
                                    .map(user => (
                                      <SelectItem key={user.user_id} value={user.user_id} className="text-white hover:bg-military-gold/20">
                                        {user.name} - {user.rank}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <Button 
                                type="button"
                                onClick={addMemberToForm}
                                className="bg-military-gold hover:bg-military-gold-dark text-black"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">
                              * A função do membro será automaticamente sua patente militar
                            </p>
                          </div>

                          {/* Members List */}
                          <div className="border border-military-gold/20 rounded-lg p-3 max-h-80 overflow-y-auto">
                            <Label className="text-white text-sm">Membros Adicionados ({formData.members.length})</Label>
                            {formData.members.length === 0 ? (
                              <p className="text-gray-400 text-sm mt-2">Nenhum membro adicionado ainda</p>
                            ) : (
                              <div className="space-y-2 mt-2">
                                {formData.members.map((member, index) => (
                                  <div key={index} className="flex items-center justify-between bg-military-black/50 p-2 rounded">
                                    <div>
                                      <span className="text-white text-sm">{member.name}</span>
                                      <span className="text-gray-400 text-xs ml-2">({member.role})</span>
                                    </div>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeMemberFromForm(member.user_id)}
                                      className="text-red-400 hover:bg-red-600/20"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                          className="border-military-gold/30 text-white hover:bg-military-gold/20"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          className="bg-military-gold hover:bg-military-gold-dark text-black"
                          onClick={handleCreateCompany}
                        >
                          Criar Companhia
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center text-gray-400 py-8">
                    Carregando companhias...
                  </div>
                ) : companies.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <Building className="mx-auto mb-4" size={48} />
                    <p>Nenhuma companhia cadastrada.</p>
                    <p className="text-sm">Crie a primeira companhia!</p>
                  </div>
                ) : (
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedCompany === company.id
                          ? 'border-military-gold bg-military-gold/10'
                          : 'border-military-gold/20 hover:border-military-gold/40'
                      }`}
                      onClick={() => setSelectedCompany(company.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white"
                            style={{ backgroundColor: company.color }}
                          />
                          <div>
                            <h3 className="font-bold text-white text-lg">CIA {company.name}</h3>
                            <p className="text-sm text-gray-400">
                              {company.commander ? `Comandante: ${company.commander.name}` : 'Sem comandante'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-white font-bold">0</p>
                            <p className="text-xs text-gray-400">membros</p>
                          </div>
                          {getStatusBadge(company.status)}
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" className="text-military-gold hover:bg-military-gold/20">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-400 hover:bg-red-600/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCompany(company.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-300">{company.description || 'Sem descrição'}</p>
                      {company.founded_date && (
                        <p className="mt-1 text-xs text-gray-400">Fundada em: {new Date(company.founded_date).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Company Details */}
          <div>
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-military-gold">
                  {selectedCompany ? `CIA ${companies.find(c => c.id === selectedCompany)?.name}` : 'Selecione uma Companhia'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCompany ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Membros da Companhia</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {companyMembers.length === 0 ? (
                          <div className="text-center text-gray-400 py-4">
                            <Users className="mx-auto mb-2" size={32} />
                            <p>Nenhum membro cadastrado</p>
                          </div>
                        ) : (
                          companyMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2 bg-military-black rounded">
                              <div className="flex items-center space-x-2">
                                {getRankIcon(member.rank)}
                                <div>
                                  <p className="text-white text-sm font-medium">{member.name}</p>
                                  <p className="text-gray-400 text-xs">{member.rank} - {member.role}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" className="text-military-gold hover:bg-military-gold/20">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Ações Rápidas</h4>
                      <div className="space-y-2">
                        <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="w-full bg-military-gold hover:bg-military-gold-dark text-black">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Adicionar Membro
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-military-black-light border-military-gold/20">
                            <DialogHeader>
                              <DialogTitle className="text-military-gold">Adicionar Membro</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-white">Selecionar Membro</Label>
                                <Select value={newMemberData.user_id} onValueChange={(value) => setNewMemberData({...newMemberData, user_id: value})}>
                                  <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                                    <SelectValue placeholder="Selecione um usuário" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-military-black-light border-military-gold/20">
                                    {allUsers
                                      .filter(user => !companyMembers.some(m => m.user_id === user.user_id))
                                      .map(user => (
                                        <SelectItem key={user.user_id} value={user.user_id} className="text-white hover:bg-military-gold/20">
                                          {user.name} - {user.rank}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-gray-400 text-sm">
                                  * A função do membro será automaticamente sua patente militar
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)} className="border-military-gold/30 text-white hover:bg-military-gold/20">
                                Cancelar
                              </Button>
                              <Button onClick={handleAddMember} className="bg-military-gold hover:bg-military-gold-dark text-black">
                                Adicionar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full border-military-gold/30 text-white hover:bg-military-gold/20"
                          onClick={() => {
                            const company = companies.find(c => c.id === selectedCompany);
                            if (company) openEditDialog(company);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Companhia
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full border-red-600/30 text-red-400 hover:bg-red-600/20"
                          onClick={() => selectedCompany && handleDeleteCompany(selectedCompany)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover Companhia
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Estatísticas</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total de Membros:</span>
                          <span className="text-white">0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className="text-white">{companies.find(c => c.id === selectedCompany)?.status || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center">
                    Clique em uma companhia para ver os detalhes
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Company Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl bg-military-black-light border-military-gold/20">
            <DialogHeader>
              <DialogTitle className="text-military-gold">Editar Companhia</DialogTitle>
              <DialogDescription className="text-gray-400">
                Edite as informações da companhia {editingCompany?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Nome da Companhia</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Alfa, Bravo, Charlie..."
                    className="bg-military-black border-military-gold/30 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Comandante</Label>
                    <Select value={formData.commander_id} onValueChange={(value) => setFormData({...formData, commander_id: value})}>
                      <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                        <SelectValue placeholder="Selecionar comandante" />
                      </SelectTrigger>
                      <SelectContent className="bg-military-black-light border-military-gold/20">
                        <SelectItem value="none" className="text-white hover:bg-military-gold/20">Nenhum</SelectItem>
                        {commanders.map((commander) => (
                          <SelectItem key={commander.id} value={commander.id} className="text-white hover:bg-military-gold/20">
                            {commander.name} - {commander.rank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Sub-Comandante</Label>
                    <Select value={formData.sub_commander_id} onValueChange={(value) => setFormData({...formData, sub_commander_id: value})}>
                      <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                        <SelectValue placeholder="Selecionar sub-comandante" />
                      </SelectTrigger>
                      <SelectContent className="bg-military-black-light border-military-gold/20">
                        <SelectItem value="none" className="text-white hover:bg-military-gold/20">Nenhum</SelectItem>
                        {commanders.filter(c => c.id !== formData.commander_id).map((commander) => (
                          <SelectItem key={commander.id} value={commander.id} className="text-white hover:bg-military-gold/20">
                            {commander.name} - {commander.rank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Descrição</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descrição da companhia..."
                    className="w-full min-h-[80px] bg-military-black border border-military-gold/30 text-white p-2 rounded resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Cidade</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Ex: São Paulo"
                      className="bg-military-black border-military-gold/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Estado</Label>
                    <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
                      <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                        <SelectValue placeholder="Selecionar estado" />
                      </SelectTrigger>
                      <SelectContent className="bg-military-black-light border-military-gold/20">
                        {brazilianStates.map((state) => (
                          <SelectItem key={state} value={state} className="text-white hover:bg-military-gold/20">
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Cor da Companhia</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-12 h-10 bg-military-black border border-military-gold/30 rounded"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      placeholder="#FFD700"
                      className="bg-military-black border-military-gold/30 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Members */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Membros Atuais</Label>
                  <div className="border border-military-gold/20 rounded-lg p-3 max-h-80 overflow-y-auto">
                    {companyMembers.length === 0 ? (
                      <p className="text-gray-400 text-sm">Nenhum membro na companhia</p>
                    ) : (
                      <div className="space-y-2">
                        {companyMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between bg-military-black/50 p-2 rounded">
                            <div>
                              <span className="text-white text-sm">{member.name}</span>
                              <span className="text-gray-400 text-xs ml-2">({member.role})</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveMember(member.user_id)}
                              className="text-red-400 hover:bg-red-600/20"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingCompany(null);
                  resetForm();
                }}
                className="border-military-gold/30 text-white hover:bg-military-gold/20"
              >
                Cancelar
              </Button>
              <Button 
                className="bg-military-gold hover:bg-military-gold-dark text-black"
                onClick={handleEditCompany}
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CompanyManagement;