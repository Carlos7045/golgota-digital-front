import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  name: string;
  rank?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  avatar_url?: string;
  bio?: string;
  specialties?: string[];
  joined_at?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  roles: string[];
  session: any; // For backward compatibility
  loading: boolean;
  signIn: (emailOrCpf: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        credentials: 'include', // Usar cookies automaticamente
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setRoles(data.roles);
        // For backwards compatibility, create user object from profile
        if (data.profile) {
          setUser({
            id: data.profile.user_id,
            email: data.profile.email || '',
            created_at: data.profile.created_at,
          });
        }
      } else if (response.status === 401) {
        // Token inválido no cookie
        console.log('Token inválido ou expirado');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (emailOrCpf: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ emailOrCpf, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Token será pego do cookie automaticamente
        // Não precisa salvar no localStorage
        
        setUser(data.user);
        setProfile(data.profile);
        setRoles(data.roles);
        
        // Check if password change is required
        if (data.force_password_change) {
          window.location.href = '/change-password';
          return { error: null };
        }
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo(a) de volta!"
        });
        
        return { error: null };
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro no login",
          description: errorData.error || errorData.message,
          variant: "destructive"
        });
        return { error: { message: errorData.error || errorData.message } };
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Erro de conexão",
        variant: "destructive"
      });
      return { error: { message: 'Network error' } };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, fullName }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfile(data.profile);
        setRoles(data.roles || []);
        
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Conta criada com sucesso!"
        });
        return { error: null };
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro no cadastro",
          description: errorData.message,
          variant: "destructive"
        });
        return { error: { message: errorData.message } };
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Erro de conexão",
        variant: "destructive"
      });
      return { error: { message: 'Network error' } };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Usar cookies automaticamente
      });
      
      toast({
        title: "Logout realizado",
        description: "Até logo!"
      });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setUser(null);
      setProfile(null);
      setRoles([]);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      });

      if (response.ok) {
        toast({
          title: "Senha atualizada!",
          description: "Sua senha foi alterada com sucesso."
        });
        return { error: null };
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao atualizar senha",
          description: errorData.message,
          variant: "destructive"
        });
        return { error: { message: errorData.message } };
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar senha",
        description: "Erro de conexão",
        variant: "destructive"
      });
      return { error: { message: 'Network error' } };
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const updateProfile = (updates: Partial<Profile>) => {
    if (profile) {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      
      // Update user object if needed
      if (updates.email && user) {
        setUser({ ...user, email: updates.email });
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      roles,
      session: user, // For backward compatibility
      loading,
      signIn,
      signUp,
      signOut,
      updatePassword,
      refreshProfile,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}