import {useEffect, useState} from 'react';
import {
  createEngineControllers,
  loadEngineConfig,
  type EngineControllers,
} from './engine.js';
import {CommerceAgentInterface} from './components/CommerceAgentInterface.js';

export function App(): React.JSX.Element {
  const [controllers, setControllers] = useState<EngineControllers | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const config = loadEngineConfig();
      const ctrl = createEngineControllers(config);
      setControllers(ctrl);
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

  if (!controllers) {
    return (
      <main className="state-screen" aria-live="polite">
        <section className="state-card">Loading engine...</section>
      </main>
    );
  }

  return <CommerceAgentInterface controllers={controllers} />;
}
