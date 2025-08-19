import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient, ObjectId } from "npm:mongodb@6.3.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ItemRequest {
  _id?: string;
  nome: string;
  email: string;
  telefone: string;
  grupoEscoteiro: string;
  itemSolicitado: string;
  quantidade: number;
  mensagemAdicional?: string;
  status: string;
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
    const collection = db.collection('item_requests');

    const url = new URL(req.url);
    const method = req.method;
    
    // GET - Listar todas as solicitações
    if (method === 'GET') {
      console.log('Fetching item requests from MongoDB');
      const requests = await collection.find({}).sort({ createdAt: -1 }).toArray();
      
      // Converter _id para id para compatibilidade
      const formattedRequests = requests.map(request => ({
        id: request._id.toString(),
        nome: request.nome,
        email: request.email,
        telefone: request.telefone,
        grupo_escoteiro: request.grupoEscoteiro,
        item_solicitado: request.itemSolicitado,
        quantidade: request.quantidade,
        mensagem_adicional: request.mensagemAdicional,
        status: request.status,
        created_at: request.createdAt,
        updated_at: request.updatedAt
      }));

      return new Response(JSON.stringify(formattedRequests), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Criar nova solicitação
    if (method === 'POST') {
      const body = await req.json();
      console.log('Creating new item request:', body);
      
      const newRequest: ItemRequest = {
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        grupoEscoteiro: body.grupo_escoteiro,
        itemSolicitado: body.item_solicitado,
        quantidade: body.quantidade,
        mensagemAdicional: body.mensagem_adicional,
        status: 'pendente',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newRequest);
      
      const createdRequest = {
        id: result.insertedId.toString(),
        ...newRequest
      };

      return new Response(JSON.stringify(createdRequest), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT - Atualizar status da solicitação
    if (method === 'PUT') {
      const body = await req.json();
      const requestId = url.searchParams.get('id');
      
      if (!requestId) {
        return new Response(JSON.stringify({ error: 'ID é obrigatório' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Updating item request:', requestId, body);
      
      const updateData = {
        status: body.status,
        updatedAt: new Date()
      };

      const result = await collection.updateOne(
        { _id: new ObjectId(requestId) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return new Response(JSON.stringify({ error: 'Solicitação não encontrada' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ id: requestId, ...updateData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função MongoDB requests:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});