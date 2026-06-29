import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './lib/auth/supabaseAuth';
import SentryErrorBoundary from './components/SentryErrorBoundary';
import { initSentry } from './lib/sentry/config';
import './styles.css';
import { initAudioCache } from './lib/audioPrecache';

initAudioCache();
initSentry();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SentryErrorBoundary>
  </React.StrictMode>,
);

