import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from '@/components/Router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  </React.StrictMode>
);

