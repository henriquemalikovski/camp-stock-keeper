import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InventoryItem, Tipo, Ramo, Nivel } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Package, ShoppingCart, Search } from "lucide-react";

interface SelectedItem {
  id: string;
  descricao: string;
  quantidade: number;
}

const SolicitarItem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    grupoEscoteiro: "",
    email: "",
    telefone: "",
    mensagemAdicional: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar itens disponíveis
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoadingItems(true);
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("descricao", { ascending: true });

      if (error) {
        console.error("Erro ao carregar itens:", error);
        toast({
          title: "Erro ao Carregar",
          description: "Não foi possível carregar os itens disponíveis.",
          variant: "destructive",
        });
        return;
      }

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
        description: "Ocorreu um erro inesperado ao carregar os itens.",
        variant: "destructive",
      });
    } finally {
      setLoadingItems(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemSelection = (item: InventoryItem, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [
        ...prev,
        {
          id: item.id,
          descricao: item.descricao,
          quantidade: 1,
        },
      ]);
    } else {
      setSelectedItems((prev) =>
        prev.filter((selected) => selected.id !== item.id)
      );
    }
  };

  const handleQuantityChange = (itemId: string, quantidade: number) => {
    setSelectedItems((prev) =>
      prev.map((selected) =>
        selected.id === itemId
          ? { ...selected, quantidade: Math.max(1, quantidade) }
          : selected
      )
    );
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Filtrar itens com base no termo de pesquisa
  const filteredItems = items.filter(
    (item) =>
      item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ramo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validações
      const requiredFields = ["nome", "grupoEscoteiro", "email", "telefone"];

      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          toast({
            title: "Erro de Validação",
            description: "Por favor, preencha todos os campos obrigatórios.",
            variant: "destructive",
          });
          return;
        }
      }

      if (selectedItems.length === 0) {
        toast({
          title: "Erro de Validação",
          description: "Por favor, selecione pelo menos um item.",
          variant: "destructive",
        });
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Erro de Validação",
          description: "Por favor, digite um email válido.",
          variant: "destructive",
        });
        return;
      }

      // Criar uma solicitação para cada item selecionado
      const requests = selectedItems.map((item) => ({
        nome: formData.nome,
        grupo_escoteiro: formData.grupoEscoteiro,
        email: formData.email,
        telefone: formData.telefone,
        item_solicitado: item.descricao,
        quantidade: item.quantidade,
        mensagem_adicional: formData.mensagemAdicional || null,
      }));

      const { error } = await supabase.from("item_requests").insert(requests);

      if (error) {
        console.error("Erro ao salvar solicitação:", error);
        toast({
          title: "Erro ao Enviar",
          description:
            "Ocorreu um erro ao enviar sua solicitação: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Solicitação Enviada",
        description: `Sua solicitação de ${selectedItems.length} item(s) foi enviada com sucesso!`,
        className: "bg-scout-green text-white",
      });

      // Limpar formulário
      setFormData({
        nome: "",
        grupoEscoteiro: "",
        email: "",
        telefone: "",
        mensagemAdicional: "",
      });
      setSelectedItems([]);
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6 text-scout-green" />
                Solicitar Itens
              </h1>
              <p className="text-muted-foreground">
                Selecione os itens desejados e preencha seus dados para fazer a
                solicitação
              </p>
            </div>
          </div>

          {/* Lista de Itens Disponíveis */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <ShoppingCart className="w-5 h-5" />
                Itens Disponíveis ({filteredItems.length})
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Pesquisar por item, tipo ou ramo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {loadingItems ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-green mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando itens...</p>
                </div>
              ) : filteredItems.length === 0 && searchTerm ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum item encontrado para "{searchTerm}"
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile View - Cards */}
                  <div className="block lg:hidden space-y-4">
                    {filteredItems.map((item) => {
                      const isSelected = selectedItems.some(
                        (selected) => selected.id === item.id
                      );
                      const selectedItem = selectedItems.find(
                        (selected) => selected.id === item.id
                      );

                      return (
                        <Card key={item.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                  handleItemSelection(item, checked as boolean)
                                }
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm leading-tight">
                                  {item.descricao}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    className={`${getRamoColor(
                                      item.ramo
                                    )} text-xs`}
                                    variant="outline"
                                  >
                                    {item.ramo}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {item.tipo}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Disponível:
                                </span>
                                <div className="font-semibold">
                                  {item.quantidade}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Valor:
                                </span>
                                <div className="font-medium">
                                  {formatCurrency(item.valorUnitario)}
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="pt-2 border-t">
                                <Label
                                  htmlFor={`qty-${item.id}`}
                                  className="text-sm font-medium"
                                >
                                  Quantidade desejada:
                                </Label>
                                <Input
                                  id={`qty-${item.id}`}
                                  type="number"
                                  min="1"
                                  max={item.quantidade}
                                  value={selectedItem?.quantidade || 1}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      item.id,
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="w-full mt-1"
                                />
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Desktop View - Table */}
                  <div className="hidden lg:block rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead className="min-w-[200px]">
                            Descrição
                          </TableHead>
                          <TableHead className="min-w-[120px]">Tipo</TableHead>
                          <TableHead className="min-w-[100px]">Ramo</TableHead>
                          <TableHead className="text-center min-w-[100px]">
                            Disponível
                          </TableHead>
                          <TableHead className="text-right min-w-[120px]">
                            Valor Unit.
                          </TableHead>
                          <TableHead className="text-center min-w-[120px]">
                            Quantidade
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item) => {
                          const isSelected = selectedItems.some(
                            (selected) => selected.id === item.id
                          );
                          const selectedItem = selectedItems.find(
                            (selected) => selected.id === item.id
                          );

                          return (
                            <TableRow
                              key={item.id}
                              className="hover:bg-muted/50"
                            >
                              <TableCell>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) =>
                                    handleItemSelection(
                                      item,
                                      checked as boolean
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.descricao}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {item.tipo}
                                </span>
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
                              <TableCell className="text-center">
                                {isSelected && (
                                  <Input
                                    type="number"
                                    min="1"
                                    max={item.quantidade}
                                    value={selectedItem?.quantidade || 1}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        item.id,
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="w-20 text-center"
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Itens Selecionados - Fora do scroll */}
          {selectedItems.length > 0 && (
            <Card className="mb-8">
              <CardContent className="p-4 bg-scout-green/5 border border-scout-green/20">
                <h4 className="font-medium text-scout-green mb-2">
                  Itens Selecionados:
                </h4>
                <div className="space-y-1">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="text-sm">
                      <span className="font-medium">{item.descricao}</span> -
                      Quantidade: {item.quantidade}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Seus Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      placeholder="Digite seu nome completo"
                      value={formData.nome}
                      onChange={(e) =>
                        handleInputChange("nome", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grupoEscoteiro">Grupo Escoteiro *</Label>
                    <Input
                      id="grupoEscoteiro"
                      placeholder="Digite o nome do seu grupo"
                      value={formData.grupoEscoteiro}
                      onChange={(e) =>
                        handleInputChange("grupoEscoteiro", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Digite seu email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone de Contato *</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.telefone}
                      onChange={(e) =>
                        handleInputChange("telefone", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagemAdicional">Mensagem Adicional</Label>
                  <Textarea
                    id="mensagemAdicional"
                    placeholder="Digite informações adicionais sobre sua solicitação (opcional)"
                    value={formData.mensagemAdicional}
                    onChange={(e) =>
                      handleInputChange("mensagemAdicional", e.target.value)
                    }
                    rows={4}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting || selectedItems.length === 0}
                    className="w-full sm:flex-1 bg-scout-green hover:bg-scout-green-light"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting
                      ? "Enviando..."
                      : `Enviar Solicitação (${selectedItems.length} item${
                          selectedItems.length !== 1 ? "s" : ""
                        })`}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SolicitarItem;
