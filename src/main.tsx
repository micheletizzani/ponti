import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/atkinson-hyperlegible/400-italic.css';
import '@fontsource-variable/lexend';
import './index.css';
import App from './App';

const container = document.getElementById('root');
if (!container) throw new Error('Root element non trovato');

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// PWA: attivo solo nel build di produzione, per non interferire con il dev server.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* offline resta opzionale: nessun errore bloccante per l'utente */
    });
  });
}
