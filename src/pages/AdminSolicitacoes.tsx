import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Phone, Mail, MessageSquare } from "lucide-react";

interface ItemRequest {
  id: string;
  nome: string;
  grupo_escoteiro: string;
  email: string;
  telefone: string;
  item_solicitado: string;
  quantidade: number;
  mensagem_adicional: string | null;
  created_at: string;
}

const AdminSolicitacoes = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("item_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar solicitações:", error);
        toast({
          title: "Erro ao Carregar",
          description: "Não foi possível carregar as solicitações.",
          variant: "destructive",
        });
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-green mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection will happen via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-scout-green" />
            Solicitações de Itens
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as solicitações de itens recebidas
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Lista de Solicitações ({requests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-green mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando solicitações...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhuma solicitação encontrada
                </h3>
                <p className="text-muted-foreground">
                  Quando alguém solicitar um item, aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Grupo Escoteiro</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Item Solicitado</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {request.nome}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-scout-green/10 text-scout-green border-scout-green/20">
                            {request.grupo_escoteiro}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              <span className="text-muted-foreground">{request.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              <span className="text-muted-foreground">{request.telefone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.item_solicitado}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-scout-green">
                          {request.quantidade}
                        </TableCell>
                        <TableCell>
                          {request.mensagem_adicional ? (
                            <div className="flex items-start gap-1">
                              <MessageSquare className="w-3 h-3 mt-0.5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground max-w-xs truncate">
                                {request.mensagem_adicional}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(request.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminSolicitacoes;