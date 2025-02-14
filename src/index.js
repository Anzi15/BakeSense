import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import StandardLayout from './layouts/StandardLayout';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StandardLayout>
    <App />
    </StandardLayout>
  </React.StrictMode>
);

