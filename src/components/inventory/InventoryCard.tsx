import { InventoryItem } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Hash, DollarSign } from "lucide-react";

interface InventoryCardProps {
  item: InventoryItem;
}

const InventoryCard = ({ item }: InventoryCardProps) => {
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
    <Card className="hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">{item.descricao}</CardTitle>
          <Badge className={getRamoColor(item.ramo)}>
            {item.ramo}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{item.tipo}</span>
          {item.nivel !== 'Não Tem' && (
            <>
              <span>•</span>
              <span>{item.nivel}</span>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hash className="w-4 h-4" />
            <span>Quantidade:</span>
          </div>
          <span className="font-semibold text-lg">{item.quantidade}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span>Valor Unitário:</span>
          </div>
          <span className="font-medium">{formatCurrency(item.valorUnitario)}</span>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>Valor Total:</span>
          </div>
          <span className="font-bold text-lg text-scout-green">
            {formatCurrency(item.valorTotal)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryCard;