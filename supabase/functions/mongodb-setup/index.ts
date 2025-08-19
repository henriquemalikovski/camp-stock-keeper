import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient, ObjectId } from "npm:mongodb@6.3.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

let client: MongoClient | null = null;

async function getMongoClient() {
  if (!client) {
    const connectionString = Deno.env.get('MONGODB_CONNECTION_STRING');
    if (!connectionString) {
      throw new Error('MONGODB_CONNECTION_STRING not found');
    }
    client = new MongoClient(connectionString);
    await client.connect();
  }
  return client;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando configuração do MongoDB Atlas...');
    
    const mongoClient = await getMongoClient();
    const db = mongoClient.db('scout_inventory');
    
    // Verificar conexão
    await db.admin().ping();
    console.log('✅ Conexão com MongoDB estabelecida');
    
    // 1. Criar collection de inventory_items
    console.log('📦 Configurando collection inventory_items...');
    
    try {
      await db.createCollection('inventory_items');
      console.log('✅ Collection inventory_items criada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Collection inventory_items já existe');
      } else {
        throw error;
      }
    }
    
    // Criar índices para inventory_items
    const inventoryCollection = db.collection('inventory_items');
    
    // Índice para busca por descrição
    await inventoryCollection.createIndex({ descricao: "text" });
    console.log('✅ Índice de texto criado para descrição');
    
    // Índice para filtros
    await inventoryCollection.createIndex({ tipo: 1 });
    await inventoryCollection.createIndex({ ramo: 1 });
    await inventoryCollection.createIndex({ nivel: 1 });
    console.log('✅ Índices de filtros criados');
    
    // Índice para ordenação por data
    await inventoryCollection.createIndex({ createdAt: -1 });
    console.log('✅ Índice de data criado');
    
    // 2. Criar collection de item_requests
    console.log('📋 Configurando collection item_requests...');
    
    try {
      await db.createCollection('item_requests');
      console.log('✅ Collection item_requests criada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Collection item_requests já existe');
      } else {
        throw error;
      }
    }
    
    // Criar índices para item_requests
    const requestsCollection = db.collection('item_requests');
    
    // Índice para filtro por status
    await requestsCollection.createIndex({ status: 1 });
    console.log('✅ Índice de status criado');
    
    // Índice para ordenação por data
    await requestsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Índice de data de solicitação criado');
    
    // Índice para busca por email
    await requestsCollection.createIndex({ email: 1 });
    console.log('✅ Índice de email criado');
    
    // 3. Inserir dados de exemplo (apenas se collections estiverem vazias)
    const inventoryCount = await inventoryCollection.countDocuments();
    const requestsCount = await requestsCollection.countDocuments();
    
    if (inventoryCount === 0) {
      console.log('📝 Inserindo dados de exemplo para inventory_items...');
      
      const sampleItems = [
        {
          nivel: "Nivel 1",
          tipo: "Distintivo de Especialidade",
          descricao: "Distintivo de Especialidade - Acampamento",
          quantidade: 50,
          valorUnitario: 1.40,
          valorTotal: 70.00,
          ramo: "Escoteiro",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nivel: "Não Tem",
          tipo: "Arganel",
          descricao: "Arganel de Grupo - GE Arés 193",
          quantidade: 25,
          valorUnitario: 4.00,
          valorTotal: 100.00,
          ramo: "Todos",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nivel: "Nivel 2",
          tipo: "Distintivo de Progressão",
          descricao: "Distintivo de Progressão - Escoteiro",
          quantidade: 30,
          valorUnitario: 3.90,
          valorTotal: 117.00,
          ramo: "Escoteiro",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nivel: "Não Tem",
          tipo: "Cordão",
          descricao: "Cordão de Apito - Padrão",
          quantidade: 15,
          valorUnitario: 2.50,
          valorTotal: 37.50,
          ramo: "Escotista",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nivel: "Não Tem",
          tipo: "Certificado",
          descricao: "Certificado de Participação - Acampamento",
          quantidade: 100,
          valorUnitario: 2.00,
          valorTotal: 200.00,
          ramo: "Todos",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await inventoryCollection.insertMany(sampleItems);
      console.log(`✅ ${sampleItems.length} itens de exemplo inseridos`);
    } else {
      console.log(`ℹ️ Collection inventory_items já possui ${inventoryCount} itens`);
    }
    
    if (requestsCount === 0) {
      console.log('📝 Inserindo dados de exemplo para item_requests...');
      
      const sampleRequests = [
        {
          nome: "João Silva",
          email: "joao.silva@email.com",
          telefone: "(11) 99999-9999",
          grupoEscoteiro: "GE Arés 193",
          itemSolicitado: "Distintivo de Especialidade - Acampamento",
          quantidade: 2,
          mensagemAdicional: "Preciso urgente para a cerimônia desta semana",
          status: "pendente",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nome: "Maria Santos",
          email: "maria.santos@email.com",
          telefone: "(11) 88888-8888",
          grupoEscoteiro: "GE Arés 193",
          itemSolicitado: "Arganel de Grupo - GE Arés 193",
          quantidade: 1,
          mensagemAdicional: null,
          status: "resolvida",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
          updatedAt: new Date()
        }
      ];
      
      await requestsCollection.insertMany(sampleRequests);
      console.log(`✅ ${sampleRequests.length} solicitações de exemplo inseridas`);
    } else {
      console.log(`ℹ️ Collection item_requests já possui ${requestsCount} solicitações`);
    }
    
    // 4. Verificar status final
    const finalInventoryCount = await inventoryCollection.countDocuments();
    const finalRequestsCount = await requestsCollection.countDocuments();
    
    const result = {
      success: true,
      message: 'MongoDB Atlas configurado com sucesso!',
      database: 'scout_inventory',
      collections: {
        inventory_items: {
          count: finalInventoryCount,
          indexes: await inventoryCollection.indexes()
        },
        item_requests: {
          count: finalRequestsCount,
          indexes: await requestsCollection.indexes()
        }
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('🎉 Configuração completa!');
    console.log(`📦 inventory_items: ${finalInventoryCount} documentos`);
    console.log(`📋 item_requests: ${finalRequestsCount} documentos`);
    
    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
    
    const errorResult = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorResult, null, 2), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});