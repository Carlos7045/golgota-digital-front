-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos enumerados
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.company_status AS ENUM ('Ativa', 'Reorganização', 'Planejamento', 'Inativa');
CREATE TYPE public.event_type AS ENUM ('rally', 'camp', 'training', 'meeting');
CREATE TYPE public.event_status AS ENUM ('planning', 'active', 'completed', 'cancelled');
CREATE TYPE public.content_type AS ENUM ('announcement', 'training', 'event', 'resource');
CREATE TYPE public.content_status AS ENUM ('published', 'draft', 'archived');
CREATE TYPE public.course_level AS ENUM ('Básico', 'Intermediário', 'Avançado');
CREATE TYPE public.course_status AS ENUM ('available', 'coming-soon', 'discontinued');
CREATE TYPE public.enrollment_status AS ENUM ('pending', 'approved', 'completed', 'cancelled');

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rank TEXT,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    address TEXT,
    avatar_url TEXT,
    bio TEXT,
    specialties TEXT[],
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Tabela de companhias
CREATE TABLE public.companies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    commander_id UUID REFERENCES public.profiles(user_id),
    status public.company_status DEFAULT 'Planejamento',
    description TEXT,
    founded_date DATE,
    color TEXT DEFAULT '#FFD700',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de membros das companhias
CREATE TABLE public.company_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'Membro',
    joined_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, company_id)
);

-- Tabela de eventos
CREATE TABLE public.events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type public.event_type NOT NULL,
    event_date DATE NOT NULL,
    location TEXT NOT NULL,
    duration TEXT,
    max_participants INTEGER DEFAULT 50,
    registered_participants INTEGER DEFAULT 0,
    status public.event_status DEFAULT 'planning',
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de conteúdo
CREATE TABLE public.content (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT,
    type public.content_type NOT NULL,
    channel TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    status public.content_status DEFAULT 'draft',
    views INTEGER DEFAULT 0,
    interactions INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de treinamentos
CREATE TABLE public.trainings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    max_participants INTEGER DEFAULT 30,
    current_participants INTEGER DEFAULT 0,
    next_session TIMESTAMP WITH TIME ZONE,
    location TEXT,
    status TEXT DEFAULT 'Inscrições Abertas',
    requirements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de cursos
CREATE TABLE public.courses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    level public.course_level DEFAULT 'Básico',
    duration TEXT,
    price DECIMAL(10,2),
    instructor TEXT,
    modules INTEGER DEFAULT 1,
    students INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    image_url TEXT,
    status public.course_status DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de inscrições (para eventos, treinamentos e cursos)
CREATE TABLE public.enrollments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    training_id UUID REFERENCES public.trainings(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    status public.enrollment_status DEFAULT 'pending',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    CHECK (
        (event_id IS NOT NULL AND training_id IS NULL AND course_id IS NULL) OR
        (event_id IS NULL AND training_id IS NOT NULL AND course_id IS NULL) OR
        (event_id IS NULL AND training_id IS NULL AND course_id IS NOT NULL)
    )
);

-- Tabela de atividades do usuário
CREATE TABLE public.user_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'training', 'course', 'achievement'
    title TEXT NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de conquistas
CREATE TABLE public.achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'award',
    achieved_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de papéis/funções dos usuários
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função de segurança para verificar papéis
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas RLS para profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para companies
CREATE POLICY "Users can view all companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para company_members
CREATE POLICY "Users can view all company members" ON public.company_members FOR SELECT USING (true);
CREATE POLICY "Users can manage their own membership" ON public.company_members FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all memberships" ON public.company_members FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para events
CREATE POLICY "Users can view all events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para content
CREATE POLICY "Users can view published content" ON public.content FOR SELECT USING (status = 'published' OR auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create content" ON public.content FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own content" ON public.content FOR UPDATE USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete content" ON public.content FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para trainings
CREATE POLICY "Users can view all trainings" ON public.trainings FOR SELECT USING (true);
CREATE POLICY "Admins can manage trainings" ON public.trainings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para courses
CREATE POLICY "Users can view available courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para enrollments
CREATE POLICY "Users can view their own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own enrollments" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own enrollments" ON public.enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all enrollments" ON public.enrollments FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para user_activities
CREATE POLICY "Users can view their own activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own activities" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all activities" ON public.user_activities FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para achievements
CREATE POLICY "Users can view their own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all achievements" ON public.achievements FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email), NEW.email);
  
  -- Atribuir papel padrão de usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON public.trainings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar contadores
CREATE OR REPLACE FUNCTION public.update_enrollment_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contador de participantes em eventos
  IF NEW.event_id IS NOT NULL THEN
    UPDATE public.events 
    SET registered_participants = (
      SELECT COUNT(*) FROM public.enrollments 
      WHERE event_id = NEW.event_id AND status != 'cancelled'
    )
    WHERE id = NEW.event_id;
  END IF;
  
  -- Atualizar contador de participantes em treinamentos
  IF NEW.training_id IS NOT NULL THEN
    UPDATE public.trainings 
    SET current_participants = (
      SELECT COUNT(*) FROM public.enrollments 
      WHERE training_id = NEW.training_id AND status != 'cancelled'
    )
    WHERE id = NEW.training_id;
  END IF;
  
  -- Atualizar contador de estudantes em cursos
  IF NEW.course_id IS NOT NULL THEN
    UPDATE public.courses 
    SET students = (
      SELECT COUNT(*) FROM public.enrollments 
      WHERE course_id = NEW.course_id AND status != 'cancelled'
    )
    WHERE id = NEW.course_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contadores após inscrições
CREATE TRIGGER update_enrollment_counters_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_enrollment_counters();

-- Dados iniciais de exemplo
INSERT INTO public.companies (name, status, description, founded_date, color) VALUES
('Alpha', 'Ativa', 'Companhia de elite focada em operações especiais e treinamento avançado.', '2020-03-15', '#FFD700'),
('Bravo', 'Ativa', 'Companhia especializada em logística e suporte operacional.', '2019-08-22', '#32CD32'),
('Charlie', 'Ativa', 'Companhia de reconhecimento e inteligência.', '2021-01-10', '#FF6347'),
('Delta', 'Reorganização', 'Companhia de comunicações e tecnologia.', '2021-11-05', '#4169E1');

INSERT INTO public.trainings (name, type, description, max_participants, location, requirements) VALUES
('Rally Missionário 2025', 'Rally', 'Treinamento focado em criatividade, resistência e missão', 60, 'Campo de Treinamento - SP', ARRAY['14+ anos', 'Autorização dos pais (menores)', 'Taxa de inscrição']),
('CPLG - Fase 1', 'CPLG', 'Curso Preparatório de Liderança Gólgota - Primeira Fase', 30, 'Centro de Treinamento', ARRAY['Soldado ou superior', 'Aprovação do comandante', 'Disponibilidade fins de semana']),
('FEG - Sobrevivência', 'FEG', 'Formação Especial Gólgota - Módulo Sobrevivência', 20, 'Mata Atlântica - RJ', ARRAY['Cabo ou superior', 'Experiência em acampamentos', 'Exame médico']);

INSERT INTO public.courses (title, description, category, level, duration, price, instructor, modules, rating) VALUES
('Comando e Liderança Militar', 'Desenvolva habilidades essenciais de liderança e comando em situações militares.', 'lideranca', 'Avançado', '40h', 299.00, 'Coronel Silva', 8, 4.8),
('Primeiros Socorros em Campo', 'Aprenda técnicas fundamentais de primeiros socorros para situações de emergência.', 'medicina', 'Básico', '20h', 199.00, 'Major Santos', 5, 4.9),
('Tática e Estratégia', 'Fundamentos de táticas militares e planejamento estratégico.', 'tatica', 'Intermediário', '60h', 399.00, 'Major Costa', 12, 4.7),
('Comunicações Militares', 'Sistemas de comunicação e procedimentos de transmissão em operações.', 'comunicacao', 'Intermediário', '30h', 249.00, 'Capitão Lima', 6, 4.6);