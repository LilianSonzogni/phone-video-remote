# Phone Video Remote - Mobile PWA

Control your PC videos from your phone - because getting up from the couch is overrated!

This is a Progressive Web App (PWA) that acts as a remote control for videos playing in your browser. It connects to the backend WebSocket server and sends playback commands.

## Features

- 📱 **Mobile-First Design** - Optimized for smartphones, works on tablets and desktop
- 🎮 **Touch-Friendly Controls** - Large buttons you can tap without looking
- 🌙 **Dark Theme** - Easy on the eyes with purple gradient accents
- 🔌 **Offline Ready** - App loads even without internet (service worker caching)
- 📲 **Installable** - Add to home screen for app-like experience
- 💾 **Persistent Settings** - Remembers your server address
- 🔄 **Auto-Reconnect** - Automatically reconnects with exponential backoff
- ⚡ **Instant Feedback** - Haptic and visual feedback on button press

## Supported Commands

| Button | Action | Description |
|--------|--------|-------------|
| **Play** | Starts playback | Resumes the video |
| **Pause** | Pauses playback | Pauses the video |
| **Skip Backward** | -10 seconds | Jumps back 10 seconds |
| **Skip Forward** | +10 seconds | Jumps ahead 10 seconds |

## Prerequisites

Before using the mobile app:

1. **Backend server must be running** on your PC
   ```bash
   cd backend
   npm start
   ```

2. **Browser extension must be installed** in your browser
   - See `/extension/README.md` for installation instructions

3. **Same WiFi network** - Your phone and PC must be on the same local network

4. **Find your PC's IP address**:
   - **Windows**: Open Command Prompt → `ipconfig` → Look for "IPv4 Address"
   - **Mac**: System Preferences → Network → Look for "IP Address"
   - **Linux**: Terminal → `ip addr` or `ifconfig`

## Installation

### Method 1: Android (Chrome, Edge, Samsung Internet)

1. **Open the PWA in your browser**:
   - Start a local HTTP server (see [Development Server](#development-server))
   - On your phone, navigate to `http://YOUR_PC_IP:3000`
   - Example: `http://192.168.1.100:3000`

2. **Install the app**:
   - Chrome will show an install banner at the bottom
   - OR tap the menu (⋮) → "Add to Home screen" or "Install app"
   - OR look for the install icon in the address bar

3. **Launch from home screen**:
   - The app icon will appear on your home screen
   - Tap it to launch in standalone mode (fullscreen, no browser UI)

### Method 2: iOS (Safari)

**Note**: iOS doesn't support full PWA features, but you can still add to home screen.

1. **Open the PWA in Safari**:
   - Navigate to `http://YOUR_PC_IP:3000`
   - Example: `http://192.168.1.100:3000`

2. **Add to Home Screen**:
   - Tap the Share button (box with arrow pointing up)
   - Scroll down and tap "Add to Home Screen"
   - Edit the name if desired
   - Tap "Add"

3. **Launch from home screen**:
   - The icon will appear on your home screen
   - Tap to launch

**iOS Limitations**:
- No install prompt (must use Share → Add to Home Screen)
- Service worker has limited support
- May need to reconnect after switching apps

### Method 3: Desktop (Chrome, Edge, Opera)

Yes, you can use the PWA on your computer too!

1. **Open the PWA**:
   - Navigate to `http://localhost:3000`

2. **Install**:
   - Look for the install icon in the address bar
   - OR menu → "Install Phone Video Remote"

3. **Launch**:
   - The app will appear in your Start Menu / Applications
   - Launch like any other app

## Usage

### First-Time Setup

1. **Start the backend server** on your PC:
   ```bash
   cd backend
   npm start
   ```
   You should see: `WebSocket server running on ws://localhost:8080`

2. **Find your PC's IP address**:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
   - Example: `192.168.1.100`

3. **Open the PWA** on your phone:
   - If installed: Tap the app icon
   - If not installed: Open in browser at `http://YOUR_PC_IP:3000`

4. **Enter server address**:
   - In the "Server Address" field, enter:
   - `ws://YOUR_PC_IP:8080`
   - Example: `ws://192.168.1.100:8080`
   - **Important**: Use your PC's IP, not `localhost`!

5. **Connect**:
   - Tap the "Connect" button
   - Status should change to "Connected" with green indicator

6. **Open a video** in your browser:
   - YouTube, Netflix, Crunchyroll, etc.
   - Make sure the extension is installed and connected

7. **Control from your phone**:
   - Tap the large Play/Pause button
   - Use Skip buttons to jump forward/backward
   - Works even when your browser tab is in the background!

### Daily Use

Once set up, using the app is simple:

1. Start backend server on PC
2. Open PWA on phone (from home screen)
3. Tap "Connect" (server address is saved)
4. Control your videos!

## Development Server

To run the PWA locally during development, you need a simple HTTP server.

### Option 1: Node.js (http-server)

```bash
cd mobile-app
npx http-server -p 3000
```

Then access at `http://localhost:3000` or `http://YOUR_IP:3000`

### Option 2: Python

```bash
cd mobile-app
python -m http.server 3000
```

Or for Python 2:
```bash
python -m SimpleHTTPServer 3000
```

### Option 3: Node.js (serve)

```bash
cd mobile-app
npx serve -p 3000
```

### Option 4: VS Code Live Server

If using VS Code:
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

**Important for Mobile Access**:
- The server must be accessible on your local network
- Use your PC's IP address, not `localhost`
- Make sure your firewall allows connections on port 3000

## Troubleshooting

### "Disconnected" - Cannot Connect to Server

**Problem**: The app shows "Disconnected" even after clicking Connect.

**Solutions**:
1. **Check backend is running**:
   - On your PC, verify the backend server is running
   - You should see: `WebSocket server running on ws://localhost:8080`

2. **Check server address format**:
   - Must start with `ws://` (not `http://`)
   - Must use your PC's IP, not `localhost`
   - Correct: `ws://192.168.1.100:8080`
   - Wrong: `ws://localhost:8080` (won't work from phone!)
   - Wrong: `http://192.168.1.100:8080` (wrong protocol)

3. **Check firewall**:
   - Windows Firewall may block port 8080
   - Add exception for Node.js or port 8080
   - Temporarily disable to test

4. **Check same network**:
   - Phone and PC must be on same WiFi network
   - Some networks isolate devices (guest networks, public WiFi)
   - Try using mobile hotspot as test

### App Not Installing / No Install Prompt

**Problem**: The install banner doesn't appear on Android.

**Solutions**:
- Must be served over HTTPS or localhost
- Service worker must register successfully
- Check browser console for errors (F12 → Console)
- Try accessing via Chrome (better PWA support than Firefox)
- Some browsers require user gesture (tap something first)

### Controls Not Working

**Problem**: Buttons don't do anything when tapped.

**Solutions**:
1. **Check connection status**:
   - Must show "Connected" with green indicator
   - Buttons are disabled when disconnected

2. **Check browser extension**:
   - Extension must be installed in your browser
   - Extension must be connected to backend
   - Check extension popup for connection status

3. **Check video is open**:
   - A video page must be open in your browser
   - Supported sites: YouTube, Netflix, Crunchyroll, Prime Video, Disney+

4. **Check browser console**:
   - On phone: Use remote debugging (Chrome DevTools)
   - Look for `[Video Remote]` messages
   - Check for WebSocket errors

### iOS Issues

**Problem**: PWA doesn't work well on iOS/iPhone.

**Known iOS Limitations**:
- No automatic install prompt (must use Share → Add to Home Screen)
- Service worker has limited support
- May disconnect when switching apps
- May need to reconnect after leaving app

**Solutions**:
- After switching back to app, tap "Connect" again if needed
- Keep app in foreground while using
- Consider using Android device for better experience

### Connection Keeps Dropping

**Problem**: Connection status keeps switching between connected/disconnected.

**Solutions**:
1. **Check WiFi signal**:
   - Weak WiFi can cause intermittent disconnections
   - Move closer to router

2. **Check PC power settings**:
   - PC may be going to sleep
   - Disable sleep mode or "Wake on LAN"

3. **Check network stability**:
   - Other devices using bandwidth
   - Router issues
   - Try restarting router

4. **Check auto-reconnect**:
   - App should automatically reconnect with exponential backoff
   - Max reconnect delay is 30 seconds

### Can't Access from Phone

**Problem**: Can't open the PWA at `http://YOUR_PC_IP:3000`.

**Solutions**:
1. **Check HTTP server is running**:
   - On PC, verify server is running on port 3000
   - Check output: `Available on: http://192.168.1.100:3000`

2. **Check firewall**:
   - Windows Firewall may block port 3000
   - Add exception for port 3000
   - Temporarily disable to test

3. **Check IP address**:
   - IP address may have changed (DHCP)
   - Run `ipconfig` again to verify
   - Consider setting static IP on PC

4. **Check network**:
   - Phone and PC on same WiFi?
   - Some routers have AP isolation (prevents devices from seeing each other)
   - Check router settings

## Technical Details

### Architecture

```
Phone (PWA) → WebSocket → Backend (PC) → WebSocket → Extension → Video Player
```

1. You tap a button on the PWA
2. PWA sends WebSocket message to backend
3. Backend broadcasts to all connected extensions
4. Extension controls the video element
5. All happens in milliseconds!

### Technologies Used

- **Frontend**: Vanilla JavaScript (no frameworks!)
- **Styling**: Pure CSS with CSS Grid and Flexbox
- **Communication**: WebSocket API
- **Storage**: localStorage API
- **Service Worker**: Cache API for offline functionality
- **PWA**: Web App Manifest for installation

### Browser Support

| Feature | Chrome/Edge | Safari | Firefox |
|---------|-------------|--------|---------|
| PWA Installation | ✅ Full support | ⚠️ Add to Home Screen only | ✅ Full support |
| Service Worker | ✅ Full support | ⚠️ Limited | ✅ Full support |
| WebSocket | ✅ Full support | ✅ Full support | ✅ Full support |
| Offline Mode | ✅ Full support | ⚠️ Limited | ✅ Full support |

### File Structure

```
mobile-app/
├── index.html              # Main app page
├── styles.css             # Mobile-first styling
├── app.js                 # App logic & WebSocket
├── manifest.json          # PWA manifest
├── service-worker.js      # Service worker for offline
├── icons/
│   ├── icon-192.png      # PWA icon (192x192)
│   ├── icon-512.png      # PWA icon (512x512)
│   ├── ICONS_README.txt  # Icon customization guide
│   └── generate-placeholders.js  # Icon generator script
└── README.md             # This file
```

### Network Requirements

- **Same WiFi Network**: Phone and PC must be on the same local network
- **Ports**:
  - `8080` - Backend WebSocket server
  - `3000` - HTTP server for PWA (development)
- **Firewall**: Must allow incoming connections on both ports

### Security Considerations

- **Local Network Only**: The app is designed for local network use
- **No Authentication**: Currently no authentication (trust-based local network)
- **No Encryption**: WebSocket uses `ws://` not `wss://` (local network)
- **No Data Collection**: App doesn't collect or transmit any personal data

For production use outside local network:
- Consider adding authentication
- Use `wss://` (WebSocket Secure)
- Set up proper HTTPS/SSL certificates

## Customization

### Changing Server Port

If you need to use a different port:

1. Update backend server port in `backend/index.js`
2. Update the default in `mobile-app/app.js`:
   ```javascript
   const DEFAULT_SERVER = 'ws://localhost:YOUR_PORT';
   ```

### Custom Icons

Replace placeholder icons with your own:

1. Create 192x192 and 512x512 PNG images
2. Replace `icons/icon-192.png` and `icons/icon-512.png`
3. See `icons/ICONS_README.txt` for design guidelines
4. Clear cache and service worker, reload app

### Theming

To change the color scheme:

1. Edit CSS variables in `styles.css`:
   ```css
   :root {
     --primary-color: #667eea;  /* Change to your color */
     --background-dark: #1a1a2e;
   }
   ```

2. Update `manifest.json`:
   ```json
   {
     "theme_color": "#667eea",
     "background_color": "#1a1a2e"
   }
   ```

## Contributing

Found a bug? Have a feature request?

1. Check existing issues
2. Open a new issue with details
3. Or submit a pull request!

## License

This is part of the Phone Video Remote project.
See the main LICENSE file for details.

## Credits

Built with ❤️ for people who refuse to get up from the couch.

---

**Need more help?** Check the main project README or open an issue on GitHub!
