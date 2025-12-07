# Phone Video Remote

**Control video playback on your PC from your phone - for the truly lazy**

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## Why Does This Exist?

We've all been there: you're comfortably settled on the couch, wrapped in blankets, perfectly positioned, and then... you need to pause the video. Getting up to reach the keyboard? Absolutely not. Moving the mouse without disrupting your cozy setup? Impossible.

This project was born from pure, justified laziness. Why should I interrupt my binge-watching session just to pause, play, or skip ahead? My phone is already in my hand anyway.

So here we are: a remote control for your PC's video player, accessible from your phone, that works with all major streaming platforms. Because sometimes the best solutions come from refusing to move.

## Features

### Current
- Play/pause video playback
- Skip forward/backward (10 seconds)
- Works with YouTube, Netflix, Crunchyroll, Prime Video, Disney+, and more
- No window focus stealing - your video stays front and center
- Real-time WebSocket communication for instant response
- Browser extension for Edge, Chrome, Opera, and Firefox

### Planned
- Volume control
- Multi-device support (control multiple PCs from one phone)
- Speed control (playback rate adjustment)
- Picture-in-picture toggle
- Fullscreen toggle

## Project Status

**✅ MVP Complete - All core components ready!**

- [x] Backend WebSocket server
- [x] Browser extension (Edge, Chrome, Opera, Firefox)
- [x] Mobile PWA (Progressive Web App)
- [ ] Multi-device support
- [ ] Advanced controls

## How It Works

Phone Video Remote consists of three components that work together:

```
┌─────────────┐          ┌─────────────┐          ┌──────────────────┐
│             │          │             │          │                  │
│  Mobile App │ ───────→ │   Backend   │ ───────→ │ Browser Extension│
│    (PWA)    │ WebSocket│  (Node.js)  │ WebSocket│   (Chrome/Edge)  │
│             │          │             │          │                  │
└─────────────┘          └─────────────┘          └──────────────────┘
     Your Phone          Your PC (Server)         Your Browser
```

### Components

1. **Backend (Node.js + WebSocket)**
   - Acts as a communication hub
   - Runs on your PC
   - Broadcasts commands between devices
   - [See backend README](./backend/README.md)

2. **Browser Extension** ✅
   - Listens for commands from the backend
   - Controls video playback on streaming sites
   - Works in the background without stealing focus
   - Supports Edge, Chrome, Opera, and Firefox
   - [See extension README](./extension/README.md)

3. **Mobile App (PWA)** ✅
   - Touch-friendly interface optimized for phones
   - Connects to your PC's backend via WebSocket
   - Sends playback commands (play, pause, skip)
   - Installable on home screen (app-like experience)
   - Works offline, dark theme, haptic feedback
   - [See mobile app README](./mobile-app/README.md)

## Architecture Details

The system uses WebSocket connections for real-time, bidirectional communication:

1. You tap a button on your phone (e.g., "Pause")
2. The mobile app sends a command to the backend via WebSocket
3. The backend broadcasts this command to all connected clients
4. The browser extension receives the command
5. The extension controls the video player without stealing focus
6. All of this happens in milliseconds

**Why WebSocket?** Unlike HTTP requests, WebSocket provides persistent connections with minimal latency, making controls feel instant and responsive.

## Installation

### Prerequisites

- Node.js 14.0.0 or higher
- A supported browser:
  - Microsoft Edge
  - Google Chrome
  - Opera
  - Mozilla Firefox
- A smartphone with a modern browser (for future mobile app)

### Quick Start

1. **Clone this repository:**
   ```bash
   git clone https://github.com/LilianSonzogni/phone-video-remote.git
   cd phone-video-remote
   ```

2. **Set up and start the backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```

   The server will start on `ws://localhost:8080`

3. **Install the browser extension:**

   **For Chrome/Edge/Opera:**
   - Open `chrome://extensions` (or `edge://extensions`)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `/extension` folder from this project

   **For Firefox:**
   - Open `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on..."
   - Select `manifest.json` from the `/extension` folder

   📖 [Detailed extension installation guide](./extension/README.md)

4. **Verify the connection:**
   - Click the extension icon in your browser toolbar
   - You should see "Connected ✅"
   - If disconnected, ensure the backend server is running

5. **Set up the mobile app:**

   **Start a development server** (one-time setup):
   ```bash
   cd mobile-app
   npx http-server -p 3000
   ```

   **On your phone**, install the PWA:
   - **Android**: Navigate to `http://YOUR_PC_IP:3000`, tap "Install" when prompted
   - **iOS**: Navigate to `http://YOUR_PC_IP:3000`, tap Share → "Add to Home Screen"

   📖 [Detailed mobile app installation guide](./mobile-app/README.md)

6. **Connect and control:**
   - Open the PWA on your phone
   - Enter server address: `ws://YOUR_PC_IP:8080`
   - Tap "Connect"
   - Open a video site (YouTube, Netflix, etc.)
   - Control from your phone!

## Complete Usage Workflow

Once everything is set up, here's your daily routine:

### On Your PC:
1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the mobile app server (if not permanent):
   ```bash
   cd mobile-app
   npx http-server -p 3000
   ```

3. Open your browser with the extension installed
4. Navigate to any supported video site
5. Start watching!

### On Your Phone:
1. Open the Phone Video Remote app (from home screen)
2. Tap "Connect" (server address is remembered)
3. Control your videos with large, touch-friendly buttons
4. Enjoy not having to get up! 🎉

### Supported Video Sites:
- ✅ **YouTube** - Full support (direct video control)
- ✅ **Netflix** - Full support (direct video control)
- ✅ **Crunchyroll** - Full support (keyboard events with video focus)
- ✅ **Amazon Prime Video** - Full support (ghost filtering + command throttling)
- ✅ **Disney+** - Full support (keyboard events with video focus)

Want to add more? Edit `extension/manifest.json` and add the site URL!

### Notes

- **Icons** - Placeholder icons are included. See `/extension/icons/` and `/mobile-app/icons/` for customization
- **Same Network** - Phone and PC must be on the same WiFi
- **Firewall** - Make sure ports 8080 and 3000 are allowed

## Development Roadmap

### Phase 1: MVP ✅ COMPLETE
- [x] Backend server with WebSocket support
- [x] Browser extension with play/pause/skip controls
- [x] Mobile PWA with touch-friendly interface

### Phase 2: Enhanced Controls
- [x] Skip forward/backward (10 seconds)
- [ ] Volume control
- [ ] Speed adjustment
- [ ] Better mobile UI/UX

### Phase 3: Advanced Features
- [ ] Multi-device support
- [ ] Connection management
- [ ] Settings persistence
- [ ] Keyboard shortcuts on mobile

### Phase 4: Polish
- [ ] PWA installation prompts
- [ ] Offline support
- [ ] Better error messages
- [ ] Usage analytics (local only)

## Contributing

This is an open-source project, and contributions are welcome! Here's how you can help:

### Ways to Contribute

- **Report Bugs**: Found something broken? [Open an issue](https://github.com/LilianSonzogni/phone-video-remote/issues)
- **Suggest Features**: Have ideas for improvements? We'd love to hear them!
- **Submit Pull Requests**: Code contributions are always appreciated
- **Improve Documentation**: Help make the docs clearer and more comprehensive
- **Test on Different Platforms**: Try it on different browsers, devices, and streaming sites

### Development Guidelines

- Write clean, commented code (in English)
- Follow existing code style and conventions
- Test your changes thoroughly
- Update documentation as needed
- Keep commits focused and descriptive

### Getting Started with Development

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Technical Stack

- **Backend**: Node.js, Express, WebSocket (ws library)
- **Extension**: Vanilla JavaScript, Chrome Extension API (Manifest V3)
- **Mobile**: Progressive Web App (PWA) - Vanilla HTML5, CSS3, JavaScript
  - Service Worker for offline functionality
  - Web App Manifest for installation
  - localStorage for settings persistence

## License

This project is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.

**What this means:**
- You can use, modify, and share this project
- You must give appropriate credit
- You cannot use it for commercial purposes
- If you remix or build upon it, you must distribute under the same license

See the [LICENSE](./LICENSE) file for details.

## Support

Having trouble? Here are some resources:

- Check the [backend documentation](./backend/README.md)
- Check the [extension documentation](./extension/README.md)
- Check the [mobile app documentation](./mobile-app/README.md)
- Search [existing issues](https://github.com/LilianSonzogni/phone-video-remote/issues)
- Open a [new issue](https://github.com/LilianSonzogni/phone-video-remote/issues/new)

## Acknowledgments

Built by developers who refuse to get up from the couch. Powered by laziness and WebSockets.

## Disclaimer

This project is for personal use. Please respect the terms of service of streaming platforms you use. This tool does not bypass any DRM, paywalls, or access controls - it simply provides a remote control interface for videos you're already authorized to watch.

---

Made with coffee and excessive comfort by [Lilian Sonzogni](https://github.com/LilianSonzogni)
