import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { suppressResizeObserverErrors } from './utils/errorHandler'

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

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
