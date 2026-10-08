import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import '../../demo-schema-react/src/index.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
