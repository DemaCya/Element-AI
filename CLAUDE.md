# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chinese-language 3D astronomical visualization project called "星盘宇宙" (Astrological Universe) built with Three.js. It creates an interactive 3D star system with five elements (五行) representing Chinese astrology elements: 金 (Metal), 木 (Wood), 水 (Water), 火 (Fire), and 土 (Earth).

## Architecture

The application consists of:
- **index.html** - Main entry point with Chinese UI and Three.js CDN loading
- **css/style.css** - Styling with loading animations and responsive design
- **js/main.js** - Application initialization and entry point
- **js/starSystem.js** - Core 3D visualization logic (main class: StarSystem)
- **js/controls.js** - UI controls framework (class: UIControls)

## Key Components

### StarSystem Class (js/starSystem.js:2)
- Manages the entire 3D scene with camera, renderer, and lighting
- Creates orbiting planets representing the five elements
- Handles mouse interactions for scene rotation and orbit highlighting
- Manages sprite-based planet representations with texture loading
- Implements smooth animations and transitions

### Five Elements Configuration
Each element has properties: name, color, orbit radius, rotation speed, size, and texture path. All currently reference the same texture file at `assets/images/1024.png`.

### Visual Features
- 3D starfield background with fog effects
- Central glowing star with aura effect
- Orbital paths with hover highlighting
- Billboard sprites for planets that always face the camera
- Responsive design that works on mobile devices

## Development Commands

Since this is a vanilla JavaScript project without a build system:
- **Development**: Open `index.html` directly in a web browser
- **Testing**: Manual testing through browser interaction
- **Linting**: No automated linting configured

## File Structure
```
/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Application styles
├── js/
│   ├── main.js         # Application entry point
│   ├── starSystem.js   # Core 3D visualization
│   └── controls.js     # UI controls framework
└── assets/
    └── images/
        └── 1024.png    # Planet texture
```

## Dependencies
- Three.js r128 (loaded from CDN)
- No npm package.json - vanilla JavaScript project

## Notes
- The application uses Chinese language throughout the UI
- All planet textures currently point to the same image file
- Mouse interactions control scene rotation and highlight orbital paths
- The project is designed to run without a build process or server