import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserPlus, MoreHorizontal, Shield, UserCheck } from 'lucide-react';
import { UserRank } from '@/pages/Community';
import { useToast } from '@/hooks/use-toast';

interface CommunityUser {
  id: string;
  name: string;
  email: string;
  rank: UserRank;
  company: string;
  joinDate: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

const mockUsers: CommunityUser[] = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', rank: 'soldado', company: 'A', joinDate: '2024-01-15', lastActive: '2024-12-20', status: 'active' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', rank: 'cabo', company: 'B', joinDate: '2024-02-20', lastActive: '2024-12-19', status: 'active' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@email.com', rank: 'sargento', company: 'A', joinDate: '2024-03-10', lastActive: '2024-12-18', status: 'active' },
  { id: '4', name: 'Ana Oliveira', email: 'ana@email.com', rank: 'tenente', company: 'C', joinDate: '2024-04-05', lastActive: '2024-12-15', status: 'inactive' },
];

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
  const [users, setUsers] = useState<CommunityUser[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const { toast } = useToast();

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
          <Button className="bg-military-gold text-black hover:bg-military-gold/80">
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Usuário
          </Button>
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