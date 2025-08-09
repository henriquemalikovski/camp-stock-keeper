import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Package } from "lucide-react";

const SolicitarItem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    grupoEscoteiro: "",
    email: "",
    telefone: "",
    itemSolicitado: "",
    quantidade: "",
    mensagemAdicional: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const requiredFields = [
        'nome', 'grupoEscoteiro', 'email', 'telefone', 
        'itemSolicitado', 'quantidade'
      ];
      
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

      const quantidade = parseInt(formData.quantidade);
      if (quantidade <= 0) {
        toast({
          title: "Erro de Validação",
          description: "A quantidade deve ser maior que zero.",
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

      const requestData = {
        nome: formData.nome,
        grupo_escoteiro: formData.grupoEscoteiro,
        email: formData.email,
        telefone: formData.telefone,
        item_solicitado: formData.itemSolicitado,
        quantidade,
        mensagem_adicional: formData.mensagemAdicional || null,
      };

      const { error } = await supabase
        .from("item_requests")
        .insert([requestData]);

      if (error) {
        console.error("Erro ao salvar solicitação:", error);
        toast({
          title: "Erro ao Enviar",
          description: "Ocorreu um erro ao enviar sua solicitação: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Solicitação Enviada",
        description: "Sua solicitação foi enviada com sucesso! Entraremos em contato em breve.",
        className: "bg-scout-green text-white",
      });

      // Limpar formulário
      setFormData({
        nome: "",
        grupoEscoteiro: "",
        email: "",
        telefone: "",
        itemSolicitado: "",
        quantidade: "",
        mensagemAdicional: "",
      });
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
                Solicitar Item
              </h1>
              <p className="text-muted-foreground">
                Preencha o formulário abaixo para solicitar um item do estoque
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Formulário de Solicitação</CardTitle>
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
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grupoEscoteiro">Grupo Escoteiro *</Label>
                    <Input
                      id="grupoEscoteiro"
                      placeholder="Digite o nome do seu grupo"
                      value={formData.grupoEscoteiro}
                      onChange={(e) => handleInputChange("grupoEscoteiro", e.target.value)}
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
                      onChange={(e) => handleInputChange("email", e.target.value)}
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
                      onChange={(e) => handleInputChange("telefone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemSolicitado">Item Solicitado *</Label>
                    <Input
                      id="itemSolicitado"
                      placeholder="Digite o item que deseja solicitar"
                      value={formData.itemSolicitado}
                      onChange={(e) => handleInputChange("itemSolicitado", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      placeholder="0"
                      value={formData.quantidade}
                      onChange={(e) => handleInputChange("quantidade", e.target.value)}
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
                    onChange={(e) => handleInputChange("mensagemAdicional", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-scout-green hover:bg-scout-green-light"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SolicitarItem;