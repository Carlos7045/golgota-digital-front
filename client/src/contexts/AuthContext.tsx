import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      localStorage.removeItem('authToken');
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
        body: JSON.stringify({ emailOrCpf, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfile(data.profile);
        setRoles(data.roles);
        localStorage.setItem('authToken', data.token);
        
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
          description: errorData.message,
          variant: "destructive"
        });
        return { error: { message: errorData.message } };
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
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        toast({
          title: "Cadastro realizado!",
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
    setUser(null);
    setProfile(null);
    setRoles([]);
    localStorage.removeItem('authToken');
    
    toast({
      title: "Logout realizado",
      description: "Até logo!"
    });
  };

  const value = {
    user,
    profile,
    roles,
    session: user ? { user } : null, // For backward compatibility
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}