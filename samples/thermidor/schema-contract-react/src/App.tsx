import {useEffect, useMemo, useRef, useState} from 'react';
import {
  buildConverseController,
  buildGenerativeInterface,
  Engine,
  type ConverseController,
  type GenerativeInterface,
} from '@coveo/thermidor';
import {A2UIProvider} from '@copilotkit/a2ui-renderer';
import {createThermidorCatalog} from './a2ui/components.js';
import {getA2UIMessages, ThermidorA2UISurfaces} from './a2ui/surfaces.js';
import {getSampleConfiguration} from './env.js';
import {useController} from './use-controller.js';

const CONTRACT_PROMPT = 'Show the Thermidor catalog';

export default function App() {
  return <ContractSample />;
}

function ContractSample() {
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
  const [actionError, setActionError] = useState<string>();
  const catalogRef = useRef<ReturnType<typeof createThermidorCatalog> | null>(null);
  catalogRef.current ??= createThermidorCatalog(controller, (error) =>
    setActionError(error.message)
  );
  const [prompt, setPrompt] = useState(CONTRACT_PROMPT);
  const turn = state.activeTurn;
  const a2uiMessages = useMemo(
    () => getA2UIMessages(turn?.agentResponse?.activities ?? []),
    [turn?.agentResponse?.activities]
  );

  useEffect(() => {
    return () => {
      interfaceRef.current?.dispose();
      engineRef.current?.dispose();
    };
  }, []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setActionError(undefined);
    controller.submit({prompt});
  }

  return (
    <A2UIProvider catalog={catalogRef.current}>
      <main className="page-shell">
        <section className="hero">
          <p className="eyebrow">Thermidor + v0.9 catalog contract</p>
          <h1>Server-owned A2-UI state, client-owned rendering.</h1>
          <p>
            Thermidor stays UI-less. This sample recognizes an <code>a2ui-surface</code> activity,
            binds controller state from the A2-UI data model and forwards interactions through a
            typed local function. State changes only when the server returns another data-model
            update.
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
        {actionError && <p className="error">{actionError}</p>}
        <ThermidorA2UISurfaces messages={a2uiMessages} />
        {!turn && <p className="hint">Run the pre-filled prompt to render the schema example.</p>}
      </main>
    </A2UIProvider>
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
