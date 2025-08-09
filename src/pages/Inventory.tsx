import { useState, useMemo } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InventoryItem, TIPOS, RAMOS, Nivel, Tipo, Ramo } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  TrendingUp,
  Package,
  DollarSign,
  Edit,
  Trash2,
} from "lucide-react";

const Inventory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [filterRamo, setFilterRamo] = useState<string>("");

  // Carregar dados do Supabase
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar itens:", error);
        toast({
          title: "Erro ao Carregar",
          description: "Não foi possível carregar os itens do banco de dados.",
          variant: "destructive",
        });
        return;
      }

      // Converter os dados do banco para o formato esperado
      const formattedItems: InventoryItem[] = data.map((item) => ({
        id: item.id,
        nivel: item.nivel as Nivel,
        tipo: item.tipo as Tipo,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valor_unitario,
        valorTotal: item.valor_total,
        ramo: item.ramo as Ramo,
      }));

      setItems(formattedItems);
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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.descricao
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTipo =
        !filterTipo || filterTipo === "all" || item.tipo === filterTipo;
      const matchesRamo =
        !filterRamo || filterRamo === "all" || item.ramo === filterRamo;

      return matchesSearch && matchesTipo && matchesRamo;
    });
  }, [items, searchTerm, filterTipo, filterRamo]);

  const statistics = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantidade, 0);
    const totalValue = items.reduce((sum, item) => sum + item.valorTotal, 0);
    const uniqueTypes = new Set(items.map((item) => item.tipo)).size;

    return { totalItems, totalValue, uniqueTypes, totalProducts: items.length };
  }, [items]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getRamoColor = (ramo: string) => {
    const colors: Record<string, string> = {
      Lobinho: "bg-lobinho text-white",
      Escoteiro: "bg-escoteiro text-white",
      Sênior: "bg-senior text-white",
      Pioneiro: "bg-pioneiro text-white",
      Jovens: "bg-jovens text-white",
      Escotista: "bg-escotista text-white",
      Todos: "bg-todos text-white",
    };
    return colors[ramo] || "bg-gray-500 text-white";
  };

  const handleEdit = (item: InventoryItem) => {
    // Por enquanto, apenas navega para a página de cadastro
    // Futuramente, pode passar o ID do item para edição
    navigate(`/cadastro?edit=${item.id}`);
  };

  const handleDelete = async (item: InventoryItem) => {
    try {
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", item.id);

      if (error) {
        console.error("Erro ao excluir item:", error);
        toast({
          title: "Erro ao Excluir",
          description: "Não foi possível excluir o item do banco de dados.",
          variant: "destructive",
        });
        return;
      }

      // Remover da lista local
      setItems((prevItems) => prevItems.filter((i) => i.id !== item.id));
      toast({
        title: "Item Excluído",
        description: `O item "${item.descricao}" foi removido do estoque.`,
        className: "bg-red-500 text-white",
      });
    } catch (error) {
      console.error("Erro inesperado ao excluir:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao excluir o item.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards - Only show for admin */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-scout-green/10 to-scout-green-light/10 border-scout-green/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-scout-green">
                  <Package className="w-4 h-4" />
                  Total de Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-scout-green">
                  {statistics.totalProducts}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                  Total de Itens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.totalItems}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-600">
                  <Package className="w-4 h-4" />
                  Tipos Diferentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {statistics.uniqueTypes}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-scout-brown/10 to-scout-brown-light/10 border-scout-brown/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-scout-brown">
                  <DollarSign className="w-4 h-4" />
                  Valor Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-scout-brown">
                  {formatCurrency(statistics.totalValue)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Buscar por descrição
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Digite para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por Tipo</label>
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {TIPOS.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por Ramo</label>
                <Select value={filterRamo} onValueChange={setFilterRamo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os ramos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os ramos</SelectItem>
                    {RAMOS.map((ramo) => (
                      <SelectItem key={ramo} value={ramo}>
                        {ramo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Lista de Itens ({loading ? "Carregando..." : filteredItems.length}
              )
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-green mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando itens...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead>Ramo</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-right">Valor Unitário</TableHead>
                      {isAdmin && (
                        <>
                          <TableHead className="text-right">Valor Total</TableHead>
                          <TableHead className="text-center">Ações</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {item.descricao}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {item.tipo}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{item.nivel}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getRamoColor(item.ramo)}
                            variant="outline"
                          >
                            {item.ramo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {item.quantidade}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.valorUnitario)}
                        </TableCell>
                        {isAdmin && (
                          <>
                            <TableCell className="text-right font-bold text-scout-green">
                              {formatCurrency(item.valorTotal)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(item)}
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Confirmar Exclusão
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir o item "
                                        {item.descricao}"? Esta ação não pode ser
                                        desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(item)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!loading && filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum item encontrado
                </h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou adicione novos itens ao estoque.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Inventory;
