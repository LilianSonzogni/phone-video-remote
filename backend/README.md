# Phone Video Remote - Backend Server

WebSocket server that acts as a communication hub between the mobile app and browser extension.

## Features

- **WebSocket Server**: Real-time bidirectional communication
- **HTTP API**: Health checks and server information endpoints
- **Connection Management**: Tracks all connected clients
- **Command Broadcasting**: Distributes commands to all connected clients
- **Detailed Logging**: Timestamped logs for all connections and messages
- **Graceful Shutdown**: Proper cleanup of connections on shutdown
- **Error Handling**: Robust error handling for production use

## Prerequisites

- Node.js 14.0.0 or higher
- npm (comes with Node.js)

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Starting the Server

```bash
npm start
```

The server will start on port 8080 by default. You should see output like:

```
[2024-01-15 10:30:00] Server started successfully
[2024-01-15 10:30:00] HTTP server: http://localhost:8080
[2024-01-15 10:30:00] WebSocket server: ws://localhost:8080
[2024-01-15 10:30:00] Waiting for connections...
```

### Custom Port

You can specify a custom port using the `PORT` environment variable:

```bash
PORT=3000 npm start
```

## API Endpoints

### HTTP Endpoints

#### `GET /`
Returns server information and status.

**Response:**
```json
{
  "name": "Phone Video Remote Backend",
  "version": "1.0.0",
  "description": "WebSocket server for remote video control",
  "websocket": "ws://localhost:8080",
  "clients": 2
}
```

#### `GET /health`
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "ok",
  "uptime": 3600,
  "clients": 2,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### WebSocket Protocol

#### Connection
Connect to `ws://localhost:8080`

Upon connection, you'll receive a welcome message:
```json
{
  "type": "welcome",
  "message": "Connected to Phone Video Remote server",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Supported Commands

All commands should be sent as JSON objects with an `action` field.

**Play:**
```json
{
  "action": "play"
}
```

**Pause:**
```json
{
  "action": "pause"
}
```

**Skip Forward:**
```json
{
  "action": "skip_forward"
}
```

**Skip Backward:**
```json
{
  "action": "skip_backward"
}
```

## Testing the Server

### Using wscat (WebSocket client)

1. Install wscat globally:
   ```bash
   npm install -g wscat
   ```

2. Connect to the server:
   ```bash
   wscat -c ws://localhost:8080
   ```

3. Send test commands:
   ```json
   {"action": "play"}
   {"action": "pause"}
   ```

### Using curl (HTTP endpoints)

Test the health endpoint:
```bash
curl http://localhost:8080/health
```

Test the root endpoint:
```bash
curl http://localhost:8080/
```

## Architecture

The server acts as a message broker:

1. **Mobile App** → Sends commands via WebSocket
2. **Backend** → Receives commands and broadcasts to all clients
3. **Browser Extension** → Receives commands and controls video playback

```
┌─────────────┐          ┌─────────────┐          ┌──────────────────┐
│             │          │             │          │                  │
│  Mobile App │ ───────→ │   Backend   │ ───────→ │ Browser Extension│
│             │          │  (WebSocket)│          │                  │
└─────────────┘          └─────────────┘          └──────────────────┘
```

## Development

### Project Structure

```
backend/
├── package.json      # Dependencies and scripts
├── server.js         # Main server file
└── README.md         # This file
```

### Server Logs

The server provides detailed logging:

- Connection events (new connections, disconnections)
- Received messages and commands
- Broadcast operations
- Errors and exceptions

All logs include timestamps in ISO format.

## Troubleshooting

### Port Already in Use

If port 8080 is already in use, you'll see an error. Use a different port:

```bash
PORT=3000 npm start
```

### Connection Issues

1. Make sure the server is running
2. Check firewall settings
3. Verify the correct WebSocket URL is being used
4. Check server logs for error messages

### WebSocket Connection Fails

- Ensure you're using `ws://` protocol (not `wss://` unless you've configured SSL)
- Verify the server is accessible from the client's network
- Check browser console for error messages

## Security Considerations

This is a local development server. For production use, consider:

- Adding authentication/authorization
- Using WSS (WebSocket Secure) with SSL/TLS
- Rate limiting
- Input validation and sanitization
- CORS configuration

## License

CC BY-NC-SA 4.0 - See LICENSE file in the project root
