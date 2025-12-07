/**
 * Phone Video Remote - Background Service Worker
 * Manages WebSocket connection to backend server and forwards commands to content scripts
 */

const WS_URL = 'ws://localhost:8080';
const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const INITIAL_RECONNECT_DELAY = 1000; // 1 second

let ws = null;
let reconnectDelay = INITIAL_RECONNECT_DELAY;
let reconnectTimeout = null;
let isConnecting = false;

/**
 * Logs a message with timestamp and prefix
 * @param {string} message - Message to log
 * @param {string} level - Log level (info, warn, error)
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = '[Phone Video Remote]';
  console[level](`${prefix} [${timestamp}] ${message}`);
}

/**
 * Updates the connection status in storage
 * @param {boolean} connected - Connection status
 */
async function updateConnectionStatus(connected) {
  try {
    await chrome.storage.local.set({
      connected: connected,
      lastUpdate: Date.now()
    });
    log(`Connection status updated: ${connected ? 'Connected' : 'Disconnected'}`);
  } catch (error) {
    log(`Failed to update connection status: ${error.message}`, 'error');
  }
}

/**
 * Sends a command to all tabs with video content
 * @param {Object} command - Command object from backend
 */
async function broadcastToVideoTabs(command) {
  try {
    // Query all tabs that match our video sites
    const tabs = await chrome.tabs.query({
      url: [
        '*://*.youtube.com/*',
        '*://*.netflix.com/*',
        '*://*.crunchyroll.com/*',
        '*://*.primevideo.com/*',
        '*://*.disneyplus.com/*'
      ]
    });

    log(`Broadcasting command "${command.action}" to ${tabs.length} video tab(s)`);

    // Send message to all video tabs
    const promises = tabs.map(tab =>
      chrome.tabs.sendMessage(tab.id, command)
        .catch(err => {
          // Tab might not have content script loaded yet, that's okay
          log(`Could not send to tab ${tab.id}: ${err.message}`, 'warn');
        })
    );

    await Promise.allSettled(promises);
  } catch (error) {
    log(`Error broadcasting to tabs: ${error.message}`, 'error');
  }
}

/**
 * Handles incoming WebSocket messages
 * @param {MessageEvent} event - WebSocket message event
 */
function handleMessage(event) {
  try {
    const data = JSON.parse(event.data);
    log(`Received command: ${JSON.stringify(data)}`);

    // Validate command structure
    if (!data.action) {
      log('Invalid command: missing action', 'warn');
      return;
    }

    // Forward to all video tabs
    broadcastToVideoTabs(data);
  } catch (error) {
    log(`Error handling message: ${error.message}`, 'error');
  }
}

/**
 * Connects to the WebSocket server
 */
function connect() {
  if (isConnecting || (ws && ws.readyState === WebSocket.OPEN)) {
    log('Already connected or connecting', 'warn');
    return;
  }

  isConnecting = true;
  log(`Connecting to ${WS_URL}...`);

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      log('WebSocket connected successfully');
      isConnecting = false;
      reconnectDelay = INITIAL_RECONNECT_DELAY; // Reset backoff
      updateConnectionStatus(true);
    };

    ws.onmessage = handleMessage;

    ws.onerror = (error) => {
      log(`WebSocket error: ${error.message || 'Unknown error'}`, 'error');
    };

    ws.onclose = (event) => {
      log(`WebSocket closed (code: ${event.code}, reason: ${event.reason || 'Unknown'})`);
      isConnecting = false;
      ws = null;
      updateConnectionStatus(false);
      scheduleReconnect();
    };
  } catch (error) {
    log(`Failed to create WebSocket: ${error.message}`, 'error');
    isConnecting = false;
    updateConnectionStatus(false);
    scheduleReconnect();
  }
}

/**
 * Schedules a reconnection attempt with exponential backoff
 */
function scheduleReconnect() {
  // Clear any existing reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }

  log(`Scheduling reconnect in ${reconnectDelay}ms`);

  reconnectTimeout = setTimeout(() => {
    connect();
    // Exponential backoff with max limit
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
  }, reconnectDelay);
}

/**
 * Disconnects from the WebSocket server
 */
function disconnect() {
  log('Manually disconnecting...');

  // Clear reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  // Close WebSocket
  if (ws) {
    ws.close();
    ws = null;
  }

  isConnecting = false;
  updateConnectionStatus(false);
}

/**
 * Handles messages from popup or content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log(`Received internal message: ${JSON.stringify(message)}`);

  if (message.action === 'connect') {
    connect();
    sendResponse({ success: true });
  } else if (message.action === 'disconnect') {
    disconnect();
    sendResponse({ success: true });
  } else if (message.action === 'getStatus') {
    const status = {
      connected: ws !== null && ws.readyState === WebSocket.OPEN,
      url: WS_URL
    };
    sendResponse(status);
  }

  return true; // Keep message channel open for async response
});

// Initialize connection when extension loads
log('Background service worker initialized');
connect();

// Handle extension updates/reloads
chrome.runtime.onInstalled.addListener((details) => {
  log(`Extension installed/updated: ${details.reason}`);
  if (details.reason === 'install') {
    log('First time installation - opening options or welcome page could go here');
  }
});

// Ensure connection is maintained
setInterval(() => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    log('Connection check: not connected, attempting to reconnect...');
    connect();
  }
}, 60000); // Check every minute
