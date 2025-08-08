import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  InventoryItem,
  NIVEIS,
  TIPOS,
  RAMOS,
  Nivel,
  Tipo,
  Ramo,
} from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft, Package } from "lucide-react";

const CadastroItem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [formData, setFormData] = useState({
    nivel: "" as Nivel | "",
    tipo: "" as Tipo | "",
    descricao: "",
    quantidade: "",
    valorUnitario: "",
    ramo: "" as Ramo | "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar item para edição
  useEffect(() => {
    if (editId) {
      loadItemForEdit(editId);
      setIsEditing(true);
    }
  }, [editId]);

  const loadItemForEdit = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao carregar item:", error);
        toast({
          title: "Erro ao Carregar",
          description: "Não foi possível carregar o item para edição.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setFormData({
        nivel: data.nivel as Nivel,
        tipo: data.tipo as Tipo,
        descricao: data.descricao,
        quantidade: data.quantidade.toString(),
        valorUnitario: data.valor_unitario.toString(),
        ramo: data.ramo as Ramo,
      });
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao carregar o item.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validações
      if (
        !formData.tipo ||
        !formData.descricao ||
        !formData.quantidade ||
        !formData.valorUnitario ||
        !formData.ramo
      ) {
        toast({
          title: "Erro de Validação",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      const quantidade = parseInt(formData.quantidade);
      const valorUnitario = parseFloat(formData.valorUnitario);

      if (quantidade <= 0 || valorUnitario <= 0) {
        toast({
          title: "Erro de Validação",
          description:
            "Quantidade e valor unitário devem ser maiores que zero.",
          variant: "destructive",
        });
        return;
      }

      const valorTotal = quantidade * valorUnitario;
      const newItem = {
        nivel: formData.nivel || "Não Tem",
        tipo: formData.tipo as Tipo,
        descricao: formData.descricao,
        quantidade,
        valor_unitario: valorUnitario,
        valor_total: valorTotal,
        ramo: formData.ramo as Ramo,
      };

      // Salvar no Supabase
      let data, error;
      if (isEditing && editId) {
        ({ data, error } = await supabase
          .from("inventory_items")
          .update(newItem)
          .eq("id", editId)
          .select());
      } else {
        ({ data, error } = await supabase
          .from("inventory_items")
          .insert([newItem])
          .select());
      }

      if (error) {
        console.error("Erro ao salvar no banco:", error);
        toast({
          title: "Erro ao Salvar",
          description:
            "Ocorreu um erro ao salvar no banco de dados: " + error.message,
          variant: "destructive",
        });
        return;
      }

      console.log("Item salvo no banco:", data);

      toast({
        title: isEditing ? "Item Atualizado" : "Item Cadastrado",
        description: isEditing 
          ? "O item foi atualizado com sucesso!" 
          : "O item foi adicionado ao estoque com sucesso!",
        className: "bg-scout-green text-white",
      });

      if (isEditing) {
        navigate("/");
        return;
      }

      // Limpar formulário
      setFormData({
        nivel: "",
        tipo: "",
        descricao: "",
        quantidade: "",
        valorUnitario: "",
        ramo: "",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar o item. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const valorTotal =
    formData.quantidade && formData.valorUnitario
      ? parseInt(formData.quantidade) * parseFloat(formData.valorUnitario)
      : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
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
                {isEditing ? "Editar Item" : "Cadastrar Novo Item"}
              </h1>
              <p className="text-muted-foreground">
                {isEditing 
                  ? "Edite as informações do item do estoque" 
                  : "Adicione um novo item ao estoque do grupo escoteiro"}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Item</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-green mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando item...</p>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) =>
                        handleInputChange("tipo", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nivel">Nível</Label>
                    <Select
                      value={formData.nivel}
                      onValueChange={(value) =>
                        handleInputChange("nivel", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        {NIVEIS.map((nivel) => (
                          <SelectItem key={nivel} value={nivel}>
                            {nivel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Digite a descrição do item..."
                    value={formData.descricao}
                    onChange={(e) =>
                      handleInputChange("descricao", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ramo">Ramo *</Label>
                  <Select
                    value={formData.ramo}
                    onValueChange={(value) => handleInputChange("ramo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ramo" />
                    </SelectTrigger>
                    <SelectContent>
                      {RAMOS.map((ramo) => (
                        <SelectItem key={ramo} value={ramo}>
                          {ramo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      placeholder="0"
                      value={formData.quantidade}
                      onChange={(e) =>
                        handleInputChange("quantidade", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valorUnitario">Valor Unitário (R$) *</Label>
                    <Input
                      id="valorUnitario"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0,00"
                      value={formData.valorUnitario}
                      onChange={(e) =>
                        handleInputChange("valorUnitario", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Total</Label>
                    <div className="flex items-center h-10 px-3 py-2 bg-muted rounded-md border">
                      <span className="font-bold text-scout-green">
                        {formatCurrency(valorTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-scout-green hover:bg-scout-green-light"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting 
                      ? "Salvando..." 
                      : isEditing 
                        ? "Atualizar Item" 
                        : "Cadastrar Item"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CadastroItem;
