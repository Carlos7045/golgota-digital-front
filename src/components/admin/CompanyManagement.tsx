import { useState } from 'react';
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

  // Mock data para demonstração
  const companies = [
    {
      id: '1',
      name: 'Alpha',
      commander: 'Ten. Carlos Silva',
      members: 62,
      status: 'Ativa',
      description: 'Companhia de elite focada em operações especiais e treinamento avançado.',
      founded: '2020-03-15',
      color: '#FFD700'
    },
    {
      id: '2',
      name: 'Bravo',
      commander: 'Cap. Maria Santos',
      members: 58,
      status: 'Ativa',
      description: 'Companhia especializada em logística e suporte operacional.',
      founded: '2019-08-22',
      color: '#32CD32'
    },
    {
      id: '3',
      name: 'Charlie',
      commander: 'Ten. Pedro Costa',
      members: 45,
      status: 'Ativa',
      description: 'Companhia de reconhecimento e inteligência.',
      founded: '2021-01-10',
      color: '#FF6347'
    },
    {
      id: '4',
      name: 'Delta',
      commander: 'Sgt. Ana Oliveira',
      members: 38,
      status: 'Reorganização',
      description: 'Companhia de comunicações e tecnologia.',
      founded: '2021-11-05',
      color: '#4169E1'
    },
    {
      id: '5',
      name: 'Echo',
      commander: 'A designar',
      members: 0,
      status: 'Planejamento',
      description: 'Nova companhia em formação para operações médicas.',
      founded: null,
      color: '#9370DB'
    }
  ];

  const companyMembers = [
    { id: '1', name: 'João Silva', rank: 'Soldado', role: 'Membro', company: 'Alpha', joinDate: '2023-05-15' },
    { id: '2', name: 'Maria Santos', rank: 'Cabo', role: 'Sub-comandante', company: 'Alpha', joinDate: '2022-08-10' },
    { id: '3', name: 'Pedro Costa', rank: 'Sargento', role: 'Instrutor', company: 'Alpha', joinDate: '2021-12-03' },
    { id: '4', name: 'Ana Oliveira', rank: 'Soldado', role: 'Membro', company: 'Alpha', joinDate: '2024-01-20' },
    { id: '5', name: 'Carlos Lima', rank: 'Cabo', role: 'Membro', company: 'Alpha', joinDate: '2023-09-12' },
  ];

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
                {companies.reduce((sum, company) => sum + company.members, 0)}
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
              <div className="text-2xl font-bold text-white">Alpha</div>
              <p className="text-xs text-gray-400">
                62 membros ativos
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
                {Math.round(companies.reduce((sum, company) => sum + company.members, 0) / companies.filter(c => c.status === 'Ativa').length)}
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
                  <Dialog>
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
                          <Input className="bg-military-black border-military-gold/30 text-white" placeholder="Ex: Foxtrot" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Comandante</Label>
                          <Select>
                            <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                              <SelectValue placeholder="Selecione o comandante" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user1">Ten. João Silva</SelectItem>
                              <SelectItem value="user2">Cap. Maria Santos</SelectItem>
                              <SelectItem value="user3">Sgt. Pedro Costa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Descrição</Label>
                          <Textarea className="bg-military-black border-military-gold/30 text-white" placeholder="Descreva o propósito da companhia..." />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Cor Identificadora</Label>
                          <Input type="color" className="bg-military-black border-military-gold/30 h-10" defaultValue="#FFD700" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button className="bg-military-gold hover:bg-military-gold-dark text-black">
                          Criar Companhia
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
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
                            <p className="text-sm text-gray-400">{company.commander}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-white font-bold">{company.members}</p>
                            <p className="text-xs text-gray-400">membros</p>
                          </div>
                          {getStatusBadge(company.status)}
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" className="text-military-gold hover:bg-military-gold/20">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-600/20">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-300">{company.description}</p>
                      {company.founded && (
                        <p className="mt-1 text-xs text-gray-400">Fundada em: {company.founded}</p>
                      )}
                    </div>
                  ))}
                </div>
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
                        {companyMembers.map((member) => (
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
                        ))}
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
                        <Button size="sm" variant="outline" className="w-full border-red-600/30 text-red-400 hover:bg-red-600/20">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover Companhia
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Estatísticas</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Soldados:</span>
                          <span className="text-white">35</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cabos:</span>
                          <span className="text-white">15</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sargentos:</span>
                          <span className="text-white">8</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Oficiais:</span>
                          <span className="text-white">4</span>
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