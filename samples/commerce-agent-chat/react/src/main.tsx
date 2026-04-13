import React from 'react';
import ReactDOM from 'react-dom/client';
import '@coveo/commerce-agent-chat-components/register';

import {App} from './App.js';
import '@core/styles/base.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
