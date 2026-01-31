# Progressive Web App (PWA) Implementation Guide

This document outlines the PWA approach used in Galaxy of Numbers, which can be applied to other web applications.

## What is a PWA?

A Progressive Web App is a web application that uses modern web technologies to deliver app-like experiences. Key features:

- **Installable** - Users can add it to their home screen like a native app
- **Offline capable** - Works without internet connection (after first load)
- **No app store required** - Distributed via URL, no Apple/Google approval needed
- **Auto-updates** - Updates automatically when you deploy new code
- **Cross-platform** - Single codebase works on iOS, Android, and desktop

## Platform Compatibility

| Platform | Install Method | Offline Support | Notes |
|----------|---------------|-----------------|-------|
| **iOS Safari** | "Add to Home Screen" | Yes | Must use Safari (not Chrome/Firefox) |
| **Android Chrome** | Install prompt or menu | Yes | Full PWA support |
| **Android Firefox** | "Add to Home Screen" | Yes | Good support |
| **Desktop Chrome** | Install button in address bar | Yes | Full support |
| **Desktop Edge** | Install button in address bar | Yes | Full support |
| **Desktop Safari** | Limited | Yes | No install prompt |

**Android has better PWA support than iOS** - Android shows install prompts, supports more features like push notifications, and doesn't require a specific browser.

## Tech Stack Used

```
vite                  - Build tool
vite-plugin-pwa       - PWA plugin (generates service worker & manifest)
workbox               - Service worker library (included by vite-plugin-pwa)
```

## Implementation Steps

### 1. Install Dependencies

```bash
npm install -D vite-plugin-pwa
```

### 2. Configure Vite (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/your-repo-name/',  // For GitHub Pages subdirectory
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',  // Auto-update when new version deployed
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Your App Name',
        short_name: 'App',
        description: 'Your app description',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',        // Hides browser UI
        orientation: 'portrait',      // Lock orientation (optional)
        start_url: '/your-repo-name/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'  // For Android adaptive icons
          }
        ]
      },
      workbox: {
        // Cache all static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Optional: cache external resources
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ],
})
```

### 3. Create App Icons

You need at minimum:
- `public/icons/icon-192.png` (192x192 pixels)
- `public/icons/icon-512.png` (512x512 pixels)

Tools to generate icons from a source image:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

### 4. Deploy to GitHub Pages

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

Then enable GitHub Pages in your repo settings (Settings > Pages > Source: GitHub Actions).

### 5. Handle Client-Side Routing

If using React Router or similar, add basename for GitHub Pages:

```typescript
// For GitHub Pages subdirectory deployment
<BrowserRouter basename="/your-repo-name">
  {/* routes */}
</BrowserRouter>
```

## Offline Data Storage

For offline-first apps, use IndexedDB (not localStorage):

```bash
npm install dexie  # IndexedDB wrapper
```

```typescript
import Dexie from 'dexie';

class MyDatabase extends Dexie {
  items!: Table<Item, string>;

  constructor() {
    super('MyAppDatabase');
    this.version(1).stores({
      items: 'id, name, createdAt'
    });
  }
}

export const db = new MyDatabase();
```

## Key Differences: PWA vs Native App

| Aspect | PWA | Native App |
|--------|-----|------------|
| Distribution | URL (instant) | App Store (review process) |
| Updates | Automatic on deploy | User must update |
| Installation | Optional | Required |
| Storage | ~50MB typical limit | Unlimited |
| Hardware access | Limited (no Bluetooth on iOS) | Full |
| Push notifications | Android yes, iOS limited | Full |
| Development | Single codebase | Per-platform |
| Cost | Free hosting available | $99/yr Apple, $25 Google |

## When to Use PWA

**Good fit:**
- Content/utility apps
- Apps needing quick deployment
- Cross-platform with single codebase
- Apps that work offline with cached data
- Prototypes and MVPs

**Consider native instead:**
- Games requiring high performance
- Apps needing deep hardware integration
- Apps requiring push notifications on iOS
- Apps needing background processing

## Testing PWA Features

1. **Chrome DevTools** > Application tab shows:
   - Service Worker status
   - Cache contents
   - Manifest validation

2. **Lighthouse audit** (in DevTools) checks PWA compliance

3. **Test offline**: DevTools > Network > Offline checkbox

## Common Issues

1. **iOS caching issues**: Users may need to clear Safari website data when you deploy breaking changes to the database schema

2. **Service worker not updating**: The `autoUpdate` setting helps, but users may need to close all tabs and reopen

3. **Icons not showing on iOS**: Ensure icons are PNG format and properly sized

## Resources

- [web.dev PWA guide](https://web.dev/progressive-web-apps/)
- [Vite PWA plugin docs](https://vite-pwa-org.netlify.app/)
- [Workbox documentation](https://developer.chrome.com/docs/workbox/)
