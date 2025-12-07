/**
 * Phone Video Remote - Mobile PWA Application
 * WebSocket connection management and video control commands
 */

// ===== Constants =====
const DEFAULT_SERVER = 'ws://localhost:8080';
const STORAGE_KEY_SERVER = 'videoRemoteServer';
const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const INITIAL_RECONNECT_DELAY = 1000; // 1 second

// ===== State =====
let ws = null;
let reconnectDelay = INITIAL_RECONNECT_DELAY;
let reconnectTimeout = null;
let isConnecting = false;
let isPlaying = false; // Track play/pause state

// ===== DOM Elements =====
const elements = {
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  serverAddress: document.getElementById('serverAddress'),
  connectBtn: document.getElementById('connectBtn'),
  disconnectBtn: document.getElementById('disconnectBtn'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  skipBackwardBtn: document.getElementById('skipBackwardBtn'),
  skipForwardBtn: document.getElementById('skipForwardBtn'),
  installPrompt: document.getElementById('installPrompt'),
  installBtn: document.getElementById('installBtn'),
  dismissInstallBtn: document.getElementById('dismissInstallBtn')
};

// ===== Logging =====
/**
 * Logs a message with timestamp and prefix
 * @param {string} message - Message to log
 * @param {string} level - Log level (log, warn, error)
 */
function log(message, level = 'log') {
  const timestamp = new Date().toISOString();
  const prefix = '[Video Remote]';
  console[level](`${prefix} [${timestamp}] ${message}`);
}

// ===== LocalStorage Management =====
/**
 * Loads the server address from localStorage
 * @returns {string} - Saved server address or default
 */
function loadServerAddress() {
  const saved = localStorage.getItem(STORAGE_KEY_SERVER);
  return saved || DEFAULT_SERVER;
}

/**
 * Saves the server address to localStorage
 * @param {string} address - Server address to save
 */
function saveServerAddress(address) {
  localStorage.setItem(STORAGE_KEY_SERVER, address);
  log(`Server address saved: ${address}`);
}

// ===== UI State Management =====
/**
 * Updates the connection status UI
 * @param {boolean} connected - Connection status
 */
function updateConnectionStatus(connected) {
  if (connected) {
    elements.statusDot.classList.add('connected');
    elements.statusText.classList.add('connected');
    elements.statusText.textContent = 'Connected';
    elements.connectBtn.disabled = true;
    elements.disconnectBtn.disabled = false;

    // Enable control buttons
    elements.playPauseBtn.disabled = false;
    elements.skipBackwardBtn.disabled = false;
    elements.skipForwardBtn.disabled = false;
  } else {
    elements.statusDot.classList.remove('connected');
    elements.statusText.classList.remove('connected');
    elements.statusText.textContent = 'Disconnected';
    elements.connectBtn.disabled = false;
    elements.disconnectBtn.disabled = true;

    // Disable control buttons
    elements.playPauseBtn.disabled = true;
    elements.skipBackwardBtn.disabled = true;
    elements.skipForwardBtn.disabled = true;
  }
}

/**
 * Updates the play/pause button appearance
 * @param {boolean} playing - Whether video is playing
 */
function updatePlayPauseButton(playing) {
  isPlaying = playing;
  const icon = elements.playPauseBtn.querySelector('.btn-icon');
  const label = elements.playPauseBtn.querySelector('.btn-label');

  if (playing) {
    icon.textContent = '⏸️';
    label.textContent = 'Pause';
  } else {
    icon.textContent = '▶️';
    label.textContent = 'Play';
  }
}

/**
 * Provides visual feedback for button press
 * @param {HTMLElement} button - Button element
 */
function animateButtonPress(button) {
  // Haptic feedback if supported
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }

  // Visual feedback already handled by CSS :active state
  log(`Button pressed: ${button.textContent.trim()}`);
}

// ===== WebSocket Management =====
/**
 * Sends a command to the backend server
 * @param {string} action - Action to perform (play, pause, skip_forward, skip_backward)
 */
function sendCommand(action) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    log('Cannot send command: not connected', 'warn');
    return;
  }

  const command = { action };
  const message = JSON.stringify(command);

  try {
    ws.send(message);
    log(`Command sent: ${action}`);

    // Update play/pause state locally for instant UI feedback
    if (action === 'play') {
      updatePlayPauseButton(true);
    } else if (action === 'pause') {
      updatePlayPauseButton(false);
    }
  } catch (error) {
    log(`Failed to send command: ${error.message}`, 'error');
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

  const serverAddress = elements.serverAddress.value.trim();

  if (!serverAddress) {
    alert('Please enter a server address');
    return;
  }

  // Validate WebSocket URL format
  if (!serverAddress.startsWith('ws://') && !serverAddress.startsWith('wss://')) {
    alert('Server address must start with ws:// or wss://');
    return;
  }

  isConnecting = true;
  log(`Connecting to ${serverAddress}...`);

  try {
    ws = new WebSocket(serverAddress);

    ws.onopen = () => {
      log('WebSocket connected successfully');
      isConnecting = false;
      reconnectDelay = INITIAL_RECONNECT_DELAY; // Reset backoff
      updateConnectionStatus(true);
      saveServerAddress(serverAddress);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        log(`Received message: ${JSON.stringify(data)}`);

        // Handle server responses (if any)
        if (data.status) {
          log(`Server status: ${data.status}`);
        }
      } catch (error) {
        log(`Error parsing message: ${error.message}`, 'error');
      }
    };

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

// ===== Event Listeners =====
/**
 * Initializes all event listeners
 */
function initEventListeners() {
  // Connection buttons
  elements.connectBtn.addEventListener('click', () => {
    connect();
  });

  elements.disconnectBtn.addEventListener('click', () => {
    disconnect();
  });

  // Control buttons
  elements.playPauseBtn.addEventListener('click', () => {
    animateButtonPress(elements.playPauseBtn);
    const action = isPlaying ? 'pause' : 'play';
    sendCommand(action);
  });

  elements.skipBackwardBtn.addEventListener('click', () => {
    animateButtonPress(elements.skipBackwardBtn);
    sendCommand('skip_backward');
  });

  elements.skipForwardBtn.addEventListener('click', () => {
    animateButtonPress(elements.skipForwardBtn);
    sendCommand('skip_forward');
  });

  // Server address input - connect on Enter key
  elements.serverAddress.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      connect();
    }
  });

  // Install prompt buttons
  elements.installBtn.addEventListener('click', () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then((choice) => {
        log(`Install prompt result: ${choice.outcome}`);
        deferredInstallPrompt = null;
        elements.installPrompt.hidden = true;
      });
    }
  });

  elements.dismissInstallBtn.addEventListener('click', () => {
    elements.installPrompt.hidden = true;
  });
}

// ===== PWA Installation =====
let deferredInstallPrompt = null;

/**
 * Handles the beforeinstallprompt event for PWA installation
 */
window.addEventListener('beforeinstallprompt', (event) => {
  // Prevent the mini-infobar from appearing
  event.preventDefault();

  // Store the event for later use
  deferredInstallPrompt = event;

  // Show custom install prompt
  elements.installPrompt.hidden = false;

  log('Install prompt available');
});

/**
 * Handles the appinstalled event
 */
window.addEventListener('appinstalled', () => {
  log('PWA installed successfully');
  elements.installPrompt.hidden = true;
  deferredInstallPrompt = null;
});

// ===== Service Worker Registration =====
/**
 * Registers the service worker for offline functionality
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then((registration) => {
        log('Service Worker registered successfully');

        // Check for updates
        registration.addEventListener('updatefound', () => {
          log('Service Worker update found');
        });
      })
      .catch((error) => {
        log(`Service Worker registration failed: ${error.message}`, 'error');
      });
  }
}

// ===== Initialization =====
/**
 * Initializes the application
 */
function init() {
  log('Initializing Phone Video Remote...');

  // Load saved server address
  const savedServer = loadServerAddress();
  elements.serverAddress.value = savedServer;

  // Initialize event listeners
  initEventListeners();

  // Register service worker
  registerServiceWorker();

  // Initial UI state
  updateConnectionStatus(false);
  updatePlayPauseButton(false);

  log('Application initialized');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
