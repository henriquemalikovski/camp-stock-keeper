// Script para migrar dados do Supabase para MongoDB Atlas
// Execute este script após configurar a conexão do MongoDB

import { supabase } from '@/integrations/supabase/client';
import { mongoDBService } from '@/lib/mongodb';
import type { InventoryItem } from '@/types/inventory';

interface SupabaseInventoryItem {
  id: string;
  nivel: string;
  tipo: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  ramo: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseItemRequest {
  id: string;
  nome: string;
  grupo_escoteiro: string;
  email: string;
  telefone: string;
  item_solicitado: string;
  quantidade: number;
  mensagem_adicional: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

class MigrationService {
  async migrateInventoryItems() {
    console.log('🔄 Iniciando migração dos itens do inventário...');
    
    try {
      // Buscar todos os itens do Supabase
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*');

      if (error) {
        throw new Error(`Erro ao buscar itens do Supabase: ${error.message}`);
      }

      console.log(`📦 Encontrados ${data?.length || 0} itens para migrar`);

      if (!data || data.length === 0) {
        console.log('✅ Nenhum item encontrado para migrar');
        return;
      }

      // Converter dados do Supabase para o formato do MongoDB
      const convertedItems: Omit<InventoryItem, 'id'>[] = data.map((item: SupabaseInventoryItem) => ({
        nivel: item.nivel as any,
        tipo: item.tipo as any,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valor_unitario,
        valorTotal: item.valor_total,
        ramo: item.ramo as any,
      }));

      // Migrar cada item
      let migrated = 0;
      for (const item of convertedItems) {
        try {
          await mongoDBService.createInventoryItem(item);
          migrated++;
          console.log(`✅ Item migrado: ${item.descricao}`);
        } catch (error) {
          console.error(`❌ Erro ao migrar item ${item.descricao}:`, error);
        }
      }

      console.log(`🎉 Migração dos itens concluída: ${migrated}/${data.length} itens migrados`);
    } catch (error) {
      console.error('❌ Erro na migração dos itens:', error);
      throw error;
    }
  }

  async migrateItemRequests() {
    console.log('🔄 Iniciando migração das solicitações...');
    
    try {
      // Buscar todas as solicitações do Supabase
      const { data, error } = await supabase
        .from('item_requests')
        .select('*');

      if (error) {
        throw new Error(`Erro ao buscar solicitações do Supabase: ${error.message}`);
      }

      console.log(`📋 Encontradas ${data?.length || 0} solicitações para migrar`);

      if (!data || data.length === 0) {
        console.log('✅ Nenhuma solicitação encontrada para migrar');
        return;
      }

      // Migrar cada solicitação
      let migrated = 0;
      for (const request of data as SupabaseItemRequest[]) {
        try {
          await mongoDBService.createItemRequest({
            nome: request.nome,
            email: request.email,
            telefone: request.telefone,
            grupo_escoteiro: request.grupo_escoteiro,
            item_solicitado: request.item_solicitado,
            quantidade: request.quantidade,
            mensagem_adicional: request.mensagem_adicional,
          });
          migrated++;
          console.log(`✅ Solicitação migrada: ${request.nome} - ${request.item_solicitado}`);
        } catch (error) {
          console.error(`❌ Erro ao migrar solicitação de ${request.nome}:`, error);
        }
      }

      console.log(`🎉 Migração das solicitações concluída: ${migrated}/${data.length} solicitações migradas`);
    } catch (error) {
      console.error('❌ Erro na migração das solicitações:', error);
      throw error;
    }
  }

  async runFullMigration() {
    console.log('🚀 Iniciando migração completa do Supabase para MongoDB Atlas...');
    console.log('⚠️ Certifique-se de que a connection string do MongoDB está configurada!');
    
    try {
      await this.migrateInventoryItems();
      await this.migrateItemRequests();
      
      console.log('🎊 Migração completa finalizada com sucesso!');
      console.log('💡 Agora você pode atualizar seu app para usar apenas o MongoDB');
    } catch (error) {
      console.error('💥 Erro durante a migração:', error);
      throw error;
    }
  }
}

export const migrationService = new MigrationService();

// Para executar a migração, descomente a linha abaixo e execute o script
// migrationService.runFullMigration();