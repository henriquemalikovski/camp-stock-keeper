import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient, ObjectId } from "npm:mongodb@6.3.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InventoryItem {
  _id?: string;
  nivel: string;
  tipo: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  ramo: string;
  createdAt?: Date;
  updatedAt?: Date;
}

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
    const mongoClient = await getMongoClient();
    const db = mongoClient.db('scout_inventory');
    const collection = db.collection('inventory_items');

    const url = new URL(req.url);
    const method = req.method;
    
    // GET - Listar todos os itens
    if (method === 'GET') {
      console.log('Fetching inventory items from MongoDB');
      const items = await collection.find({}).toArray();
      
      // Converter _id para id para compatibilidade
      const formattedItems = items.map(item => ({
        id: item._id.toString(),
        nivel: item.nivel,
        tipo: item.tipo,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorTotal: item.valorTotal,
        ramo: item.ramo,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      }));

      return new Response(JSON.stringify(formattedItems), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Criar novo item
    if (method === 'POST') {
      const body = await req.json();
      console.log('Creating new inventory item:', body);
      
      const newItem: InventoryItem = {
        nivel: body.nivel,
        tipo: body.tipo,
        descricao: body.descricao,
        quantidade: body.quantidade,
        valorUnitario: body.valorUnitario,
        valorTotal: body.valorTotal,
        ramo: body.ramo,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newItem);
      
      const createdItem = {
        id: result.insertedId.toString(),
        ...newItem
      };

      return new Response(JSON.stringify(createdItem), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT - Atualizar item
    if (method === 'PUT') {
      const body = await req.json();
      const itemId = url.searchParams.get('id');
      
      if (!itemId) {
        return new Response(JSON.stringify({ error: 'ID é obrigatório' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Updating inventory item:', itemId, body);
      
      const updateData = {
        nivel: body.nivel,
        tipo: body.tipo,
        descricao: body.descricao,
        quantidade: body.quantidade,
        valorUnitario: body.valorUnitario,
        valorTotal: body.valorTotal,
        ramo: body.ramo,
        updatedAt: new Date()
      };

      const result = await collection.updateOne(
        { _id: new ObjectId(itemId) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return new Response(JSON.stringify({ error: 'Item não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ id: itemId, ...updateData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE - Deletar item
    if (method === 'DELETE') {
      const itemId = url.searchParams.get('id');
      
      if (!itemId) {
        return new Response(JSON.stringify({ error: 'ID é obrigatório' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Deleting inventory item:', itemId);
      
      const result = await collection.deleteOne({
        _id: new ObjectId(itemId)
      });

      if (result.deletedCount === 0) {
        return new Response(JSON.stringify({ error: 'Item não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função MongoDB inventory:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});