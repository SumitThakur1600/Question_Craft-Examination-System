import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Use createRoot from 'react-dom/client' to render your App component
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
