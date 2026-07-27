import {useEffect, useRef, useState} from 'react';
import {
  buildConverseController,
  buildGenerativeInterface,
  Engine,
  type ConverseController,
  type GenerativeInterface,
} from '@coveo/thermidor';
import {CatalogSurfaceRenderer} from './a2ui/components.js';
import {toCatalogSurfaces} from './a2ui/adapter.js';
import {getSampleConfiguration} from './env.js';
import {useController} from './use-controller.js';

const CONTRACT_PROMPT = 'Show the Thermidor catalog';

export default function App() {
  const engineRef = useRef<Engine | null>(null);
  engineRef.current ??= new Engine({
    configuration: getSampleConfiguration(),
    navigatorContextProvider: getNavigatorContext,
  });

  const interfaceRef = useRef<GenerativeInterface | null>(null);
  interfaceRef.current ??= buildGenerativeInterface({engine: engineRef.current});

  const [controller, state] = useController<ConverseController>(() =>
    buildConverseController({interface: interfaceRef.current!})
  );
  const [prompt, setPrompt] = useState(CONTRACT_PROMPT);
  const turn = state.activeTurn;
  const surfaces = toCatalogSurfaces(turn?.agentResponse?.activities ?? []);

  useEffect(() => {
    return () => {
      interfaceRef.current?.dispose();
      engineRef.current?.dispose();
    };
  }, []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    controller.submit({prompt});
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Thermidor + v0.9 catalog contract</p>
        <h1>Server-owned commerce state, client-owned rendering.</h1>
        <p>
          Thermidor stays UI-less. This sample recognizes an <code>a2ui-surface</code> activity,
          resolves the advertised controllers, and renders its local A2-UI component catalog.
        </p>
      </section>

      <form className="prompt" onSubmit={submit}>
        <label htmlFor="contract-prompt">Ask the mock API</label>
        <div>
          <input
            id="contract-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={state.isStreaming}
          />
          <button type="submit" disabled={state.isStreaming}>
            {state.isStreaming ? 'Streaming…' : 'Run'}
          </button>
        </div>
      </form>

      {turn?.agentResponse?.messages.map((message, index) => (
        <p className="agent-message" key={`${message.role}-${index}`}>
          {message.content}
        </p>
      ))}
      {turn?.status === 'error' && <p className="error">{turn.error}</p>}
      {surfaces.map((surface) => (
        <CatalogSurfaceRenderer key={surface.id} surface={surface} />
      ))}
      {!turn && <p className="hint">Run the pre-filled prompt to render the schema example.</p>}
    </main>
  );
}

function getNavigatorContext() {
  return {
    clientId: crypto.randomUUID(),
    location: window.location.href,
    referrer: document.referrer || null,
    userAgent: navigator.userAgent || null,
  };
}
