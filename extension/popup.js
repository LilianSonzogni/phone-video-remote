/**
 * Phone Video Remote - Popup Script
 * Handles popup UI and status updates
 */

// DOM elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const serverInfo = document.getElementById('serverInfo');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');

/**
 * Updates the UI based on connection status
 * @param {boolean} connected - Connection status
 */
function updateUI(connected) {
  if (connected) {
    // Connected state
    statusDot.className = 'status-dot connected';
    statusText.className = 'status-text connected';
    statusText.textContent = 'Connected ✅';
    connectBtn.disabled = true;
    disconnectBtn.disabled = false;
  } else {
    // Disconnected state
    statusDot.className = 'status-dot disconnected';
    statusText.className = 'status-text disconnected';
    statusText.textContent = 'Disconnected ❌';
    connectBtn.disabled = false;
    disconnectBtn.disabled = true;
  }
}

/**
 * Fetches the current connection status from background script
 */
async function updateStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
    updateUI(response.connected);
    if (response.url) {
      serverInfo.textContent = response.url;
    }
  } catch (error) {
    console.error('[Phone Video Remote] Error getting status:', error);
    updateUI(false);
  }
}

/**
 * Handles connect button click
 */
connectBtn.addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'connect' });
    // Status will be updated via storage listener
    setTimeout(updateStatus, 500); // Give it a moment to connect
  } catch (error) {
    console.error('[Phone Video Remote] Error connecting:', error);
  }
});

/**
 * Handles disconnect button click
 */
disconnectBtn.addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'disconnect' });
    updateUI(false);
  } catch (error) {
    console.error('[Phone Video Remote] Error disconnecting:', error);
  }
});

/**
 * Listens for storage changes to update UI in real-time
 */
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.connected) {
    updateUI(changes.connected.newValue);
  }
});

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  updateStatus();

  // Update status every 2 seconds while popup is open
  const statusInterval = setInterval(updateStatus, 2000);

  // Clean up interval when popup closes
  window.addEventListener('unload', () => {
    clearInterval(statusInterval);
  });
});
