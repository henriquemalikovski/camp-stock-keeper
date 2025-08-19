# 🔄 Migração do Supabase para MongoDB Atlas

Este projeto foi migrado para usar **MongoDB Atlas** em vez do Supabase, mantendo a funcionalidade existente através de Edge Functions.

## 📋 Passos da Migração

### 1. Configuração do MongoDB Atlas

1. **Criar conta no MongoDB Atlas** (gratuito)
2. **Criar um cluster** 
3. **Configurar IP whitelist** (permita 0.0.0.0/0 para acesso global)
4. **Criar usuário e senha** para o banco
5. **Obter connection string** no formato:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/scout_inventory
   ```

### 2. Configurar Connection String no Lovable

Já foi configurado um secret `MONGODB_CONNECTION_STRING` no projeto. 

**IMPORTANTE**: Configure a connection string do seu MongoDB Atlas no secret através do botão que apareceu no chat.

### 3. Estrutura do MongoDB

O sistema criará automaticamente as seguintes collections:
- `inventory_items` - Itens do inventário 
- `item_requests` - Solicitações de itens

### 4. Edge Functions Criadas

- **mongodb-inventory**: Gerencia operações CRUD dos itens
- **mongodb-requests**: Gerencia solicitações de itens

### 5. Como Migrar os Dados (Opcional)

Se você tinha dados no Supabase, pode usar o script de migração:

```typescript
import { migrationService } from '@/scripts/migrate-to-mongodb';

// Execute no console do navegador:
migrationService.runFullMigration();
```

## 🔧 Funcionalidades Migradas

### ✅ Inventário
- ✅ Listar itens
- ✅ Criar novos itens
- ✅ Editar itens existentes
- ✅ Deletar itens
- ✅ Filtros e busca

### ✅ Solicitações
- ✅ Criar solicitações
- ✅ Listar solicitações (admin)
- ✅ Atualizar status das solicitações
- ✅ Filtros por status

### ✅ Autenticação
- ✅ Mantida via Supabase Auth (apenas para login)
- ✅ Controle de acesso admin

## 🏗️ Arquitetura Atual

```
Frontend (React) 
    ↓
MongoDB Service (TypeScript)
    ↓
Supabase Edge Functions
    ↓
MongoDB Atlas (Banco de Dados)
```

## 🔐 Segurança

- **Connection String**: Armazenada como secret seguro no Supabase
- **Edge Functions**: Públicas para permitir acesso sem auth (RLS removido)
- **Validação**: Mantida no frontend e Edge Functions
- **CORS**: Configurado para acesso web

## 🚀 Benefícios da Migração

1. **Sem limitação de projetos** do Supabase free
2. **MongoDB Atlas free tier** generoso (512MB)
3. **Flexibilidade**: Esquema dinâmico do MongoDB
4. **Escalabilidade**: Fácil upgrade para plans pagos
5. **Performance**: Queries otimizadas para documentos

## 🔧 Manutenção

### Verificar Logs das Edge Functions
1. Acesse o Supabase Dashboard
2. Vá em Functions → Logs
3. Monitore erros de conexão ou operações

### Backup
- **MongoDB Atlas**: Backup automático habilitado
- **Restore**: Através do painel do Atlas

### Monitoramento
- Use o MongoDB Atlas dashboard para monitorar performance
- Logs das Edge Functions no Supabase para debug

## 🆘 Troubleshooting

### Erro de Conexão
1. Verificar se connection string está correta
2. Confirmar IP whitelist (0.0.0.0/0)
3. Validar usuário/senha do MongoDB

### Edge Function Timeout
- MongoDB Atlas free pode ter latência
- Considere upgrade se necessário

### Dados não aparecem
1. Verificar logs das Edge Functions
2. Testar connection string separadamente
3. Confirmar que collections foram criadas

## 📞 Suporte

Em caso de problemas:
1. Verificar logs no Supabase Functions
2. Testar MongoDB connection diretamente
3. Revisar configurações de rede do Atlas