import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Purgar cachés antiguas que interceptaban peticiones de Supabase
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((names) => {
    for (const name of names) {
      if (name !== 'rekayu-cache-v2') {
        caches.delete(name);
      }
    }
  });
}

// Registrar Service Worker para soporte PWA offline y modo app en producción
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Manejar silenciosamente
    });
  });
}

