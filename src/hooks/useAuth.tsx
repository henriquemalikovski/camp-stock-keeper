import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.email);

        // Só atualizar se não estamos fazendo logout
        if (!isSigningOut) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Check if user is admin
            setTimeout(async () => {
              if (!mounted || isSigningOut) return;
              
              try {
                const { data: profile, error } = await supabase
                  .from('profiles')
                  .select('role')
                  .eq('user_id', session.user.id)
                  .single();
                
                if (!error && profile?.role === 'admin' && mounted && !isSigningOut) {
                  setIsAdmin(true);
                } else {
                  setIsAdmin(false);
                }
              } catch (error) {
                console.error('Error checking admin status:', error);
                if (mounted && !isSigningOut) {
                  setIsAdmin(false);
                }
              }
            }, 0);
          } else {
            setIsAdmin(false);
          }
        }
        
        if (mounted && !isSigningOut) {
          setLoading(false);
        }
      }
    );

    // Check for existing session only once
    const initializeAuth = async () => {
      if (!mounted) return;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted || isSigningOut) return;
        
        if (!error && session) {
          console.log('Sessão existente encontrada:', session.user?.email);
          setSession(session);
          setUser(session.user);
        } else {
          console.log('Nenhuma sessão existente');
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        if (mounted && !isSigningOut) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted && !isSigningOut) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isSigningOut]); // Adicionar isSigningOut como dependência

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    if (!error) {
      toast({
        title: "Cadastro realizado",
        description: "Verifique seu email para confirmar o cadastro.",
        className: "bg-scout-green text-white",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao sistema!",
        className: "bg-scout-green text-white",
      });
    }

    return { error };
  };

  const signOut = async () => {
    // Evitar chamadas duplicadas
    if (isSigningOut) {
      console.log('Logout já em andamento, ignorando...');
      return;
    }

    try {
      setIsSigningOut(true);
      console.log('Iniciando logout...');
      
      // Limpar primeiro o estado local para evitar re-login automático
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      // Limpar todos os dados do Supabase no localStorage
      const keysToRemove = [
        'supabase.auth.token',
        'sb-wxtuhsfmhtyaebffmmdm-auth-token',
        'sb-wxtuhsfmhtyaebffmmdm-auth-token-code-verifier'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Verificar se há sessão ativa antes de tentar logout
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.log('Nenhuma sessão ativa encontrada');
        
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado do sistema.",
        });
        
        // Aguardar um pouco antes do redirecionamento
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
        return;
      }

      // Só tentar logout se há sessão ativa
      console.log('Sessão ativa encontrada, fazendo logout...');
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      console.log('Resultado do logout:', { error });
      
      if (!error) {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado do sistema.",
        });
      } else {
        // Se erro for "session not found", tratar como sucesso
        if (error.message?.includes('Session not found') || error.message?.includes('session_not_found')) {
          console.log('Sessão já expirada, logout tratado como sucesso');
          toast({
            title: "Logout realizado",
            description: "Você foi desconectado do sistema.",
          });
        } else {
          console.error('Erro no logout:', error);
          toast({
            title: "Logout realizado",
            description: "Você foi desconectado do sistema.",
          });
        }
      }
      
      // Aguardar um pouco antes do redirecionamento para garantir que o auth state foi atualizado
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (err) {
      console.error('Erro inesperado no logout:', err);
      
      // Mesmo com erro, limpar estado local
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      // Limpar localStorage novamente
      const keysToRemove = [
        'supabase.auth.token',
        'sb-wxtuhsfmhtyaebffmmdm-auth-token',
        'sb-wxtuhsfmhtyaebffmmdm-auth-token-code-verifier'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado do sistema.",
      });
      
      // Forçar redirecionamento
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } finally {
      // Só resetar o flag após o redirecionamento
      setTimeout(() => {
        setIsSigningOut(false);
      }, 200);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};