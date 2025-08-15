import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handling
window.onerror = (message, source, lineno, colno, error) => {
  console.error('🚨 Global Error:', { message, source, lineno, colno, error });
  return false;
};

window.onunhandledrejection = (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
};

createRoot(document.getElementById("root")!).render(<App />);
