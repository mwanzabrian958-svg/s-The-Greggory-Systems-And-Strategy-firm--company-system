import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider>
              <HashRouter>
                <React.Suspense
                  fallback={
                    <div
                      style={{
                        background: '#00122B',
                        color: '#60A5FA',
                        height: '100vh',
                        width: '100vw',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'monospace',
                        letterSpacing: '0.5em',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Synchronizing Systems...
                    </div>
                  }
                >
                  <App />
                </React.Suspense>
              </HashRouter>
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </React.StrictMode>,
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Error';
    console.error('Critical UI Failure:', err);
    rootElement.innerHTML = `<div style="background:#00122B; color:#60A5FA; padding:40px; font-family:monospace; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
      <h1 style="font-size:14px; letter-spacing:4px; margin-bottom:20px;">SYSTEM FAILURE: NODE CRASH</h1>
      <p style="font-size:10px; opacity:0.6; max-width:600px; line-height:2;">${message}</p>
      <div style="margin-top:40px; border:1px solid #60A5FA; padding:10px 20px; font-size:8px; cursor:pointer;" onclick="window.location.reload()">RE-INITIALIZE HANDSHAKE</div>
    </div>`;
  }
}
