import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { SplashScreen } from './components/SplashScreen.tsx'
import { installApiCache } from './utils/apiCache'

// Install API cache interceptor for quranhub API (used by mushaf renderer)
// This provides instant caching in both dev and production
installApiCache()

// Register service worker for offline support
registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      window.location.reload()
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

/**
 * Determines if the custom splash screen should be shown.
 * Shows splash screen when:
 * - First visit to intro page (/page/1) in the session (desktop or mobile)
 * - Installed PWA launched to home in standalone mode
 * - Never shows twice in the same session
 */
function shouldShowSplash(): boolean {
  // Check if already shown this session
  if (sessionStorage.getItem('splash-shown')) {
    return false
  }

  // Check if navigating to intro page
  const path = window.location.pathname.replace('/quran', '');
  const isIntroPage = path === '' || path === '/' || path === '/page/1';

  // Show splash on first visit to intro page (any platform)
  return isIntroPage;
}

function Root() {
  const [showSplash, setShowSplash] = useState(() => shouldShowSplash())

  const handleSplashComplete = () => {
    sessionStorage.setItem('splash-shown', 'true')
    setShowSplash(false)
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <App />
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
