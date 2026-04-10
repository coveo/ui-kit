import {useEffect, useState} from 'react';

import {ChatInterface} from './components/ChatInterface.js';
import {loadConfig, type CommerceConfig} from './config/env.js';
import './App.css';

export function App(): React.JSX.Element {
  const [config, setConfig] = useState<CommerceConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setConfig(loadConfig());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Configuration failed');
    }
  }, []);

  if (error) {
    return (
      <main className="state-screen" role="alert">
        <section className="state-card">
          <h1>Configuration Error</h1>
          <pre>{error}</pre>
        </section>
      </main>
    );
  }

  if (!config) {
    return (
      <main className="state-screen" aria-live="polite">
        <section className="state-card">Loading configuration...</section>
      </main>
    );
  }

  return <ChatInterface config={config} />;
}
