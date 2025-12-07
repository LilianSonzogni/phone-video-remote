/**
 * Phone Video Remote - Iframe Content Script
 * Runs inside Crunchyroll's video player iframe
 * Has direct access to the <video> element
 */

console.log('[Video Remote Iframe] Loaded in Crunchyroll player iframe');

// Listen for messages from parent window
window.addEventListener('message', (event) => {
  // Security: verify origin
  if (!event.data || event.data.source !== 'video-remote-extension') {
    return;
  }

  const action = event.data.action;
  console.log(`[Video Remote Iframe] Received action: ${action}`);

  // Find video element (direct access since we're in the iframe!)
  const video = document.querySelector('video');

  if (!video) {
    console.log('[Video Remote Iframe] No video element found');
    window.parent.postMessage({
      source: 'video-remote-iframe-response',
      action,
      success: false,
      error: 'No video found'
    }, '*');
    return;
  }

  // Direct video control (much simpler than keyboard events!)
  try {
    switch (action) {
      case 'pause':
        video.pause();
        console.log('[Video Remote Iframe] Video paused');
        break;

      case 'play':
        video.play();
        console.log('[Video Remote Iframe] Video playing');
        break;

      case 'skip_forward':
        video.currentTime += 10;
        console.log(`[Video Remote Iframe] Skipped forward to ${video.currentTime.toFixed(2)}s`);
        break;

      case 'skip_backward':
        video.currentTime = Math.max(0, video.currentTime - 10);
        console.log(`[Video Remote Iframe] Skipped backward to ${video.currentTime.toFixed(2)}s`);
        break;

      default:
        console.log(`[Video Remote Iframe] Unknown action: ${action}`);
    }

    // Send success response
    window.parent.postMessage({
      source: 'video-remote-iframe-response',
      action,
      success: true
    }, '*');

  } catch (error) {
    console.error('[Video Remote Iframe] Error:', error);
    window.parent.postMessage({
      source: 'video-remote-iframe-response',
      action,
      success: false,
      error: error.message
    }, '*');
  }
});

// Signal that iframe script is ready
window.parent.postMessage({
  source: 'video-remote-iframe-ready'
}, '*');

console.log('[Video Remote Iframe] Ready and listening for commands');
