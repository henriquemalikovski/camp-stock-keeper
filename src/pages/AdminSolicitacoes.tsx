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
import { ClipboardList, Phone, Mail, MessageSquare, CheckCircle, Filter, Clock, CheckCircle2, TrendingUp } from "lucide-react";

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
  const [allRequests, setAllRequests] = useState<ItemRequest[]>([]);
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
      
      // Primeiro, buscar todas as solicitações para estatísticas
      const { data: allData, error: allError } = await supabase
        .from("item_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (allError) {
        console.error("Erro ao carregar todas as solicitações:", allError);
        toast({
          title: "Erro ao Carregar",
          description: "Não foi possível carregar as solicitações.",
          variant: "destructive",
        });
        return;
      }

      setAllRequests(allData || []);

      // Aplicar filtro para exibição
      if (statusFilter === "todas") {
        setRequests(allData || []);
      } else {
        const filteredData = (allData || []).filter(request => request.status === statusFilter);
        setRequests(filteredData);
      }
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
      case "pendente": return "outline";
      case "resolvida": return "secondary";
      default: return "outline";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pendente": return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700";
      case "resolvida": return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700";
      default: return "";
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

  // Cálculo das estatísticas
  const statistics = {
    total: allRequests.length,
    pendente: allRequests.filter(req => req.status === "pendente").length,
    resolvida: allRequests.filter(req => req.status === "resolvida").length,
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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <ClipboardList className="w-7 h-7 text-primary" />
                Gerenciar Solicitações
              </h1>
              <p className="text-muted-foreground mt-2">
                Visualize e gerencie todas as solicitações de itens dos grupos escoteiros
              </p>
            </div>
            
            {/* Modern Filter */}
            <div className="flex items-center gap-3 bg-card p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filtrar:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44 bg-background border-muted hover:border-primary/50 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg">
                  <SelectItem value="pendente" className="hover:bg-muted/80">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span>Pendentes</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="resolvida" className="hover:bg-muted/80">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Resolvidas</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="todas" className="hover:bg-muted/80">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span>Todas</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total de Solicitações</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{statistics.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{statistics.pendente}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Resolvidas</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{statistics.resolvida}</p>
                </div>
                <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Solicitações de Itens
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
                              <Badge variant={getStatusBadgeVariant(request.status)} className={`text-xs ${getStatusBadgeClass(request.status)}`}>
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
                <div className="hidden lg:block rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px]">Nome</TableHead>
                        <TableHead className="w-[120px]">Grupo</TableHead>
                        <TableHead className="w-[200px]">Item Solicitado</TableHead>
                        <TableHead className="w-[60px] text-center">Qtd</TableHead>
                        <TableHead className="w-[180px]">Contato</TableHead>
                        <TableHead className="w-[120px]">Data</TableHead>
                        <TableHead className="w-[90px]">Status</TableHead>
                        {statusFilter === "pendente" && <TableHead className="w-[100px]">Ações</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium p-3">
                            <div className="max-w-[130px] truncate" title={request.nome}>
                              {request.nome}
                            </div>
                          </TableCell>
                          <TableCell className="p-3">
                            <Badge variant="outline" className="bg-scout-green/10 text-scout-green border-scout-green/20 text-xs">
                              {request.grupo_escoteiro}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium p-3">
                            <div className="max-w-[180px] truncate" title={request.item_solicitado}>
                              {request.item_solicitado}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-semibold text-scout-green p-3">
                            {request.quantidade}
                          </TableCell>
                          <TableCell className="p-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="text-muted-foreground max-w-[140px] truncate" title={request.email}>
                                  {request.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                <span className="text-muted-foreground">{request.telefone}</span>
                              </div>
                              {request.mensagem_adicional && (
                                <div className="flex items-center gap-1 text-xs">
                                  <MessageSquare className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                                  <span className="text-muted-foreground max-w-[140px] truncate" title={request.mensagem_adicional}>
                                    {request.mensagem_adicional}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground p-3">
                            <div className="max-w-[110px]">
                              {new Date(request.created_at).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              })}
                            </div>
                            <div className="text-[10px] text-muted-foreground/70">
                              {new Date(request.created_at).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="p-3">
                            <Badge variant={getStatusBadgeVariant(request.status)} className={`text-xs ${getStatusBadgeClass(request.status)}`}>
                              {getStatusLabel(request.status)}
                            </Badge>
                          </TableCell>
                          {statusFilter === "pendente" && (
                            <TableCell className="p-3">
                              <Button
                                onClick={() => markAsResolved(request.id)}
                                size="sm"
                                className="bg-scout-green hover:bg-scout-green/90 text-xs px-2 py-1 h-8"
                              >
                                <CheckCircle className="w-3 h-3" />
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