import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Megaphone, 
  Calendar, 
  Trophy, 
  Users, 
  TrendingUp, 
  Clock,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  Plus,
  Send
} from 'lucide-react';
import { User } from '@/pages/Community';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost } from '@/lib/api';

interface MainContentProps {
  user: User;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'achievement';
  author_name: string;
  author_rank: string;
  created_at: string;
  is_pinned: boolean;
}

interface RecentActivity {
  id: string;
  type: 'event_registration' | 'achievement' | 'promotion' | 'payment';
  description: string;
  user_name: string;
  created_at: string;
}

const MainContent = ({ user }: MainContentProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'general' as 'general' | 'urgent' | 'event' | 'achievement',
    is_pinned: false
  });
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const isAdmin = user.rank === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar anúncios
      const announcementsResponse = await apiGet('/api/announcements');
      setAnnouncements(announcementsResponse.announcements || []);
      
      // Carregar atividades recentes
      const activitiesResponse = await apiGet('/api/activities/recent');
      setRecentActivities(activitiesResponse.activities || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os anúncios e atividades.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e conteúdo do anúncio.",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreating(true);
      await apiPost('/api/announcements', newAnnouncement);
      
      toast({
        title: "Anúncio criado com sucesso!",
        description: "O anúncio foi publicado e todos os membros poderão visualizá-lo.",
      });

      setNewAnnouncement({
        title: '',
        content: '',
        type: 'general',
        is_pinned: false
      });
      setIsCreateDialogOpen(false);
      await loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao criar anúncio:', error);
      toast({
        title: "Erro ao criar anúncio",
        description: "Não foi possível criar o anúncio. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertCircle className="text-red-500" size={20} />;
      case 'event': return <Calendar className="text-blue-500" size={20} />;
      case 'achievement': return <Trophy className="text-yellow-500" size={20} />;
      default: return <Megaphone className="text-military-gold" size={20} />;
    }
  };

  const getAnnouncementBadge = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-600 text-white';
      case 'event': return 'bg-blue-600 text-white';
      case 'achievement': return 'bg-yellow-600 text-black';
      default: return 'bg-military-gold text-black';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-military-black text-white">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      {/* Boas-vindas */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Bem-vindo, {user.name}!
        </h1>
        <p className="text-gray-400">
          Acompanhe as últimas novidades e atividades do Comando Gólgota
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal - Anúncios */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Megaphone className="mr-2 text-military-gold" size={24} />
              Anúncios Oficiais
            </h2>
            <div className="flex items-center space-x-3">
              <Badge className="bg-military-gold text-black">
                {announcements.length} anúncios
              </Badge>
              {isAdmin && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="bg-military-gold hover:bg-military-gold/90 text-black"
                    >
                      <Plus size={16} className="mr-1" />
                      Novo Anúncio
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-military-black-light border-military-gold/30 text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-military-gold flex items-center">
                        <Megaphone className="mr-2" size={20} />
                        Criar Novo Anúncio Oficial
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título do Anúncio</Label>
                        <Input
                          id="title"
                          value={newAnnouncement.title}
                          onChange={(e) => setNewAnnouncement(prev => ({...prev, title: e.target.value}))}
                          placeholder="Digite o título do anúncio..."
                          className="bg-military-black border-military-gold/30 text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="content">Conteúdo</Label>
                        <Textarea
                          id="content"
                          value={newAnnouncement.content}
                          onChange={(e) => setNewAnnouncement(prev => ({...prev, content: e.target.value}))}
                          placeholder="Digite o conteúdo do anúncio..."
                          rows={4}
                          className="bg-military-black border-military-gold/30 text-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">Tipo do Anúncio</Label>
                          <Select 
                            value={newAnnouncement.type} 
                            onValueChange={(value: any) => setNewAnnouncement(prev => ({...prev, type: value}))}
                          >
                            <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-military-black-light border-military-gold/30">
                              <SelectItem value="general">Geral</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
                              <SelectItem value="event">Evento</SelectItem>
                              <SelectItem value="achievement">Conquista</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="pinned">Prioridade</Label>
                          <Select 
                            value={newAnnouncement.is_pinned ? 'true' : 'false'} 
                            onValueChange={(value) => setNewAnnouncement(prev => ({...prev, is_pinned: value === 'true'}))}
                          >
                            <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-military-black-light border-military-gold/30">
                              <SelectItem value="false">Normal</SelectItem>
                              <SelectItem value="true">Fixado no Topo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4 border-t border-military-gold/20">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="border-military-gold/30 text-white hover:bg-military-gold/10"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreateAnnouncement}
                        disabled={creating}
                        className="bg-military-gold hover:bg-military-gold/90 text-black"
                      >
                        <Send size={16} className="mr-1" />
                        {creating ? 'Publicando...' : 'Publicar Anúncio'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {announcements.length === 0 ? (
              <Card className="bg-military-black-light border-military-gold/20">
                <CardContent className="p-6 text-center">
                  <Megaphone className="mx-auto mb-4 text-gray-500" size={48} />
                  <p className="text-gray-400">Nenhum anúncio no momento.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Os anúncios oficiais da administração aparecerão aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              announcements.map((announcement) => (
                <Card key={announcement.id} className="bg-military-black-light border-military-gold/20 hover:border-military-gold/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getAnnouncementIcon(announcement.type)}
                        <div>
                          <CardTitle className="text-white text-lg">
                            {announcement.title}
                            {announcement.is_pinned && (
                              <Star className="inline ml-2 text-yellow-500" size={16} />
                            )}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-military-gold text-sm font-medium">
                              {announcement.author_name}
                            </span>
                            <Badge className={getAnnouncementBadge(announcement.type)} size="sm">
                              {announcement.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        <Clock size={12} className="inline mr-1" />
                        {formatDate(announcement.created_at)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-300 leading-relaxed">
                      {announcement.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Sidebar - Atividades Recentes */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <TrendingUp className="mr-2 text-military-gold" size={20} />
            Atividade Recente
          </h3>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardContent className="p-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="mx-auto mb-2 text-gray-500" size={32} />
                  <p className="text-gray-400 text-sm">
                    Nenhuma atividade recente.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.slice(0, 8).map((activity, index) => (
                    <div key={activity.id}>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-military-gold rounded-full mt-2 shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-white text-sm leading-relaxed">
                            <span className="font-medium text-military-gold">
                              {activity.user_name}
                            </span>{' '}
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(activity.created_at)}
                          </p>
                        </div>
                      </div>
                      {index < recentActivities.length - 1 && (
                        <Separator className="my-3 bg-military-gold/20" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center">
                <Users className="mr-2 text-military-gold" size={16} />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Membros Ativos</span>
                <span className="text-military-gold font-semibold">24</span>
              </div>
              <Separator className="bg-military-gold/20" />
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Eventos Este Mês</span>
                <span className="text-military-gold font-semibold">3</span>
              </div>
              <Separator className="bg-military-gold/20" />
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Mensagens Hoje</span>
                <span className="text-military-gold font-semibold">156</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MainContent;