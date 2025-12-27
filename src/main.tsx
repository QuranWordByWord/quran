import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
