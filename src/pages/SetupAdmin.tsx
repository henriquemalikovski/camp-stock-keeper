import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function SetupAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createAdminUser = async () => {
    setIsLoading(true);
    try {
      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: 'hmalikovski@gmail.com',
        password: 'Cop27@cop',
        options: {
          data: {
            full_name: 'Henrique Malikovski'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Atualizar o perfil para admin
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('user_id', data.user.id);

        if (profileError) throw profileError;

        toast({
          title: "Usuário administrador criado!",
          description: "Email: hmalikovski@gmail.com, Senha: Cop27@cop",
        });
      }
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        toast({
          title: "Usuário já existe",
          description: "O usuário administrador já foi criado anteriormente.",
        });
      } else {
        toast({
          title: "Erro ao criar usuário",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Configurar Administrador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Clique no botão abaixo para criar o usuário administrador padrão.
          </p>
          
          <div className="text-sm space-y-1 text-center">
            <p><strong>Email:</strong> hmalikovski@gmail.com</p>
            <p><strong>Senha:</strong> Cop27@cop</p>
            <p><strong>Nome:</strong> Henrique Malikovski</p>
          </div>

          <Button 
            onClick={createAdminUser}
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Criando...' : 'Criar Usuário Administrador'}
          </Button>

          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
          >
            Voltar ao Sistema
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}