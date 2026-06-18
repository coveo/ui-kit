import {useState, useEffect} from 'react';
import {converseController} from './generative-setup.js';
import {RoutedCommerceResults} from './RoutedCommerceResults.js';
import {RoutedSearchResults} from './RoutedSearchResults.js';

const PROMPT_SUGGESTIONS = [
  'build a beginner surfing kit with budget, mid-range, and premium options',
  'what should i pack for a snorkeling trip?',
  'kayaks',
  'wetsuits',
  'surfboard care',
  'boating safety',
];

interface Turn {
  id: string;
  prompt: string;
  status: 'streaming' | 'complete' | 'error';
  routedInterface?: {useCase: string; interface: unknown};
  agentResponse?: {
    messages: {content: string; role: string}[];
    surfaces: Record<string, unknown>[];
    toolCalls: {
      id: string;
      name: string;
      args: string;
      result?: string;
      status: 'calling' | 'completed';
    }[];
  };
  error?: string;
}

interface ConverseState {
  turns: Turn[];
  activeTurnId: string | undefined;
  activeTurn: Turn | undefined;
  isStreaming: boolean;
}

export function ConversePage() {
  const [state, setState] = useState<ConverseState>(converseController.state);
  const [prompt, setPrompt] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const unsubscribe = converseController.subscribe(() => {
      setState(converseController.state);
    });
    return unsubscribe;
  }, []);

  const activeTurn = state.activeTurn;

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      converseController.submit({prompt});
      setPrompt('');
    }
  }

  function submitSuggestion(suggestion: string) {
    setShowSuggestions(false);
    converseController.submit({prompt: suggestion});
    setPrompt('');
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#fff',
          padding: '8px 16px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{position: 'relative', width: '100%', maxWidth: '800px'}}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Type a prompt and press Enter..."
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          {showSuggestions && (
            <ul
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                margin: 0,
                padding: 0,
                listStyle: 'none',
                background: '#fff',
                border: '1px solid #ddd',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {PROMPT_SUGGESTIONS.map((s) => (
                <li
                  key={s}
                  onMouseDown={() => submitSuggestion(s)}
                  style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = '#f0f0f0')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
        <aside
          style={{
            width: '180px',
            borderRight: '1px solid #ddd',
            padding: '8px',
            overflowY: 'auto',
            fontSize: '13px',
          }}
        >
          <strong>Turns</strong>
          {state.turns.length === 0 && (
            <p style={{color: '#888'}}>No turns yet</p>
          )}
          {state.turns.map((turn) => (
            <div
              key={turn.id}
              onClick={() => converseController.selectTurn({id: turn.id})}
              style={{
                padding: '4px 6px',
                marginTop: '4px',
                cursor: 'pointer',
                background: turn.id === state.activeTurnId ? '#e8e8e8' : '',
                borderRadius: '3px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {turn.prompt}
            </div>
          ))}
        </aside>

        <main style={{flex: 1, padding: '12px 20px', overflowY: 'auto'}}>
          {state.isStreaming && <p>⏳ Streaming...</p>}

          {activeTurn && (
            <>
              {activeTurn.status === 'error' && (
                <div style={{color: 'red', marginBottom: '8px'}}>
                  Error: {activeTurn.error ?? 'Unknown error'}
                  <button
                    onClick={() =>
                      converseController.retry({id: activeTurn.id})
                    }
                    style={{marginLeft: '8px'}}
                  >
                    Retry
                  </button>
                </div>
              )}

              {activeTurn.routedInterface?.useCase === 'commerceSearch' && (
                <RoutedCommerceResults
                  interface={activeTurn.routedInterface.interface}
                />
              )}
              {activeTurn.routedInterface?.useCase === 'search' && (
                <RoutedSearchResults
                  interface={activeTurn.routedInterface.interface}
                />
              )}

              {activeTurn.agentResponse && (
                <div>
                  {activeTurn.agentResponse.messages.map((msg, i) => (
                    <p key={i} style={{whiteSpace: 'pre-wrap'}}>
                      <strong>{msg.role}:</strong> {msg.content}
                    </p>
                  ))}
                  {activeTurn.agentResponse.toolCalls.length > 0 &&
                    activeTurn.agentResponse.toolCalls.map((tc) => (
                      <details
                        key={tc.id}
                        style={{fontSize: '12px', marginTop: '4px'}}
                      >
                        <summary>
                          {tc.status === 'calling' &&
                          activeTurn.status === 'streaming'
                            ? '⏳'
                            : '✓'}{' '}
                          {tc.name}
                        </summary>
                        {tc.args && <pre>{tc.args}</pre>}
                        {tc.result && (
                          <pre style={{color: 'green'}}>{tc.result}</pre>
                        )}
                      </details>
                    ))}
                </div>
              )}

              {activeTurn.status === 'streaming' &&
                !activeTurn.routedInterface &&
                !activeTurn.agentResponse && (
                  <p style={{color: '#888'}}>Loading...</p>
                )}
            </>
          )}

          {!activeTurn && state.turns.length === 0 && (
            <p style={{color: '#888'}}>Submit a prompt to start.</p>
          )}
        </main>
      </div>
    </div>
  );
}
