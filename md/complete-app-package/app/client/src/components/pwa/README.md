# SquidJob PWA Implementation

## Overview

This directory contains the complete Progressive Web App (PWA) implementation for the SquidJob Tender Management System. The PWA provides offline functionality, mobile-first design, and native app-like experience.

## Features

### Core PWA Capabilities
- **Offline Functionality**: Work without internet connection
- **App Installation**: Install on home screen across devices
- **Push Notifications**: Real-time updates and alerts
- **Background Sync**: Automatic data synchronization
- **Service Worker**: Advanced caching strategies
- **IndexedDB**: Local data storage

### Mobile-First Features
- **Touch-Friendly Interface**: Optimized for mobile devices
- **Swipe Gestures**: Intuitive navigation patterns
- **Mobile Navigation**: Bottom navigation bar
- **Responsive Design**: Adapts to all screen sizes
- **Touch Targets**: Minimum 44px touch areas

### Offline Capabilities
- **Critical Data Caching**: Essential resources cached
- **Queue-Based Sync**: Offline actions queued for sync
- **Conflict Resolution**: Smart data merging
- **Offline-First Architecture**: Works without connection
- **Progressive Data Loading**: Smart caching policies
- **Connection State Management**: Real-time status updates

## File Structure

```
pwa/
├── hooks/
│   ├── use-pwa.ts              # Main PWA hook
│   └── use-offline-storage.ts  # Offline storage hook
├── components/
│   ├── pwa-provider.tsx        # PWA context provider
│   ├── pwa-status-bar.tsx      # Status indicator
│   ├── mobile-navigation.tsx   # Mobile navigation
│   ├── offline-fallback.tsx    # Offline page
│   └── index.ts                # Main exports
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   ├── offline.html            # Offline fallback
│   └── browserconfig.xml       # Windows tile config
└── README.md                   # This documentation
```

## Installation

### 1. Add PWA Provider to App

```tsx
import { PWAProvider } from './components/pwa';

function App() {
  return (
    <PWAProvider>
      <YourAppContent />
    </PWAProvider>
  );
}
```

### 2. Use PWA Hooks

```tsx
import { usePWA, useOfflineStorage } from './components/pwa';

function MyComponent() {
  const [pwaState, pwaActions] = usePWA();
  const [storageState, storageActions] = useOfflineStorage();

  // Check if online
  if (!pwaState.isOnline) {
    return <div>You're offline</div>;
  }

  // Install app
  const handleInstall = () => {
    pwaActions.installApp();
  };

  return (
    <div>
      {pwaState.canInstall && (
        <button onClick={handleInstall}>Install App</button>
      )}
    </div>
  );
}
```

### 3. Add PWA Components

```tsx
import { 
  PWAStatusBar, 
  MobileNavigation, 
  PWAInstallButton,
  PWASyncButton 
} from './components/pwa';

function Layout() {
  return (
    <div>
      <PWAStatusBar />
      <main>{children}</main>
      <MobileNavigation />
      <PWAInstallButton />
      <PWASyncButton />
    </div>
  );
}
```

## Configuration

### PWA Manifest

The `manifest.json` file configures the PWA appearance and behavior:

```json
{
  "name": "SquidJob Tender Management",
  "short_name": "SquidJob",
  "description": "Professional tender management system",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#7c3aed",
  "background_color": "#ffffff",
  "icons": [...],
  "shortcuts": [...]
}
```

### Service Worker

The service worker (`sw.js`) handles:
- Caching strategies
- Offline functionality
- Background sync
- Push notifications
- Update management

### Cache Strategies

1. **Static Assets**: Cache-first for CSS, JS, images
2. **API Requests**: Network-first with cache fallback
3. **Navigation**: Network-first with offline page fallback
4. **Dynamic Content**: Stale-while-revalidate

## Usage Examples

### Basic PWA Integration

```tsx
import { PWAProvider, usePWAContext } from './components/pwa';

function App() {
  return (
    <PWAProvider>
      <Dashboard />
    </PWAProvider>
  );
}

function Dashboard() {
  const { isOnline, canInstall, installApp } = usePWAContext();

  return (
    <div>
      <h1>Dashboard</h1>
      {!isOnline && <div>Working offline</div>}
      {canInstall && (
        <button onClick={installApp}>Install App</button>
      )}
    </div>
  );
}
```

### Offline Data Management

```tsx
import { useOfflineStorage } from './components/pwa';

function TenderForm() {
  const [storageState, storageActions] = useOfflineStorage();

  const saveTender = async (tenderData) => {
    try {
      // Try to save to server
      await api.saveTender(tenderData);
    } catch (error) {
      // Save offline if network fails
      await storageActions.setItem(`tender_${Date.now()}`, {
        type: 'tender',
        data: tenderData,
        timestamp: Date.now()
      });
    }
  };

  return (
    <form onSubmit={saveTender}>
      {/* Form fields */}
    </form>
  );
}
```

### Mobile Navigation

```tsx
import { MobileNavigation } from './components/pwa';

function App() {
  return (
    <div>
      <main>{children}</main>
      <MobileNavigation />
    </div>
  );
}
```

## API Reference

### usePWA Hook

```tsx
const [state, actions] = usePWA();
```

**State Properties:**
- `isOnline`: Boolean - Network connection status
- `isInstalled`: Boolean - App installation status
- `canInstall`: Boolean - Installation availability
- `isUpdateAvailable`: Boolean - Update availability
- `syncStatus`: 'idle' | 'syncing' | 'completed' | 'error'
- `offlineData`: Array - Pending offline data

**Actions:**
- `installApp()`: Install the PWA
- `checkForUpdates()`: Check for app updates
- `syncOfflineData()`: Sync offline data
- `clearOfflineData()`: Clear offline data
- `requestNotificationPermission()`: Request notification permission
- `sendNotification(title, options)`: Send notification

### useOfflineStorage Hook

```tsx
const [state, actions] = useOfflineStorage();
```

**State Properties:**
- `isAvailable`: Boolean - IndexedDB availability
- `isInitialized`: Boolean - Storage initialization status
- `storageSize`: Number - Total storage size in bytes
- `itemCount`: Number - Total stored items

**Actions:**
- `setItem(key, value)`: Store data
- `getItem(key)`: Retrieve data
- `removeItem(key)`: Remove data
- `clear()`: Clear all data
- `getAllKeys()`: Get all storage keys
- `getStorageInfo()`: Get storage statistics

### PWAProvider Component

```tsx
<PWAProvider 
  showStatusBar={true}
  showMobileNav={true}
>
  {children}
</PWAProvider>
```

**Props:**
- `showStatusBar`: Boolean - Show PWA status bar
- `showMobileNav`: Boolean - Show mobile navigation
- `children`: ReactNode - App content

### PWAStatusBar Component

```tsx
<PWAStatusBar 
  className="custom-class"
  showDetails={true}
/>
```

**Props:**
- `className`: String - Custom CSS classes
- `showDetails`: Boolean - Show detailed status info

### MobileNavigation Component

```tsx
<MobileNavigation className="custom-class" />
```

**Features:**
- Bottom navigation bar
- Swipe gestures
- Touch-friendly interface
- PWA status indicators

### OfflineFallback Component

```tsx
<OfflineFallback className="custom-class" />
```

**Features:**
- Offline status display
- Available actions list
- Data summary
- Connection tips

## Styling

### PWA CSS Classes

```css
/* Install prompt */
.pwa-install-prompt
.pwa-install-content
.pwa-install-btn
.pwa-dismiss-btn

/* Offline indicator */
.offline-indicator
.offline-content

/* Mobile navigation */
.mobile-navigation

/* PWA status bar */
.pwa-status-bar

/* Touch-friendly buttons */
.touch-button

/* Swipe gestures */
.swipe-container

/* PWA splash screen */
.pwa-splash
.pwa-splash-logo
.pwa-splash-title
.pwa-splash-subtitle
```

### Responsive Design

The PWA is designed with mobile-first approach:

```css
/* Mobile styles */
@media (max-width: 768px) {
  .mobile-navigation {
    display: block;
  }
}

/* Touch targets */
.touch-button {
  min-height: 44px;
  min-width: 44px;
}
```

## Testing

### PWA Testing Checklist

- [ ] Service Worker Registration
- [ ] Offline Functionality
- [ ] App Installation
- [ ] Push Notifications
- [ ] Background Sync
- [ ] Cache Strategies
- [ ] Mobile Responsiveness
- [ ] Touch Interactions
- [ ] Performance Metrics

### Lighthouse PWA Audit

Run Lighthouse audit to check PWA compliance:

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse https://your-app.com --view
```

### Manual Testing

1. **Offline Testing:**
   - Disconnect network
   - Verify offline functionality
   - Test data persistence

2. **Installation Testing:**
   - Test install prompt
   - Verify app installation
   - Check launch behavior

3. **Sync Testing:**
   - Create offline data
   - Reconnect network
   - Verify sync completion

## Performance

### Optimization Tips

1. **Service Worker:**
   - Use appropriate cache strategies
   - Implement efficient cache cleanup
   - Optimize cache size

2. **IndexedDB:**
   - Use transactions efficiently
   - Implement proper error handling
   - Monitor storage usage

3. **Mobile Performance:**
   - Minimize bundle size
   - Optimize images
   - Use lazy loading

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## Security

### Best Practices

1. **HTTPS Only:**
   - PWA requires HTTPS
   - Service Worker requires secure context

2. **Content Security Policy:**
   - Implement CSP headers
   - Restrict resource loading

3. **Data Protection:**
   - Encrypt sensitive data
   - Implement proper access controls

## Browser Support

### Supported Browsers

- **Chrome**: 67+
- **Firefox**: 67+
- **Safari**: 11.1+
- **Edge**: 79+

### Feature Detection

```tsx
// Check PWA support
if ('serviceWorker' in navigator) {
  // PWA supported
}

// Check IndexedDB support
if ('indexedDB' in window) {
  // Offline storage supported
}

// Check notification support
if ('Notification' in window) {
  // Push notifications supported
}
```

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering:**
   - Check HTTPS requirement
   - Verify file path
   - Check browser console

2. **Offline Data Not Syncing:**
   - Check IndexedDB availability
   - Verify sync registration
   - Check network connectivity

3. **Install Prompt Not Showing:**
   - Check manifest.json
   - Verify HTTPS requirement
   - Check user engagement

### Debug Tools

1. **Chrome DevTools:**
   - Application tab for PWA debugging
   - Service Worker debugging
   - Storage inspection

2. **Firefox DevTools:**
   - Application tab
   - Service Worker debugging
   - Storage inspection

## Deployment

### Build Configuration

```json
{
  "scripts": {
    "build": "vite build",
    "build:pwa": "vite build && workbox generateSW"
  }
}
```

### Server Configuration

```nginx
# Nginx configuration
location / {
    try_files $uri $uri/ /index.html;
}

# Cache headers for PWA
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Contributing

### Development Guidelines

1. **Code Style:**
   - Use TypeScript
   - Follow ESLint rules
   - Write unit tests

2. **PWA Standards:**
   - Follow PWA guidelines
   - Implement proper error handling
   - Ensure accessibility

3. **Testing:**
   - Test on multiple devices
   - Verify offline functionality
   - Check performance metrics

## License

This PWA implementation is part of the SquidJob Tender Management System and follows the same license terms.

## Support

For PWA-related issues or questions, please refer to:
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) 