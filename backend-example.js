// Exemplo de backend simples com Express + MongoDB
// Para usar: npm install express mongodb cors dotenv

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URL = process.env.MONGODB_CONNECTION_STRING;
let db;

// Conectar ao MongoDB
MongoClient.connect(MONGODB_URL)
  .then(client => {
    console.log('Conectado ao MongoDB');
    db = client.db('scout_inventory');
  })
  .catch(err => console.error('Erro ao conectar:', err));

// Rotas do Inventário
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await db.collection('inventory_items').find({}).toArray();
    res.json(items.map(item => ({ ...item, id: item._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const result = await db.collection('inventory_items').insertOne({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const item = await db.collection('inventory_items').findOne({ _id: result.insertedId });
    res.json({ ...item, id: item._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    await db.collection('inventory_items').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    const item = await db.collection('inventory_items').findOne({ _id: new ObjectId(req.params.id) });
    res.json({ ...item, id: item._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await db.collection('inventory_items').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas de Solicitações
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await db.collection('item_requests').find({}).toArray();
    res.json(requests.map(req => ({ ...req, id: req._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const result = await db.collection('item_requests').insertOne({
      ...req.body,
      status: 'pendente',
      created_at: new Date(),
      updated_at: new Date()
    });
    const request = await db.collection('item_requests').findOne({ _id: result.insertedId });
    res.json({ ...request, id: request._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/requests/:id', async (req, res) => {
  try {
    await db.collection('item_requests').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updated_at: new Date() } }
    );
    const request = await db.collection('item_requests').findOne({ _id: new ObjectId(req.params.id) });
    res.json({ ...request, id: request._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});