import ReactDOM from 'react-dom/client';
import {MantineProvider} from '@mantine/core';
import App from './App.js';
import '@mantine/core/styles.css';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <MantineProvider>
    <App />
  </MantineProvider>
);
