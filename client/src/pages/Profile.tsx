import { useState, useEffect } from 'react';
import { User, Calendar, Award, Activity, Settings, Shield, Users, BookOpen, Camera, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiPut } from '@/lib/api';

const Profile = () => {
  // Function to safely format dates without timezone issues
  const formatDateSafe = (dateString: string) => {
    if (!dateString) return 'Não informado';
    
    // If it's already in format DD/MM/YYYY, return as is
    if (dateString.includes('/')) return dateString;
    
    // If it's in ISO format (YYYY-MM-DD), parse it as local date
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  };
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    birth_date: '',
    cpf: '',
    city: '',
    address: '',
    bio: '',
    specialties: [] as string[]
  });

  useEffect(() => {
    if (user && profile) {
      fetchActivities();
      fetchAchievements();
      // Initialize edit form with current profile data
      setEditForm({
        name: profile.name || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
        cpf: profile.cpf || '',
        city: profile.city || '',
        address: profile.address || '',
        bio: profile.bio || '',
        specialties: profile.specialties || []
      });
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const updatedProfile = await apiPut('/api/profile', editForm);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso!",
      });
      
      setIsEditing(false);
      // Refresh profile data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao salvar perfil",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    setEditForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      birth_date: profile?.birth_date || '',
      cpf: profile?.cpf || '',
      city: profile?.city || '',
      address: profile?.address || '',
      bio: profile?.bio || '',
      specialties: profile?.specialties || []
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-military-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-military-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-military-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Perfil não encontrado</h2>
          <Button onClick={() => navigate('/comunidade')} className="bg-military-gold text-black">
            Voltar à Comunidade
          </Button>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'training': return <Activity className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'achievement': return <Award className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-blue-600';
      case 'course': return 'bg-green-600';
      case 'achievement': return 'bg-secondary';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="min-h-screen bg-military-black">
      {/* Header com botão voltar */}
      <div className="bg-military-black-light border-b border-military-gold/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white hover:bg-military-gold/20"
            >
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold text-white">Perfil do Membro</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8 bg-military-black-light border-military-gold/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-military-gold/20 flex items-center justify-center overflow-hidden border-4 border-military-gold/30">
                  <img 
                    src={profile.avatar_url || '/placeholder.svg'} 
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button 
                  size="sm" 
                  className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0 bg-military-gold hover:bg-military-gold-dark text-black"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Info Principal */}
              <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
                   <div>
                     <h2 className="text-3xl font-bold text-white mb-2">{profile.name}</h2>
                     <div className="flex items-center gap-4 mb-3">
                       <Badge className="bg-military-gold text-black flex items-center gap-2">
                         <Shield className="h-4 w-4" />
                         {profile.rank || 'Soldado'}
                       </Badge>
                       <Badge className="bg-military-olive text-white flex items-center gap-2">
                         <Users className="h-4 w-4" />
                         CIA {profile.company || 'Não informada'}
                       </Badge>
                     </div>
                     <p className="text-gray-300 mb-4 max-w-2xl">{profile.bio || 'Membro do Comando Gólgota'}</p>
                   </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 bg-military-gold text-black hover:bg-military-gold-dark"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? 'Salvando...' : 'Salvar'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="flex items-center gap-2 border-gray-600 text-gray-400 hover:bg-gray-600/20"
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 border-military-gold text-military-gold hover:bg-military-gold hover:text-black"
                    >
                      <Edit className="h-4 w-4" />
                      Editar Perfil
                    </Button>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-military-black border border-military-gold/20 rounded-lg">
                    <div className="text-2xl font-bold text-military-gold">{activities.filter(a => a.type === 'training').length}</div>
                    <div className="text-sm text-gray-400">Treinamentos</div>
                  </div>
                  <div className="text-center p-3 bg-military-black border border-military-gold/20 rounded-lg">
                    <div className="text-2xl font-bold text-military-gold">{activities.filter(a => a.type === 'course').length}</div>
                    <div className="text-sm text-gray-400">Cursos</div>
                  </div>
                  <div className="text-center p-3 bg-military-black border border-military-gold/20 rounded-lg">
                    <div className="text-2xl font-bold text-military-gold">{activities.reduce((sum, a) => sum + (a.points || 0), 0)}</div>
                    <div className="text-sm text-gray-400">Pontos</div>
                  </div>
                  <div className="text-center p-3 bg-military-black border border-military-gold/20 rounded-lg">
                    <div className="text-2xl font-bold text-military-gold">#-</div>
                    <div className="text-sm text-gray-400">Ranking</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-military-black-light border border-military-gold/20">
            <TabsTrigger value="info" className="data-[state=active]:bg-military-gold data-[state=active]:text-black text-gray-300">Informações</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-military-gold data-[state=active]:text-black text-gray-300">Atividades</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-military-gold data-[state=active]:text-black text-gray-300">Conquistas</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-military-gold data-[state=active]:text-black text-gray-300">Configurações</TabsTrigger>
          </TabsList>

          {/* Tab Informações */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-military-black-light border-military-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="h-5 w-5 text-military-gold" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-gray-400">Nome Completo</Label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="mt-1 bg-military-black border-military-gold/30 text-white"
                          placeholder="Digite seu nome completo"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-400">Email</Label>
                        <p className="text-gray-400 text-sm mt-1">O email não pode ser alterado</p>
                        <p className="text-white">{profile.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-400">Telefone</Label>
                        <Input
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="mt-1 bg-military-black border-military-gold/30 text-white"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-400">Data de Nascimento</Label>
                        <Input
                          type="date"
                          value={editForm.birth_date ? editForm.birth_date.split('T')[0] : ''}
                          onChange={(e) => setEditForm({...editForm, birth_date: e.target.value})}
                          className="mt-1 bg-military-black border-military-gold/30 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-400">CPF</Label>
                        <Input
                          value={editForm.cpf}
                          onChange={(e) => setEditForm({...editForm, cpf: e.target.value})}
                          className="mt-1 bg-military-black border-military-gold/30 text-white"
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-400">Cidade</Label>
                        <Input
                          value={editForm.city}
                          onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                          className="mt-1 bg-military-black border-military-gold/30 text-white"
                          placeholder="Sua cidade"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-400">Endereço</Label>
                        <Input
                          value={editForm.address}
                          onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                          className="mt-1 bg-military-black border-military-gold/30 text-white"
                          placeholder="Rua, número, bairro"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-400">Bio</Label>
                        <Textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          className="mt-1 bg-military-black border-military-gold/30 text-white resize-none"
                          placeholder="Conte um pouco sobre você..."
                          rows={3}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Nome Completo</label>
                        <p className="text-white">{profile.name || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Email</label>
                        <p className="text-white">{profile.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Telefone</label>
                        <p className="text-white">{profile.phone || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Data de Nascimento</label>
                        <p className="text-white">{profile.birth_date ? formatDateSafe(profile.birth_date) : 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">CPF</label>
                        <p className="text-white">{profile.cpf || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Cidade</label>
                        <p className="text-white">{profile.city || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Endereço</label>
                        <p className="text-white">{profile.address || 'Não informado'}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-military-black-light border-military-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="h-5 w-5 text-military-gold" />
                    Dados Militares
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Patente</label>
                    <p className="text-white">{profile.rank || 'Soldado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Companhia</label>
                    <p className="text-white">CIA {profile.company || 'Não informada'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Data de Ingresso</label>
                    <p className="text-white">{profile.joined_at ? new Date(profile.joined_at).toLocaleDateString('pt-BR') : 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Especialidades</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.specialties && profile.specialties.length > 0 ? 
                        profile.specialties.map((specialty: string) => (
                          <Badge key={specialty} className="bg-military-gold text-black">{specialty}</Badge>
                        )) : 
                        <span className="text-gray-400">Nenhuma especialidade cadastrada</span>
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Atividades */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5 text-military-gold" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.length > 0 ? activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 border border-military-gold/20 rounded-lg bg-military-black/50">
                      <div className={`w-10 h-10 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center text-white`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{activity.title}</h4>
                        <p className="text-sm text-gray-300 mb-2">{activity.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(activity.activity_date).toLocaleDateString('pt-BR')}
                          </span>
                          {activity.points && (
                            <Badge className="bg-military-gold text-black text-xs">
                              +{activity.points} pts
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-400 text-center py-8">Nenhuma atividade registrada ainda.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Conquistas */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Award className="h-5 w-5 text-military-gold" />
                  Conquistas e Certificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.length > 0 ? achievements.map((achievement, index) => (
                    <div key={index} className="p-4 border border-military-gold/20 rounded-lg text-center bg-military-black/50">
                      <div className="w-16 h-16 bg-military-gold rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="h-8 w-8 text-black" />
                      </div>
                      <h4 className="font-medium text-white mb-2">{achievement.name}</h4>
                      <p className="text-sm text-gray-400">
                        {new Date(achievement.achieved_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-400">Nenhuma conquista registrada ainda.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="h-5 w-5 text-military-gold" />
                  Configurações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-military-gold/20 rounded-lg bg-military-black/50">
                  <div>
                    <h4 className="font-medium text-white">Notificações por Email</h4>
                    <p className="text-sm text-gray-400">Receber emails sobre atividades e eventos</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-military-gold text-military-gold hover:bg-military-gold hover:text-black">Configurar</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-military-gold/20 rounded-lg bg-military-black/50">
                  <div>
                    <h4 className="font-medium text-white">Privacidade do Perfil</h4>
                    <p className="text-sm text-gray-400">Controlar quem pode ver seu perfil</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-military-gold text-military-gold hover:bg-military-gold hover:text-black">Editar</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-military-gold/20 rounded-lg bg-military-black/50">
                  <div>
                    <h4 className="font-medium text-white">Alterar Senha</h4>
                    <p className="text-sm text-gray-400">Atualizar sua senha de acesso</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-military-gold text-military-gold hover:bg-military-gold hover:text-black">Alterar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;