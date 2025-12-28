const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Mock API endpoints для разработки
app.get('/api/servers', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Test Server',
      description: 'Test server for development',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
});

app.post('/api/servers', (req, res) => {
  const newServer = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  res.status(201).json(newServer);
});

app.get('/api/servers/:id', (req, res) => {
  res.json({
    id: parseInt(req.params.id),
    name: 'Test Server',
    description: 'Test server for development',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

app.put('/api/servers/:id', (req, res) => {
  res.json({
    id: parseInt(req.params.id),
    ...req.body,
    updatedAt: new Date().toISOString()
  });
});

app.delete('/api/servers/:id', (req, res) => {
  res.status(204).send();
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


