import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { suppressResizeObserverErrors } from './utils/errorHandler'
import { QueryProvider } from './providers/QueryProvider'

// Gestisci errori ResizeObserver
suppressResizeObserverErrors();

// Global error handling
window.onerror = (message, source, lineno, colno, error) => {
  // Sopprimi errori ResizeObserver
  if (typeof message === 'string' && message.includes('ResizeObserver loop completed')) {
    return true; // Previeni log dell'errore
  }
  console.error('🚨 Global Error:', { message, source, lineno, colno, error });
  return false;
};

window.onunhandledrejection = (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
};

// Register simplified service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Unregister old service worker first
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    }).then(() => {
      // Register new simplified service worker
      return navigator.serviceWorker.register('/sw-simple.js');
    }).then((registration) => {
      console.log('✅ Simplified SW registered:', registration);
      
      // Clear old caches
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            if (cacheName.includes('workbox') || cacheName.includes('v1')) {
              caches.delete(cacheName);
            }
          });
        });
      }
    }).catch((registrationError) => {
      console.log('❌ SW registration failed:', registrationError);
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <App />
  </QueryProvider>
);
