import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.static('public'));
app.use(express.json());

// Adicionar uma nova mensagem
app.post('/addMessage', async (req, res) => {
  const { message, author } = req.body;
  const currentDate = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('mensagens')
    .insert([{ mensagem: message, autor: author, data: currentDate }]);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  io.emit('newMessage', data[0]);
  res.status(201).json(data[0]);
});

// Buscar todas as mensagens
app.get('/fetchMessages', async (req, res) => {
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .order('data', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json(data);
});

// Buscar a mensagem do dia
app.get('/fetchMessageOfTheDay', async (req, res) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .order('data', { ascending: false })
    .limit(1);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (data.length === 0) {
    return res.status(404).json({ error: 'No message found for today' });
  }

  res.status(200).json(data[0]);
});

// Atualizar uma mensagem
app.put('/updateMessage/:id', async (req, res) => {
  const { id } = req.params;
  const { message, author } = req.body;
  const { data, error } = await supabase
    .from('mensagens')
    .update({ mensagem: message, autor: author })
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  io.emit('updateMessage', data[0]);
  res.status(200).json(data[0]);
});

// Apagar uma mensagem
app.delete('/deleteMessage/:id', async (req, res) => {
  const { id } = req.params;

  // Deletar a mensagem
  const { error } = await supabase
    .from('mensagens')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Buscar a mensagem anterior (a mais recente após a mensagem deletada)
  const { data, error: fetchError } = await supabase
    .from('mensagens')
    .select('*')
    .order('data', { ascending: false })
    .limit(1);

  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }

  io.emit('deleteMessage', data[0] || null);
  res.status(200).json(data[0] || null);
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
