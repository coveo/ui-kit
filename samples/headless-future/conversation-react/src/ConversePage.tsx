import {useState, useEffect} from 'react';
import {converseController} from './generative-setup.js';
import {RoutedCommerceResults} from './RoutedCommerceResults.js';
import {RoutedSearchResults} from './RoutedSearchResults.js';

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

  return (
    <div style={{display: 'flex', height: '100vh', fontFamily: 'sans-serif'}}>
      {/* Turn history sidebar */}
      <aside
        style={{
          width: '240px',
          borderRight: '1px solid #ccc',
          padding: '12px',
          overflowY: 'auto',
        }}
      >
        <h3 style={{margin: '0 0 8px'}}>Turns</h3>
        {state.turns.length === 0 && (
          <p style={{color: '#888', fontSize: '14px'}}>No turns yet</p>
        )}
        {state.turns.map((turn) => (
          <div
            key={turn.id}
            onClick={() => converseController.selectTurn({id: turn.id})}
            style={{
              padding: '8px',
              marginBottom: '4px',
              cursor: 'pointer',
              borderRadius: '4px',
              background:
                turn.id === state.activeTurnId ? '#e0e7ff' : 'transparent',
              border: '1px solid #ddd',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {turn.prompt}
            </div>
            <div style={{fontSize: '11px', color: '#666', marginTop: '2px'}}>
              {turn.status}
            </div>
          </div>
        ))}
      </aside>

      {/* Main content area */}
      <main style={{flex: 1, padding: '16px', overflowY: 'auto'}}>
        {/* Prompt input */}
        <div style={{marginBottom: '16px'}}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a prompt and press Enter..."
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Streaming indicator */}
        {state.isStreaming && (
          <div
            style={{
              padding: '8px 12px',
              background: '#fffbe6',
              border: '1px solid #ffe58f',
              borderRadius: '4px',
              marginBottom: '12px',
              fontSize: '13px',
            }}
          >
            ⏳ Streaming...
          </div>
        )}

        {/* Active turn renderer */}
        {activeTurn && (
          <div>
            {/* Error state with retry */}
            {activeTurn.status === 'error' && (
              <div
                style={{
                  padding: '12px',
                  background: '#fff2f0',
                  border: '1px solid #ffccc7',
                  borderRadius: '4px',
                  marginBottom: '12px',
                }}
              >
                <p style={{margin: '0 0 8px', color: '#cf1322'}}>
                  Error: {activeTurn.error ?? 'Unknown error'}
                </p>
                <button
                  type="button"
                  onClick={() => converseController.retry({id: activeTurn.id})}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    border: '1px solid #cf1322',
                    background: '#fff',
                    color: '#cf1322',
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Routed interface components */}
            {activeTurn.routedInterface &&
              activeTurn.routedInterface.useCase === 'commerceSearch' && (
                <RoutedCommerceResults
                  interface={activeTurn.routedInterface.interface}
                />
              )}
            {activeTurn.routedInterface &&
              activeTurn.routedInterface.useCase === 'search' && (
                <RoutedSearchResults
                  interface={activeTurn.routedInterface.interface}
                />
              )}

            {/* Agent response: messages + surfaces */}
            {activeTurn.agentResponse && (
              <div>
                {activeTurn.agentResponse.messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px',
                      marginBottom: '6px',
                      background: msg.role === 'assistant' ? '#f6f6f6' : '#fff',
                      borderRadius: '4px',
                      border: '1px solid #eee',
                    }}
                  >
                    <strong style={{fontSize: '12px', color: '#555'}}>
                      {msg.role}
                    </strong>
                    <p style={{margin: '4px 0 0', whiteSpace: 'pre-wrap'}}>
                      {msg.content}
                    </p>
                  </div>
                ))}
                {activeTurn.agentResponse.surfaces.length > 0 && (
                  <div style={{marginTop: '8px'}}>
                    <strong style={{fontSize: '12px', color: '#555'}}>
                      Surfaces:
                    </strong>
                    {activeTurn.agentResponse.surfaces.map((surface, i) => (
                      <pre
                        key={i}
                        style={{
                          background: '#f9f9f9',
                          padding: '8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          overflow: 'auto',
                        }}
                      >
                        {JSON.stringify(surface, null, 2)}
                      </pre>
                    ))}
                  </div>
                )}
                {activeTurn.agentResponse.toolCalls.length > 0 && (
                  <div style={{marginTop: '8px'}}>
                    <strong style={{fontSize: '12px', color: '#555'}}>
                      Tool Calls:
                    </strong>
                    {activeTurn.agentResponse.toolCalls.map((tc) => (
                      <div
                        key={tc.id}
                        style={{
                          padding: '8px',
                          marginTop: '4px',
                          background:
                            tc.status === 'calling' ? '#fffbe6' : '#f6ffed',
                          border: `1px solid ${tc.status === 'calling' ? '#ffe58f' : '#b7eb8f'}`,
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{fontWeight: 600, marginBottom: '4px'}}>
                          {tc.status === 'calling' ? '⏳' : '✓'} {tc.name}
                        </div>
                        {tc.args && (
                          <pre
                            style={{
                              margin: '4px 0',
                              overflow: 'auto',
                              fontSize: '11px',
                            }}
                          >
                            {tc.args}
                          </pre>
                        )}
                        {tc.result && (
                          <pre
                            style={{
                              margin: '4px 0',
                              overflow: 'auto',
                              fontSize: '11px',
                              color: '#389e0d',
                            }}
                          >
                            {tc.result}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Streaming state - no response yet */}
            {activeTurn.status === 'streaming' &&
              !activeTurn.routedInterface &&
              !activeTurn.agentResponse && (
                <div style={{color: '#888', fontStyle: 'italic'}}>
                  Loading...
                </div>
              )}
          </div>
        )}

        {!activeTurn && state.turns.length === 0 && (
          <p style={{color: '#888'}}>
            Submit a prompt to start the conversation.
          </p>
        )}
      </main>
    </div>
  );
}
