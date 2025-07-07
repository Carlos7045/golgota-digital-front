import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const [commanders, setCommanders] = useState<any[]>([]);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    commander_id: '',
    description: '',
    color: '#FFD700'
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
    fetchCommanders();
  }, []);

  const fetchCommanders = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, rank')
        .in('rank', ['capitao', 'major', 'coronel', 'comandante', 'admin']);

      if (error) throw error;
      setCommanders(data || []);
    } catch (error) {
      console.error('Error fetching commanders:', error);
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

    try {
      const { error } = await supabase
        .from('companies')
        .insert({
          name: formData.name,
          commander_id: formData.commander_id || null,
          description: formData.description || null,
          color: formData.color,
          status: 'Planejamento'
        });

      if (error) throw error;

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

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Tem certeza que deseja remover esta companhia?')) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

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
      commander_id: '',
      description: '',
      color: '#FFD700'
    });
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          commander:commander_id(name, rank)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
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
                    <DialogContent className="bg-military-black-light border-military-gold/20">
                      <DialogHeader>
                        <DialogTitle className="text-military-gold">Criar Nova Companhia</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Preencha as informações da nova companhia
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-white">Nome da Companhia</Label>
                          <Input 
                            className="bg-military-black border-military-gold/30 text-white" 
                            placeholder="Ex: Foxtrot"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Comandante</Label>
                          <Select value={formData.commander_id} onValueChange={(value) => setFormData({...formData, commander_id: value})}>
                            <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                              <SelectValue placeholder="Selecione o comandante" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Sem comandante</SelectItem>
                              {commanders.map((commander) => (
                                <SelectItem key={commander.user_id} value={commander.user_id}>
                                  {commander.name} ({commander.rank})
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
                        <Button size="sm" className="w-full bg-military-gold hover:bg-military-gold-dark text-black">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar Membro
                        </Button>
                        <Button size="sm" variant="outline" className="w-full border-military-gold/30 text-white hover:bg-military-gold/20">
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
      </div>
    </div>
  );
};

export default CompanyManagement;