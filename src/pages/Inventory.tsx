import { useState, useMemo } from "react";
import { InventoryItem, TIPOS, RAMOS } from "@/types/inventory";
import Header from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Package, DollarSign } from "lucide-react";

// Dados de exemplo
const sampleData: InventoryItem[] = [
  {
    id: "1",
    nivel: "Nivel 1",
    tipo: "Distintivo de Progressão",
    descricao: "Distintivo de Progressão Lobinho - Pré-requisitos",
    quantidade: 25,
    valorUnitario: 12.50,
    valorTotal: 312.50,
    ramo: "Lobinho"
  },
  {
    id: "2", 
    nivel: "Não Tem",
    tipo: "Arganel",
    descricao: "Arganel Escoteiro do Mar",
    quantidade: 15,
    valorUnitario: 8.00,
    valorTotal: 120.00,
    ramo: "Escoteiro"
  },
  {
    id: "3",
    nivel: "Nivel 2",
    tipo: "Distintivo Especialidade",
    descricao: "Especialidade Acampamento",
    quantidade: 30,
    valorUnitario: 5.50,
    valorTotal: 165.00,
    ramo: "Todos"
  }
];

const Inventory = () => {
  const [items] = useState<InventoryItem[]>(sampleData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [filterRamo, setFilterRamo] = useState<string>("");

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo = !filterTipo || filterTipo === "all" || item.tipo === filterTipo;
      const matchesRamo = !filterRamo || filterRamo === "all" || item.ramo === filterRamo;
      
      return matchesSearch && matchesTipo && matchesRamo;
    });
  }, [items, searchTerm, filterTipo, filterRamo]);

  const statistics = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantidade, 0);
    const totalValue = items.reduce((sum, item) => sum + item.valorTotal, 0);
    const uniqueTypes = new Set(items.map(item => item.tipo)).size;
    
    return { totalItems, totalValue, uniqueTypes, totalProducts: items.length };
  }, [items]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getRamoColor = (ramo: string) => {
    const colors: Record<string, string> = {
      'Lobinho': 'bg-yellow-500 text-white',
      'Escoteiro': 'bg-green-500 text-white', 
      'Sênior': 'bg-red-500 text-white',
      'Pioneiro': 'bg-blue-500 text-white',
      'Jovens': 'bg-purple-500 text-white',
      'Escotista': 'bg-gray-500 text-white',
      'Todos': 'bg-scout-brown text-white'
    };
    return colors[ramo] || 'bg-gray-500 text-white';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-scout-green/10 to-scout-green-light/10 border-scout-green/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-scout-green">
                <Package className="w-4 h-4" />
                Total de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-scout-green">{statistics.totalProducts}</div>
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
              <div className="text-2xl font-bold text-blue-600">{statistics.totalItems}</div>
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
              <div className="text-2xl font-bold text-purple-600">{statistics.uniqueTypes}</div>
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
                <label className="text-sm font-medium">Buscar por descrição</label>
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
                    {TIPOS.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
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
                    {RAMOS.map(ramo => (
                      <SelectItem key={ramo} value={ramo}>{ramo}</SelectItem>
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
              Lista de Itens ({filteredItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map(item => (
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
                        <span className="text-sm">
                          {item.nivel}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRamoColor(item.ramo)} variant="secondary">
                          {item.ramo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {item.quantidade}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.valorUnitario)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-scout-green">
                        {formatCurrency(item.valorTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredItems.length === 0 && (
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