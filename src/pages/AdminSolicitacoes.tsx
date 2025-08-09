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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Phone, Mail, MessageSquare, CheckCircle, Filter } from "lucide-react";

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
  status: string;
}

const AdminSolicitacoes = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pendente");

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
  }, [user, statusFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("item_requests")
        .select("*");
      
      // Aplicar filtro por status se não for "todas"
      if (statusFilter !== "todas") {
        query = query.eq("status", statusFilter);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

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

  const markAsResolved = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("item_requests")
        .update({ status: "resolvida" })
        .eq("id", requestId);

      if (error) {
        console.error("Erro ao marcar como resolvida:", error);
        toast({
          title: "Erro",
          description: "Não foi possível marcar a solicitação como resolvida.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Solicitação marcada como resolvida!",
      });

      // Recarregar a lista para remover a solicitação resolvida
      loadRequests();
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente": return "Pendente";
      case "resolvida": return "Resolvida";
      default: return status;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pendente": return "default";
      case "resolvida": return "secondary";
      default: return "outline";
    }
  };

  const getPageTitle = () => {
    switch (statusFilter) {
      case "pendente": return "Solicitações de Itens Pendentes";
      case "resolvida": return "Solicitações de Itens Resolvidas";
      case "todas": return "Todas as Solicitações de Itens";
      default: return "Solicitações de Itens";
    }
  };

  const getPageDescription = () => {
    switch (statusFilter) {
      case "pendente": return "Visualize e gerencie todas as solicitações de itens pendentes";
      case "resolvida": return "Visualize todas as solicitações de itens já resolvidas";
      case "todas": return "Visualize todas as solicitações de itens";
      default: return "Visualize e gerencie as solicitações de itens";
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

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-scout-green" />
            {getPageTitle()}
          </h1>
          <p className="text-muted-foreground">
            {getPageDescription()}
          </p>
        </div>

        {/* Filtro por Status */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrar por status:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="resolvida">Resolvidas</SelectItem>
                <SelectItem value="todas">Todas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              {statusFilter === "todas" ? `Todas as Solicitações (${requests.length})` : 
               statusFilter === "pendente" ? `Solicitações Pendentes (${requests.length})` :
               `Solicitações Resolvidas (${requests.length})`}
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
                  {statusFilter === "pendente" ? "Nenhuma solicitação pendente" :
                   statusFilter === "resolvida" ? "Nenhuma solicitação resolvida" :
                   "Nenhuma solicitação encontrada"}
                </h3>
                <p className="text-muted-foreground">
                  {statusFilter === "pendente" ? "Todas as solicitações foram resolvidas ou nenhuma foi feita ainda." :
                   statusFilter === "resolvida" ? "Nenhuma solicitação foi resolvida ainda." :
                   "Quando alguém solicitar um item, aparecerá aqui."}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="block lg:hidden space-y-4">
                  {requests.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm leading-tight">{request.nome}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="bg-scout-green/10 text-scout-green border-scout-green/20 text-xs">
                                {request.grupo_escoteiro}
                              </Badge>
                              <Badge variant={getStatusBadgeVariant(request.status)} className="text-xs">
                                {getStatusLabel(request.status)}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {formatDate(request.created_at)}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-muted-foreground text-xs">Item:</span>
                            <div className="font-medium text-sm">{request.item_solicitado}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground text-xs">Quantidade:</span>
                              <div className="font-semibold text-scout-green">{request.quantidade}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Contato:</span>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate">{request.email}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                  <Phone className="w-3 h-3" />
                                  <span>{request.telefone}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {request.mensagem_adicional && (
                            <div className="pt-2 border-t">
                              <span className="text-muted-foreground text-xs">Mensagem:</span>
                              <div className="flex items-start gap-1 mt-1">
                                <MessageSquare className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">
                                  {request.mensagem_adicional}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {statusFilter === "pendente" && (
                            <div className="pt-3 border-t">
                              <Button
                                onClick={() => markAsResolved(request.id)}
                                size="sm"
                                className="w-full bg-scout-green hover:bg-scout-green/90"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Marcar como Resolvida
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden lg:block rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Nome</TableHead>
                        <TableHead className="min-w-[150px]">Grupo Escoteiro</TableHead>
                        <TableHead className="min-w-[200px]">Contato</TableHead>
                        <TableHead className="min-w-[200px]">Item Solicitado</TableHead>
                        <TableHead className="text-center min-w-[100px]">Quantidade</TableHead>
                        <TableHead className="min-w-[200px]">Mensagem</TableHead>
                        <TableHead className="min-w-[150px]">Data</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        {statusFilter === "pendente" && <TableHead className="min-w-[120px]">Ações</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {request.nome}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-scout-green/10 text-scout-green border-scout-green/20">
                                {request.grupo_escoteiro}
                              </Badge>
                            </div>
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
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(request.status)}>
                              {getStatusLabel(request.status)}
                            </Badge>
                          </TableCell>
                          {statusFilter === "pendente" && (
                            <TableCell>
                              <Button
                                onClick={() => markAsResolved(request.id)}
                                size="sm"
                                className="bg-scout-green hover:bg-scout-green/90"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Resolver
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminSolicitacoes;