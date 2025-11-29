const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Configuration
const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store all connected clients
const clients = new Set();

/**
 * Get current timestamp in a readable format
 * @returns {string} Formatted timestamp
 */
function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Log message with timestamp
 * @param {string} message - Message to log
 */
function log(message) {
  console.log(`[${getTimestamp()}] ${message}`);
}

/**
 * Broadcast a message to all connected clients
 * @param {Object} data - Data to broadcast
 * @param {WebSocket} [excludeClient] - Optional client to exclude from broadcast
 */
function broadcast(data, excludeClient = null) {
  const message = JSON.stringify(data);
  let sentCount = 0;

  clients.forEach((client) => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        sentCount++;
      } catch (error) {
        log(`Error sending to client: ${error.message}`);
      }
    }
  });

  log(`Broadcasted to ${sentCount} client(s): ${message}`);
}

/**
 * Handle incoming commands from clients
 * @param {Object} data - Parsed command data
 * @param {WebSocket} ws - WebSocket client that sent the command
 */
function handleCommand(data, ws) {
  const { action } = data;

  // Validate command
  const validActions = ['pause', 'play', 'skip_forward', 'skip_backward'];

  if (!action) {
    log('Received message without action field');
    return;
  }

  if (!validActions.includes(action)) {
    log(`Unknown action received: ${action}`);
    return;
  }

  log(`Command received: ${action}`);

  // Broadcast the command to all other clients
  broadcast(data, ws);
}

// Express middleware
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    clients: clients.size,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint with info
app.get('/', (req, res) => {
  res.json({
    name: 'Phone Video Remote Backend',
    version: '1.0.0',
    description: 'WebSocket server for remote video control',
    websocket: 'ws://localhost:' + PORT,
    clients: clients.size
  });
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  log(`New client connected from ${clientIp} (Total clients: ${clients.size + 1})`);

  // Add client to set
  clients.add(ws);

  // Send welcome message
  try {
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to Phone Video Remote server',
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    log(`Error sending welcome message: ${error.message}`);
  }

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      log(`Message from ${clientIp}: ${message}`);
      handleCommand(data, ws);
    } catch (error) {
      log(`Error parsing message from ${clientIp}: ${error.message}`);
      try {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid JSON format'
        }));
      } catch (sendError) {
        log(`Error sending error message: ${sendError.message}`);
      }
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    clients.delete(ws);
    log(`Client disconnected from ${clientIp} (Total clients: ${clients.size})`);
  });

  // Handle errors
  ws.on('error', (error) => {
    log(`WebSocket error for ${clientIp}: ${error.message}`);
    clients.delete(ws);
  });
});

// Start the server
server.listen(PORT, () => {
  log(`Server started successfully`);
  log(`HTTP server: http://localhost:${PORT}`);
  log(`WebSocket server: ws://localhost:${PORT}`);
  log(`Waiting for connections...`);
});

// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

/**
 * Gracefully shutdown the server
 */
function shutdown() {
  log('Shutting down server...');

  // Close all WebSocket connections
  clients.forEach((client) => {
    try {
      client.close(1000, 'Server shutting down');
    } catch (error) {
      log(`Error closing client connection: ${error.message}`);
    }
  });

  // Close WebSocket server
  wss.close(() => {
    log('WebSocket server closed');
  });

  // Close HTTP server
  server.close(() => {
    log('HTTP server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    log('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`);
  log(error.stack);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection at ${promise}: ${reason}`);
  shutdown();
});
