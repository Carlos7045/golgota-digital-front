import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, MessageSquare, FileText, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Content {
  id: string;
  title: string;
  type: 'announcement' | 'training' | 'event' | 'resource';
  channel: string;
  author: string;
  createdAt: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
  interactions: number;
}

const ContentManagement = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('content');
  const [newContent, setNewContent] = useState({
    title: '',
    type: 'announcement' as const,
    channel: 'geral',
    content: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Since we don't have a content endpoint yet, we'll show empty state
      setContent([]);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Erro ao carregar conteúdo",
        description: "Não foi possível carregar o conteúdo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    if (!newContent.title || !newContent.content) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const content = {
      id: Date.now().toString(),
      title: newContent.title,
      type: newContent.type,
      channel: newContent.channel,
      author: 'Admin',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'published' as const,
      views: 0,
      interactions: 0
    };

    setContent(prev => [content, ...prev]);
    setNewContent({ title: '', type: 'announcement', channel: 'geral', content: '' });
    
    toast({
      title: "Conteúdo criado",
      description: "O conteúdo foi publicado com sucesso",
    });
  };

  const handleDeleteContent = (id: string) => {
    setContent(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Conteúdo removido",
      description: "O conteúdo foi removido com sucesso",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-600';
      case 'training': return 'bg-green-600';
      case 'event': return 'bg-purple-600';
      case 'resource': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-600';
      case 'draft': return 'bg-yellow-600';
      case 'archived': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Gestão de Conteúdo</h2>
          <p className="text-gray-400">Gerencie posts, anúncios e recursos da comunidade</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 bg-military-black-light">
            <TabsTrigger value="content" className="data-[state=active]:bg-military-gold data-[state=active]:text-black">
              <FileText className="w-4 h-4 mr-2" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-military-gold data-[state=active]:text-black">
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-military-gold flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Conteúdo Publicado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Título</TableHead>
                      <TableHead className="text-gray-400">Tipo</TableHead>
                      <TableHead className="text-gray-400">Canal</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Visualizações</TableHead>
                      <TableHead className="text-gray-400">Interações</TableHead>
                      <TableHead className="text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                          Carregando conteúdo...
                        </TableCell>
                      </TableRow>
                    ) : content.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                          Nenhum conteúdo encontrado. Crie o primeiro conteúdo para começar.
                        </TableCell>
                      </TableRow>
                    ) : (
                      content.map((item) => (
                        <TableRow key={item.id} className="border-gray-700">
                          <TableCell className="text-white font-medium max-w-xs truncate">
                            {item.title}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getTypeColor(item.type)} text-white text-xs`}>
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">#{item.channel}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(item.status)} text-white text-xs`}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{item.views}</TableCell>
                          <TableCell className="text-gray-300">{item.interactions}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-400 hover:bg-blue-600/20"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-military-gold hover:bg-military-gold/20"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteContent(item.id)}
                                className="text-red-400 hover:bg-red-600/20"
                              >
                                <Trash2 className="w-4 h-4" />
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

          <TabsContent value="create" className="space-y-6">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-military-gold">Criar Novo Conteúdo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Título *
                    </label>
                    <Input
                      placeholder="Digite o título..."
                      value={newContent.title}
                      onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-military-black border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Tipo
                    </label>
                    <Select 
                      value={newContent.type} 
                      onValueChange={(value: any) => setNewContent(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="bg-military-black border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announcement">Anúncio</SelectItem>
                        <SelectItem value="training">Treinamento</SelectItem>
                        <SelectItem value="event">Evento</SelectItem>
                        <SelectItem value="resource">Recurso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Canal
                  </label>
                  <Select 
                    value={newContent.channel} 
                    onValueChange={(value) => setNewContent(prev => ({ ...prev, channel: value }))}
                  >
                    <SelectTrigger className="bg-military-black border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="treinamentos">Treinamentos</SelectItem>
                      <SelectItem value="acampamentos">Acampamentos</SelectItem>
                      <SelectItem value="eventos">Eventos</SelectItem>
                      <SelectItem value="oportunidades">Oportunidades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Conteúdo *
                  </label>
                  <Textarea
                    placeholder="Digite o conteúdo..."
                    value={newContent.content}
                    onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                    className="bg-military-black border-gray-600 text-white min-h-32"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Salvar Rascunho
                  </Button>
                  <Button 
                    onClick={handleCreateContent}
                    className="bg-military-gold text-black hover:bg-military-gold/80"
                  >
                    Publicar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentManagement;