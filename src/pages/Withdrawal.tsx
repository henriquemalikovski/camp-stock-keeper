import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Package, Send } from 'lucide-react';

interface InventoryItem {
  id: string;
  descricao: string;
  tipo: string;
  nivel: string;
  ramo: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

interface Withdrawal {
  id: string;
  quantity: number;
  status: string;
  notes: string;
  created_at: string;
  inventory_items: InventoryItem;
}

const Withdrawal = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchItems();
    fetchWithdrawals();
  }, [user, navigate]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .gt('quantidade', 0)
        .order('descricao');

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar itens: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      let query = supabase
        .from('material_withdrawals')
        .select(`
          *,
          inventory_items (*)
        `)
        .order('created_at', { ascending: false });

      // If not admin, only show user's own withdrawals
      if (profile?.role !== 'admin') {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar retiradas: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleWithdrawal = async () => {
    if (!selectedItem || !user) return;
    
    if (quantity > selectedItem.quantidade) {
      toast({
        title: "Erro",
        description: "Quantidade solicitada maior que disponível no estoque.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create withdrawal request
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('material_withdrawals')
        .insert({
          item_id: selectedItem.id,
          user_id: user.id,
          quantity: quantity,
          notes: notes,
        })
        .select(`
          *,
          inventory_items (*)
        `)
        .single();

      if (withdrawalError) throw withdrawalError;

      // Send email notification
      const emailHtml = `
        <h2>Nova Solicitação de Retirada de Material</h2>
        <p><strong>Solicitante:</strong> ${profile?.full_name} (${profile?.email})</p>
        <p><strong>Item:</strong> ${selectedItem.descricao}</p>
        <p><strong>Tipo:</strong> ${selectedItem.tipo}</p>
        <p><strong>Nível:</strong> ${selectedItem.nivel}</p>
        <p><strong>Ramo:</strong> ${selectedItem.ramo}</p>
        <p><strong>Quantidade solicitada:</strong> ${quantity}</p>
        <p><strong>Quantidade disponível:</strong> ${selectedItem.quantidade}</p>
        <p><strong>Valor unitário:</strong> R$ ${selectedItem.valor_unitario.toFixed(2)}</p>
        <p><strong>Valor total:</strong> R$ ${(selectedItem.valor_unitario * quantity).toFixed(2)}</p>
        ${notes ? `<p><strong>Observações:</strong> ${notes}</p>` : ''}
        <p><strong>Data da solicitação:</strong> ${new Date().toLocaleString('pt-BR')}</p>
      `;

      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'henrique.malikovski@escoteiros.org.br',
          subject: `Nova Solicitação de Retirada - ${selectedItem.descricao}`,
          html: emailHtml,
          item: selectedItem,
          quantity: quantity,
          user: profile,
        },
      });

      if (emailError) {
        console.error('Email error:', emailError);
        toast({
          title: "Solicitação criada",
          description: "Solicitação criada, mas houve erro no envio do email.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Solicitação enviada",
          description: "Sua solicitação foi enviada com sucesso!",
        });
      }

      // Reset form
      setSelectedItem(null);
      setQuantity(1);
      setNotes('');
      setDialogOpen(false);
      
      // Refresh data
      fetchWithdrawals();

    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao criar solicitação: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'solicitado':
        return <Badge variant="secondary">Solicitado</Badge>;
      case 'aprovado':
        return <Badge variant="default">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Retirada de Material</h1>
            <p className="text-muted-foreground">Solicite retirada de itens do estoque</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Available Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Itens Disponíveis
              </CardTitle>
              <CardDescription>
                Selecione um item para solicitar retirada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => {
                      setSelectedItem(item);
                      setDialogOpen(true);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.descricao}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.tipo} - {item.nivel} - {item.ramo}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Qtd: {item.quantidade}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.valor_unitario.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* My Withdrawals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {profile?.role === 'admin' ? 'Todas as Solicitações' : 'Minhas Solicitações'}
              </CardTitle>
              <CardDescription>
                Histórico de solicitações de retirada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{withdrawal.inventory_items.descricao}</h4>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {withdrawal.quantity}
                    </p>
                    {withdrawal.notes && (
                      <p className="text-sm text-muted-foreground">
                        Obs: {withdrawal.notes}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(withdrawal.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
                {withdrawals.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma solicitação encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Retirada</DialogTitle>
              <DialogDescription>
                Informe a quantidade e observações para a retirada
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div className="p-3 bg-accent rounded-lg">
                  <h4 className="font-medium">{selectedItem.descricao}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.tipo} - {selectedItem.nivel} - {selectedItem.ramo}
                  </p>
                  <p className="text-sm">
                    Disponível: {selectedItem.quantidade} | Valor: R$ {selectedItem.valor_unitario.toFixed(2)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedItem.quantidade}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informe o motivo da retirada, finalidade, etc."
                  />
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Valor total:</strong> R$ {(selectedItem.valor_unitario * quantity).toFixed(2)}
                  </p>
                </div>
                
                <Button onClick={handleWithdrawal} disabled={submitting} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Enviando...' : 'Solicitar Retirada'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Withdrawal;