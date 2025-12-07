# Phone Video Remote - Browser Extension

Control video playback from your phone without leaving the couch! This browser extension connects to the Phone Video Remote backend server and allows you to control videos on your computer using your phone.

## Features

- 🎮 **Remote Control**: Play, pause, skip forward/backward from your phone
- 🔇 **No Focus Stealing**: Videos are controlled even when the browser tab is in the background
- 🌐 **Multi-Site Support**: Works on YouTube, Netflix, Crunchyroll, Prime Video, Disney+
- 🔄 **Auto-Reconnect**: Automatically reconnects to the backend with exponential backoff
- 📡 **Real-time Updates**: WebSocket-based communication for instant control
- 🎯 **Smart Video Detection**: Finds and controls the right video element automatically

## Prerequisites

Before installing the extension, ensure you have:

1. **Backend Server Running**: The Node.js backend server must be running on `ws://localhost:8080`
   - See the main project README for backend setup instructions
   - Start the backend with `node server/index.js`

2. **Supported Browser**: One of the following browsers:
   - Microsoft Edge (Chromium-based)
   - Google Chrome
   - Opera
   - Mozilla Firefox

## Installation

### For Edge, Chrome, and Opera (Chromium-based browsers)

1. **Open the Extensions Page**:
   - **Edge**: Navigate to `edge://extensions`
   - **Chrome**: Navigate to `chrome://extensions`
   - **Opera**: Navigate to `opera://extensions` or use Chrome instructions

2. **Enable Developer Mode**:
   - Look for the "Developer mode" toggle in the top-right corner
   - Turn it **ON**

3. **Load the Extension**:
   - Click the "Load unpacked" button
   - Navigate to the `/extension` folder in this project
   - Select the folder and click "Select Folder"

4. **Verify Installation**:
   - You should see "Phone Video Remote" appear in your extensions list
   - The extension icon should appear in your browser toolbar
   - If you don't see the icon, click the puzzle piece icon and pin the extension

### For Firefox

1. **Open the Debugging Page**:
   - Navigate to `about:debugging#/runtime/this-firefox`

2. **Load Temporary Add-on**:
   - Click "Load Temporary Add-on..."
   - Navigate to the `/extension` folder
   - Select the `manifest.json` file
   - Click "Open"

3. **Verify Installation**:
   - The extension should appear in the list of temporary extensions
   - The extension icon should appear in your Firefox toolbar

**Note for Firefox**: Extensions loaded this way are temporary and will be removed when you close Firefox. For permanent installation, you would need to package and sign the extension through Mozilla's Add-on Developer Hub.

## Usage

1. **Start the Backend Server**:
   ```bash
   node server/index.js
   ```
   You should see: `WebSocket server running on ws://localhost:8080`

2. **Open a Supported Video Site**:
   - YouTube (youtube.com)
   - Netflix (netflix.com)
   - Crunchyroll (crunchyroll.com)
   - Amazon Prime Video (primevideo.com)
   - Disney+ (disneyplus.com)

3. **Check Extension Status**:
   - Click the extension icon in your browser toolbar
   - The popup should show "Connected ✅" if the backend is running
   - If it shows "Disconnected ❌", click the "Connect" button

4. **Control from Your Phone**:
   - Open your phone's browser and navigate to the device running the backend
   - Use the web interface to send commands
   - Commands work even when the browser tab is in the background!

## Supported Commands

| Command | Action | Keyboard Equivalent |
|---------|--------|-------------------|
| **Play** | Starts video playback | Spacebar |
| **Pause** | Pauses video playback | Spacebar |
| **Skip Forward** | Jumps ahead 10 seconds | → Arrow Key |
| **Skip Backward** | Jumps back 10 seconds | ← Arrow Key |

## Supported Sites

Based on extensive real-world testing, here's the current support status for each platform:

| Site | Play/Pause | Skip ±10s | Implementation | Status |
|------|------------|-----------|----------------|--------|
| **YouTube** | ✅ | ✅ | Standard video element controls | Fully working |
| **Prime Video** | ✅ | ✅ | Standard controls + ghost video filtering + throttling | Fully working |
| **Netflix** | ✅ | ✅ | Standard video element controls | Fully working |
| **Crunchyroll** | ✅ | ✅ | Keyboard event simulation with video focus | Fully working |
| **Disney+** | ✅ | ✅ | Keyboard event simulation with video focus | Fully working |

### Important Notes

#### Video Focus Requirement (Crunchyroll & Disney+)

Crunchyroll and Disney+ require the player container to have keyboard focus before keyboard events work. The extension automatically handles this by clicking the specific interactive elements:

- **Crunchyroll**: Clicks `#vilosControlsContainer` (player controls container)
- **Disney+**: Clicks `#hivePlayer1` (Hive player container)

**How it works:**
1. Clicks the site-specific focusable element
2. Waits 150ms for focus to settle
3. Dispatches the keyboard event

This happens transparently - you don't need to manually click anything! The extension automatically finds and clicks the correct element for every command.

**Console messages you'll see:**
```
🎌 Crunchyroll: Using keyboard events with vilosControlsContainer focus
🎯 Crunchyroll: Clicking #vilosControlsContainer to give keyboard focus
  ✅ Focus given, executing action
  ⌨️  Key 1/2: "ArrowRight"
  ⌨️  Key 2/2: "ArrowRight"
✅ Crunchyroll: Completed "skip_forward"
```

#### Command Throttling (Prime Video)

Prime Video requires a minimum 300ms delay between commands to prevent spam issues. If you send commands too quickly, the extension will automatically queue them with appropriate delays.

**Console messages:**
```
⏱️  Throttling: Waiting 200ms before next command
```

### Technical Implementation Details

**YouTube, Netflix, Prime Video**:
- Uses standard HTML5 `<video>` element control
- Direct manipulation of `video.play()`, `video.pause()`, `video.currentTime`
- Works reliably across all commands

**Crunchyroll**:
- Video loads in cross-origin iframe (inaccessible)
- Uses keyboard event simulation with player focus
- **Focus selector**: `#vilosControlsContainer` (player controls container)
- Extension clicks this element automatically before dispatching keys
- Dispatches Space for play/pause, Arrow keys for skip
- Skip commands press arrow keys twice (5s + 5s = 10s)

**Prime Video - Ghost Video Filtering**:
- Detects 3 video elements total
- 2 are "ghost videos" (duration: NaN, videoWidth: 0)
- Extension filters these out automatically
- Only controls the real video element
- **Command throttling**: 300ms minimum delay between commands

**Disney+**:
- Custom Web Components with restricted API
- Uses keyboard event simulation with player focus
- **Focus selector**: `#hivePlayer1` (Hive player container)
- Extension clicks this element automatically before dispatching keys
- **All commands work**: Space for play/pause, Arrow keys for skip (±10s)

## How It Works

### Architecture Overview

```
Phone → Backend Server (WebSocket) → Browser Extension → Video Element
```

1. **Phone Interface**: Sends commands to the backend server via HTTP/WebSocket
2. **Backend Server**: Broadcasts commands to all connected browser extensions
3. **Extension Background Worker**: Receives commands and forwards to content scripts
4. **Content Script**: Executes video control on the actual `<video>` element

### No Focus Stealing

The extension uses content scripts that run in the context of the video page. These scripts can control video elements **without focusing the tab or window**. This is the key feature that allows you to:

- Keep working in another tab while controlling the video
- Control videos on a second monitor without switching focus
- Use your computer normally while someone else watches videos

### Smart Video Detection

The extension intelligently selects which video to control when multiple videos are present:

1. **Priority 1**: Currently playing video
2. **Priority 2**: Largest video by dimensions
3. **Priority 3**: First video found on the page

The extension also uses a MutationObserver to detect videos that are loaded dynamically (common on Netflix, YouTube, etc.).

### Site-Specific Handling

The extension includes specialized handlers for different video platforms:

**Standard Handler** (YouTube, Netflix, Prime Video):
- Uses direct `<video>` element control
- Calls `video.play()`, `video.pause()`, and modifies `video.currentTime`
- Works for most sites with standard HTML5 video players

**Crunchyroll Handler**:
- **Problem**: Vilosplayer custom player doesn't respond to direct video controls
- **Solution**: Simulates keyboard events (Space, Arrow keys)
- Dispatches actual KeyboardEvent objects that the player listens for
- Double-presses arrow keys for skip (2x 5s = 10s)

**Disney+ Handler**:
- **Problem**: Backward seeking doesn't trigger visual update
- **Solution**: Enhanced seeking sequence:
  1. Pause the video
  2. Set new currentTime
  3. Dispatch `timeupdate` event to force player refresh
  4. Resume playback if video was playing
- Small delay (100ms) ensures proper state transition

**Keyboard Fallback System**:
- All sites have keyboard shortcuts defined
- If direct video control fails, extension falls back to keyboard simulation
- YouTube uses 'k' (play/pause), 'j' (-10s), 'l' (+10s)
- Other sites use Space and Arrow keys
- Events bubble through document and video element

## Troubleshooting

### Extension Shows "Disconnected ❌"

**Problem**: The extension cannot connect to the backend server.

**Solutions**:
- Ensure the backend server is running (`node server/index.js`)
- Check that the server is running on `ws://localhost:8080`
- Try clicking the "Connect" button in the extension popup
- Check the browser console for error messages (F12 → Console tab)

### Commands Not Working on Video Site

**Problem**: Videos are not responding to commands from your phone.

**Solutions**:
- Refresh the video page to ensure the content script is loaded
- Check if the site is in the supported list (see manifest.json)
- Open the browser console (F12) and look for `[Phone Video Remote]` messages
- Ensure the video element has loaded (some sites load videos after page load)
- Try playing the video manually first, then use remote commands
- See **Site-Specific Issues** below for platform-specific problems

### Site-Specific Issues

Different video platforms use different player technologies. Here's what you need to know:

#### ✅ YouTube
**Status**: Fully working
**Implementation**: Standard video element controls
**Notes**: Works perfectly with play, pause, and skip commands. Uses YouTube-specific keyboard shortcuts (k, j, l) as fallback.

#### ✅ Amazon Prime Video
**Status**: Fully working
**Implementation**: Standard video element controls
**Notes**: All commands work reliably. No special handling needed.

#### ✅ Netflix
**Status**: Fully working
**Implementation**: Standard video element controls
**Notes**: Works well with all commands. Video element loads dynamically, detected by mutation observer.

#### ✅ Crunchyroll
**Status**: Fully working
**Implementation**: Keyboard event simulation with player container focus
**How it works**:
- Crunchyroll uses Vilosplayer (custom player) in cross-origin iframe
- Extension cannot access video element directly
- **Solution**: Clicks `#vilosControlsContainer` to give keyboard focus, then dispatches keyboard events
- Skip commands use double key press (2x 5s = 10s) to match Crunchyroll's default

**Console messages you'll see**:
```
🎌 Crunchyroll: Using keyboard events with vilosControlsContainer focus
🎯 Crunchyroll: Clicking #vilosControlsContainer to give keyboard focus
  ✅ Focus given, executing action
  ⌨️  Key 1/2: "ArrowRight"
  ⌨️  Key 2/2: "ArrowRight"
✅ Crunchyroll: Completed "skip_forward"
```

**If not working**:
1. Check browser console for "[Phone Video Remote]" messages
2. Try refreshing the page and waiting 2-3 seconds for player to fully load
3. Ensure extension has permissions for crunchyroll.com

#### ✅ Disney+
**Status**: Fully working (all commands including skip!)
**Implementation**: Keyboard event simulation with Hive player focus
**How it works**:
- Disney+ custom player requires keyboard focus on the Hive player container
- Extension automatically clicks `#hivePlayer1` to give it focus before sending commands
- **All commands work**: Play/pause (Space), Skip forward/backward (Arrow keys ±10s)

**Console messages you'll see**:
```
🏰 Disney+: Using keyboard events with hivePlayer1 focus
🎯 Disney+: Clicking #hivePlayer1 to give keyboard focus
  ✅ Focus given, executing action
✅ Disney+: Completed "skip_forward"
```

**If not working**:
1. Check browser console for "[Phone Video Remote]" messages
2. Try refreshing the page
3. Ensure extension has permissions for disneyplus.com

#### 🔧 Adding New Sites

To add support for a new video site:

1. Edit `manifest.json`:
   ```json
   {
     "host_permissions": ["*://*.newsite.com/*"],
     "content_scripts": [{
       "matches": ["*://*.newsite.com/*"]
     }]
   }
   ```

2. Test with standard controls - they work for most sites!

3. If controls don't work, add site-specific handler to `content.js`:
   - Add config to `SITE_CONFIGS` object
   - Create handler function if needed
   - Use keyboard event fallback for custom players

### Video Controls Don't Work in Background Tab

**Problem**: Videos only work when the tab is active.

**Solutions**:
- This might be a browser policy restriction on certain sites
- Some sites (especially with DRM) may restrict background playback
- Try using the extension on YouTube first to verify it works
- Check browser console for any policy or permission errors

### Extension Not Appearing in Toolbar

**Problem**: Extension is installed but icon is not visible.

**Solutions**:
- Click the puzzle piece icon (Extensions menu) in your toolbar
- Find "Phone Video Remote" and click the pin icon
- The extension icon should now appear in the toolbar

### Firefox: Extension Disappears After Restart

**Problem**: The extension is gone when I reopen Firefox.

**Explanation**: Temporary add-ons in Firefox are removed when the browser closes.

**Solutions**:
- You'll need to reload the extension each time using `about:debugging`
- For permanent installation, the extension needs to be signed through Mozilla
- Alternatively, use Firefox Developer Edition which allows unsigned extensions

### "WebSocket connection failed" Errors

**Problem**: Background script shows WebSocket connection failures.

**Solutions**:
- Verify backend is running: `node server/index.js`
- Check if another application is using port 8080
- Look at backend server logs for connection attempts
- Try restarting both the backend and browser extension

## Development & Debugging

### Viewing Extension Logs

**Chromium-based browsers**:
1. Go to extensions page (`chrome://extensions` or `edge://extensions`)
2. Find "Phone Video Remote"
3. Click "service worker" or "background page" to open DevTools
4. Check the Console tab for `[Phone Video Remote]` messages

**Content script logs** (all browsers):
1. Open the video site
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for `[Phone Video Remote]` messages

### Modifying the Extension

After making changes to extension files:

1. **Chromium browsers**: Go to extensions page and click the refresh icon
2. **Firefox**: Click "Reload" on the debugging page
3. Reload any video tabs to get the updated content script

### Adding More Video Sites

To add support for additional video sites:

1. Edit `manifest.json`
2. Add the site's URL pattern to both:
   - `host_permissions` array
   - `content_scripts` matches array
3. Reload the extension
4. The site should now work with the remote control!

Example:
```json
{
  "host_permissions": [
    "*://*.newvideosite.com/*"
  ],
  "content_scripts": [
    {
      "matches": [
        "*://*.newvideosite.com/*"
      ]
    }
  ]
}
```

## Technical Details

### Manifest V3

This extension uses Manifest V3, the latest extension platform for Chrome and Edge. Key features:

- **Service Workers**: Instead of persistent background pages
- **Promises**: Modern async/await syntax throughout
- **Host Permissions**: More granular permission model

### Browser Compatibility

The extension uses standard Web Extensions APIs that work across:
- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Opera 74+
- ✅ Firefox 109+ (with Manifest V3 support)

### File Structure

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (WebSocket connection)
├── content.js            # Content script (video control)
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## Privacy & Security

- **No Data Collection**: The extension does not collect or transmit any personal data
- **Local Only**: All communication is with `localhost:8080` - your data never leaves your computer
- **No External Requests**: The extension only communicates with your local backend server
- **Minimal Permissions**: Only requests necessary permissions for video control
- **Open Source**: All code is available for review

## License

This extension is part of the Phone Video Remote project.
See the main project LICENSE file for details.

## Support & Contributing

Found a bug or have a feature request? Please open an issue on the main project repository.

Pull requests are welcome! Please ensure your code:
- Uses modern JavaScript (ES6+)
- Includes JSDoc comments
- Follows the existing code style
- Works on all supported browsers

## Credits

Created as part of the Phone Video Remote project.
Built with ❤️ for couch potatoes everywhere.
