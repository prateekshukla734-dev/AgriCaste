import React from 'react'
import { createRoot } from 'react-dom/client'

function SimpleTest() {
  return React.createElement('div', {
    style: {
      padding: '50px',
      backgroundColor: '#4ade80',
      color: 'white',
      fontSize: '24px',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }
  }, [
    React.createElement('h1', { key: 'title' }, '🌾 Agricast - React is Working!'),
    React.createElement('p', { key: 'time' }, `Successfully mounted at: ${new Date().toLocaleTimeString()}`),
    React.createElement('div', { key: 'next' }, 'Ready to load full application...')
  ]);
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(React.createElement(SimpleTest));
} else {
  console.error('Root element not found');
}