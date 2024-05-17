const express = require('express');
const next = require('next');
const WebSocket = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(express.json());

  // API RESTful pour gérer les utilisateurs et leurs positions
  server.post('/api/position', (req, res) => {
    // Logique pour mettre à jour la position de l'utilisateur
    res.status(200).send('Position updated');
  });

  // WebSocket pour la communication en temps réel
  const wss = new WebSocket.Server({ noServer: true });
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      // Logique pour gérer les messages WebSocket
    });
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
});
