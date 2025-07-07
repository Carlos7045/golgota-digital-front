import { useState } from 'react';
import { BookOpen, Clock, Users, Award, Star, Calendar, Play, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const courses = [
    {
      id: 1,
      title: 'Comando e Liderança Militar',
      description: 'Desenvolva habilidades essenciais de liderança e comando em situações militares.',
      category: 'lideranca',
      level: 'Avançado',
      duration: '40h',
      students: 124,
      rating: 4.8,
      price: 'R$ 299',
      instructor: 'Coronel Silva',
      modules: 8,
      image: '/placeholder.svg',
      status: 'available'
    },
    {
      id: 2,
      title: 'Primeiros Socorros em Campo',
      description: 'Aprenda técnicas fundamentais de primeiros socorros para situações de emergência.',
      category: 'medicina',
      level: 'Básico',
      duration: '20h',
      students: 89,
      rating: 4.9,
      price: 'R$ 199',
      instructor: 'Major Santos',
      modules: 5,
      image: '/placeholder.svg',
      status: 'available'
    },
    {
      id: 3,
      title: 'Tática e Estratégia',
      description: 'Fundamentos de táticas militares e planejamento estratégico.',
      category: 'tatica',
      level: 'Intermediário',
      duration: '60h',
      students: 67,
      rating: 4.7,
      price: 'R$ 399',
      instructor: 'Major Costa',
      modules: 12,
      image: '/placeholder.svg',
      status: 'coming-soon'
    },
    {
      id: 4,
      title: 'Comunicações Militares',
      description: 'Sistemas de comunicação e procedimentos de transmissão em operações.',
      category: 'comunicacao',
      level: 'Intermediário',
      duration: '30h',
      students: 45,
      rating: 4.6,
      price: 'R$ 249',
      instructor: 'Capitão Lima',
      modules: 6,
      image: '/placeholder.svg',
      status: 'available'
    }
  ];

  const categories = [
    { id: 'all', name: 'Todos os Cursos', icon: BookOpen },
    { id: 'lideranca', name: 'Liderança', icon: Users },
    { id: 'medicina', name: 'Medicina', icon: Award },
    { id: 'tatica', name: 'Tática', icon: Star },
    { id: 'comunicacao', name: 'Comunicação', icon: Play }
  ];

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Cursos CPGL
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Desenvolva suas habilidades militares com nossos cursos especializados
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">+50 Cursos</h3>
                <p className="text-primary-foreground/80">Amplo catálogo de especialidades</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">+1000 Alunos</h3>
                <p className="text-primary-foreground/80">Comunidade ativa de militares</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Certificação</h3>
                <p className="text-primary-foreground/80">Certificados reconhecidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="cursos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cursos">Cursos</TabsTrigger>
            <TabsTrigger value="meus-cursos">Meus Cursos</TabsTrigger>
            <TabsTrigger value="certificados">Certificados</TabsTrigger>
          </TabsList>

          <TabsContent value="cursos" className="space-y-8">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 border-border/50">
                  <CardHeader className="pb-4">
                    <div className="relative">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-lg bg-muted"
                      />
                      {course.status === 'coming-soon' && (
                        <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                          <Badge variant="secondary" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Em Breve
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{course.level}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-secondary text-secondary" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.students}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {course.modules} módulos
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Instrutor:</p>
                          <p className="font-medium">{course.instructor}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{course.price}</p>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        disabled={course.status === 'coming-soon'}
                      >
                        {course.status === 'coming-soon' ? 'Em Breve' : 'Inscrever-se'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="meus-cursos" className="space-y-6">
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum curso iniciado</h3>
              <p className="text-muted-foreground mb-6">
                Inscreva-se em um curso para começar sua jornada de aprendizado
              </p>
              <Button onClick={() => setSelectedCategory('all')}>
                Explorar Cursos
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="certificados" className="space-y-6">
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum certificado ainda</h3>
              <p className="text-muted-foreground mb-6">
                Complete cursos para obter seus certificados
              </p>
              <Button onClick={() => setSelectedCategory('all')}>
                Ver Cursos Disponíveis
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Courses;