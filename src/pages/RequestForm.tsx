import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, Ramo } from '@/types/inventory';
import { Package, Plus, Minus, ShoppingCart } from 'lucide-react';

interface SelectedItem {
  id: string;
  descricao: string;
  quantidade: number;
  disponivel: number;
}

export default function RequestForm() {
  const [formData, setFormData] = useState({
    nome: '',
    grupo_escoteiro: '',
    email: '',
    telefone: '',
    mensagem_adicional: ''
  });
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAvailableItems();
  }, []);

  const loadAvailableItems = async () => {
    try {
      setLoadingItems(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .gt('quantidade', 0) // Apenas itens com estoque disponível
        .order('descricao');

      if (error) throw error;

      const formattedItems: InventoryItem[] = data.map((item) => ({
        id: item.id,
        nivel: item.nivel,
        tipo: item.tipo,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valor_unitario,
        valorTotal: item.valor_total,
        ramo: item.ramo as Ramo,
      }));

      setAvailableItems(formattedItems);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar itens",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingItems(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemSelect = (item: InventoryItem, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, {
        id: item.id,
        descricao: item.descricao,
        quantidade: 1,
        disponivel: item.quantidade
      }]);
    } else {
      setSelectedItems(prev => prev.filter(selected => selected.id !== item.id));
    }
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantidade: Math.max(1, Math.min(newQuantity, item.disponivel)) }
          : item
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: "Por favor, selecione pelo menos um item para solicitar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Criar uma solicitação para cada item selecionado
      const requests = selectedItems.map(item => ({
        nome: formData.nome,
        grupo_escoteiro: formData.grupo_escoteiro,
        email: formData.email,
        telefone: formData.telefone,
        item_solicitado: item.descricao,
        quantidade: item.quantidade,
        mensagem_adicional: formData.mensagem_adicional
      }));

      const { error } = await supabase
        .from('item_requests')
        .insert(requests);

      if (error) throw error;

      toast({
        title: "Solicitações enviadas com sucesso!",
        description: `${selectedItems.length} item(ns) solicitado(s). Suas solicitações serão analisadas.`,
      });

      // Reset form
      setFormData({
        nome: '',
        grupo_escoteiro: '',
        email: '',
        telefone: '',
        mensagem_adicional: ''
      });
      setSelectedItems([]);
    } catch (error: any) {
      toast({
        title: "Erro ao enviar solicitações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-scout-green" />
            Solicitar Itens do Estoque
          </h1>
          <p className="text-muted-foreground mt-2">
            Selecione os itens que deseja solicitar e preencha seus dados de contato
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Itens Disponíveis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Itens Disponíveis ({availableItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingItems ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-green mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando itens...</p>
                </div>
              ) : availableItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum item disponível no momento</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableItems.map((item) => {
                    const isSelected = selectedItems.some(selected => selected.id === item.id);
                    const selectedItem = selectedItems.find(selected => selected.id === item.id);
                    
                    return (
                      <div key={item.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleItemSelect(item, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-sm">{item.descricao}</h4>
                              <Badge className={getRamoColor(item.ramo)} variant="outline">
                                {item.ramo}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{item.tipo}</span>
                              <span>•</span>
                              <span>{item.nivel}</span>
                              <span>•</span>
                              <span className="font-medium text-scout-green">
                                {item.quantidade} disponível
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {isSelected && selectedItem && (
                          <div className="flex items-center gap-2 ml-6">
                            <span className="text-sm text-muted-foreground">Quantidade:</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateItemQuantity(item.id, selectedItem.quantidade - 1)}
                              disabled={selectedItem.quantidade <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {selectedItem.quantidade}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateItemQuantity(item.id, selectedItem.quantidade + 1)}
                              disabled={selectedItem.quantidade >= item.quantidade}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulário de Dados */}
          <Card>
            <CardHeader>
              <CardTitle>Seus Dados de Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome *</label>
                    <Input
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Grupo Escoteiro *</label>
                    <Input
                      name="grupo_escoteiro"
                      value={formData.grupo_escoteiro}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">E-mail *</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefone *</label>
                    <Input
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Mensagem Adicional</label>
                  <Textarea
                    name="mensagem_adicional"
                    value={formData.mensagem_adicional}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Informações adicionais sobre a solicitação..."
                  />
                </div>

                {/* Resumo dos Itens Selecionados */}
                {selectedItems.length > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-medium mb-3">Itens Selecionados ({selectedItems.length})</h4>
                    <div className="space-y-2">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="truncate">{item.descricao}</span>
                          <span className="font-medium ml-2">
                            {item.quantidade}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || selectedItems.length === 0}
                >
                  {isLoading ? 'Enviando...' : `Enviar Solicitação${selectedItems.length > 1 ? 'ões' : ''} (${selectedItems.length})`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}