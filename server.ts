import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Client } from 'pg';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const pgClient = new Client({ connectionString: process.env.DATABASE_URL });

pgClient.connect();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('draw', async (data) => {
    await pgClient.query('INSERT INTO strokes (data) VALUES ($1)', [JSON.stringify(data)]);
    socket.broadcast.emit('draw', data);
  });

  socket.on('clear', async () => {
    await pgClient.query('DELETE FROM strokes');
    io.emit('clear');
  });
});

httpServer.listen(3000, () => {
  console.log('Server running on port 3000');
});