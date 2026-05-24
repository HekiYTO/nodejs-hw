const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for logging HTTP requests
app.use(pinoHttp());

// CORS middleware
app.use(cors());

// JSON body parser middleware
app.use(express.json());

// GET /notes - retrieve all notes
app.get('/notes', (req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

// GET /notes/:noteId - retrieve a note by ID
app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;
  res.status(200).json({
    message: `Retrieved note with ID: ${noteId}`,
  });
});

// Test route for error handling
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

// Middleware for handling non-existent routes (404)
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
