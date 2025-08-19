import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Database, Play, CheckCircle, AlertCircle } from "lucide-react";

const MongoDBSetup = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [setupResult, setSetupResult] = useState<any>(null);

  const runSetup = async () => {
    setIsRunning(true);
    setSetupResult(null);

    try {
      console.log('🚀 Executando setup do MongoDB Atlas...');
      
      const response = await fetch('https://wxtuhsfmhtyaebffmmdm.supabase.co/functions/v1/mongodb-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setSetupResult(result);

      if (result.success) {
        toast({
          title: "✅ Setup Concluído",
          description: "MongoDB Atlas configurado com sucesso!",
          className: "bg-green-500 text-white",
        });
      } else {
        toast({
          title: "❌ Erro no Setup",
          description: result.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no setup:', error);
      toast({
        title: "❌ Erro de Conexão",
        description: "Não foi possível executar o setup",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-green-600" />
            Configuração do MongoDB Atlas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Execute este setup para criar as collections e índices necessários no MongoDB Atlas.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Antes de executar:</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Certifique-se de que a connection string do MongoDB está configurada</li>
                  <li>• Verifique se o cluster MongoDB Atlas está ativo</li>
                  <li>• Confirme as permissões de IP whitelist (0.0.0.0/0 recomendado)</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            onClick={runSetup} 
            disabled={isRunning}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? "Executando Setup..." : "Executar Setup do MongoDB"}
          </Button>

          {setupResult && (
            <Card className={setupResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  {setupResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${setupResult.success ? "text-green-800" : "text-red-800"}`}>
                      {setupResult.success ? "Setup Concluído!" : "Erro no Setup"}
                    </h4>
                    
                    {setupResult.success ? (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-green-700">{setupResult.message}</p>
                        
                        {setupResult.collections && (
                          <div className="text-sm text-green-700">
                            <h5 className="font-medium">Collections criadas:</h5>
                            <ul className="mt-1 space-y-1">
                              <li>• inventory_items: {setupResult.collections.inventory_items?.count || 0} documentos</li>
                              <li>• item_requests: {setupResult.collections.item_requests?.count || 0} documentos</li>
                            </ul>
                          </div>
                        )}
                        
                        <p className="text-xs text-green-600">
                          Executado em: {new Date(setupResult.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-sm text-red-700">
                          {setupResult.error || "Erro desconhecido durante o setup"}
                        </p>
                        {setupResult.timestamp && (
                          <p className="text-xs text-red-600 mt-1">
                            Erro em: {new Date(setupResult.timestamp).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
              <span>Execute o setup acima para criar as collections</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
              <span>Teste as funcionalidades do inventário e solicitações</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
              <span>Migre dados antigos (se necessário) usando o script de migração</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default MongoDBSetup;