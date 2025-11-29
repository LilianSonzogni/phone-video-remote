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
- Works with YouTube, Netflix, Crunchyroll, Prime Video, Disney+, and more
- No window focus stealing - your video stays front and center
- Real-time WebSocket communication for instant response

### Planned
- Skip forward/backward (10 seconds)
- Volume control
- Multi-device support (control multiple PCs from one phone)
- Speed control (playback rate adjustment)
- Picture-in-picture toggle
- Fullscreen toggle

## Project Status

**Work in Progress - Backend complete, extension and mobile app coming soon**

- [x] Backend WebSocket server
- [ ] Browser extension
- [ ] Mobile PWA
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

2. **Browser Extension** (Coming Soon)
   - Listens for commands from the backend
   - Controls video playback on streaming sites
   - Works in the background without stealing focus

3. **Mobile App (PWA)** (Coming Soon)
   - Touch-friendly interface
   - Connects to your PC's backend
   - Sends playback commands
   - Works on any phone with a modern browser

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
- A modern browser (Chrome, Edge, or any Chromium-based browser)
- A smartphone with a modern browser

### Quick Start

Detailed installation instructions coming soon! For now, you can set up the backend:

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/phone-video-remote.git
   cd phone-video-remote
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   npm start
   ```

3. The server will start on `http://localhost:8080`

More detailed instructions for the extension and mobile app will be added as those components are developed.

## Development Roadmap

### Phase 1: MVP (Current)
- [x] Backend server with WebSocket support
- [ ] Basic browser extension with play/pause
- [ ] Simple mobile web interface

### Phase 2: Enhanced Controls
- [ ] Skip forward/backward
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

- **Report Bugs**: Found something broken? [Open an issue](https://github.com/yourusername/phone-video-remote/issues)
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
- **Extension**: Vanilla JavaScript, Chrome Extension API
- **Mobile**: Progressive Web App (HTML5, CSS3, JavaScript)

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
- Search [existing issues](https://github.com/yourusername/phone-video-remote/issues)
- Open a [new issue](https://github.com/yourusername/phone-video-remote/issues/new)

## Acknowledgments

Built by developers who refuse to get up from the couch. Powered by laziness and WebSockets.

## Disclaimer

This project is for personal use. Please respect the terms of service of streaming platforms you use. This tool does not bypass any DRM, paywalls, or access controls - it simply provides a remote control interface for videos you're already authorized to watch.

---

Made with coffee and excessive comfort by [Lilian Sonzogni](https://github.com/yourusername)
