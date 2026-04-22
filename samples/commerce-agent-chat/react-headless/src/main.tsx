import React from 'react';
import ReactDOM from 'react-dom/client';
import '@coveo/commerce-agent-chat-components/register';

import './base.css';
import './App.css';
import {App} from './App.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
