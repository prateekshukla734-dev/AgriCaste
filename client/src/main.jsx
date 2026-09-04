import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Agricast Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: { padding: '20px', background: '#fee', color: '#c00', fontSize: '16px' }
      }, [
        React.createElement('h2', { key: 'title' }, '🌾 Agricast - Component Error'),
        React.createElement('p', { key: 'msg' }, 'Error: ' + (this.state.error?.message || 'Unknown error')),
        React.createElement('button', { 
          key: 'reload',
          onClick: () => window.location.reload(),
          style: { padding: '10px', marginTop: '10px' }
        }, 'Reload App')
      ]);
    }

    return this.props.children;
  }
}

try {
  createRoot(document.getElementById('root')).render(
    React.createElement(StrictMode, null,
      React.createElement(ErrorBoundary, null,
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(BrowserRouter, null,
            React.createElement(App)
          )
        )
      )
    )
  );
} catch (error) {
  console.error('Failed to render Agricast app:', error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; background: #fee; color: #c00; font-size: 16px;">
        <h2>🌾 Agricast - Startup Error</h2>
        <p>Failed to start application: ${error.message}</p>
        <button onclick="window.location.reload()" style="padding: 10px; margin-top: 10px;">Reload App</button>
      </div>
    `;
  }
}
