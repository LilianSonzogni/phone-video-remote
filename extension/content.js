/**
 * Phone Video Remote - Content Script
 * Simple, clean implementation for video control
 *
 * Supported sites:
 * - YouTube, Prime Video, Netflix: Direct video element control
 * - Crunchyroll: Keyboard events with focus on controls
 * - Disney+: Keyboard events without focus
 */

// ===== Constants =====
const SITES = {
  CRUNCHYROLL: 'crunchyroll.com',
  DISNEY: 'disneyplus.com',
  YOUTUBE: 'youtube.com',
  PRIME: 'primevideo.com',
  NETFLIX: 'netflix.com'
};

// ===== Helper Functions =====

function log(msg) {
  console.log(`[Video Remote] ${msg}`);
}

function getSite() {
  const host = window.location.hostname;
  if (host.includes('crunchyroll')) return SITES.CRUNCHYROLL;
  if (host.includes('disneyplus')) return SITES.DISNEY;
  if (host.includes('youtube')) return SITES.YOUTUBE;
  if (host.includes('primevideo')) return SITES.PRIME;
  if (host.includes('netflix')) return SITES.NETFLIX;
  return null;
}

function findValidVideos() {
  const videos = Array.from(document.querySelectorAll('video'));
  // Filter out ghost videos (Prime Video has multiple, only some are real)
  return videos.filter(v => !isNaN(v.duration) && v.videoWidth > 0);
}

function dispatchKey(key) {
  const keyCode = key === ' ' ? 32 : (key === 'ArrowLeft' ? 37 : 39);
  document.dispatchEvent(new KeyboardEvent('keydown', {
    key,
    code: key === ' ' ? 'Space' : key,
    keyCode,
    bubbles: true,
    cancelable: true
  }));
}

// ===== Handlers =====

function handleStandard(action, videos) {
  // Direct video control for YouTube, Prime, Netflix
  videos.forEach(video => {
    switch (action) {
      case 'pause':
        video.pause();
        break;
      case 'play':
        video.play();
        break;
      case 'skip_forward':
        video.currentTime += 10;
        break;
      case 'skip_backward':
        video.currentTime = Math.max(0, video.currentTime - 10);
        break;
    }
  });
  log(`${action} on ${videos.length} video(s)`);
}

function handleCrunchyroll(action, callback) {
  log('Crunchyroll: Sending message to iframe');

  // Find the iframe
  const iframe = document.querySelector('iframe[src*="static.crunchyroll.com"]') ||
                 document.querySelector('iframe[src*="vilos"]');

  log(`Crunchyroll iframe found: ${!!iframe}`);

  if (!iframe || !iframe.contentWindow) {
    log('Crunchyroll iframe not found');
    callback?.(false);
    return;
  }

  // Send message to iframe
  iframe.contentWindow.postMessage({
    source: 'video-remote-extension',
    action: action
  }, '*');

  // Wait for response or timeout
  const responseHandler = (event) => {
    if (event.data?.source === 'video-remote-iframe-response' &&
        event.data?.action === action) {
      window.removeEventListener('message', responseHandler);
      log(`Crunchyroll: ${action} completed`);
      callback?.(true);
    }
  };

  window.addEventListener('message', responseHandler);

  // Timeout after 1 second
  setTimeout(() => {
    window.removeEventListener('message', responseHandler);
    callback?.(true); // Assume success
  }, 1000);
}

function handleDisneyPlus(action) {
  // Keyboard events WITHOUT focus (focus triggers pause toggle)
  const keyMap = {
    pause: ' ',
    play: ' ',
    skip_forward: 'ArrowRight',
    skip_backward: 'ArrowLeft'
  };

  const key = keyMap[action];
  if (!key) return;

  dispatchKey(key);
  log(`Disney+: ${action}`);
}

// ===== Main Message Handler =====

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const site = getSite();
  const action = msg.action;

  if (!action) {
    sendResponse({ success: false, error: 'Missing action' });
    return true;
  }

  try {
    if (site === SITES.CRUNCHYROLL) {
      // Async handler for Crunchyroll (iframe communication)
      handleCrunchyroll(action, (success) => {
        sendResponse({ success });
      });
      return true; // Keep channel open for async response
    } else if (site === SITES.DISNEY) {
      handleDisneyPlus(action);
      sendResponse({ success: true });
    } else {
      // Standard sites (YouTube, Prime, Netflix, etc.)
      const videos = findValidVideos();
      if (videos.length === 0) {
        throw new Error('No video found');
      }
      handleStandard(action, videos);
      sendResponse({ success: true });
    }
  } catch (err) {
    log(`Error: ${err.message}`);
    sendResponse({ success: false, error: err.message });
  }

  return true;
});

// ===== Init =====
log(`Loaded on ${getSite() || window.location.hostname}`);
