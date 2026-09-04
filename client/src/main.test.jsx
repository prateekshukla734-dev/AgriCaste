import React from 'react'
import { createRoot } from 'react-dom/client'

console.log('main.jsx is executing');

function TestApp() {
  console.log('TestApp component rendering');
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
      <h1>Test - React is Working!</h1>
      <p>If you see this, React is mounting correctly.</p>
    </div>
  );
}

const root = document.getElementById('root');
console.log('Root element:', root);

if (root) {
  console.log('Creating React root...');
  createRoot(root).render(<TestApp />);
} else {
  console.error('Root element not found!');
}