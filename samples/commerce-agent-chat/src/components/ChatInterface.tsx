import type {CommerceConfig} from '../config/env.js';
import {useChat} from '../hooks/useChat.js';
import {MessageInput} from './MessageInput.js';
import {MessageList} from './MessageList.js';
import './ChatInterface.css';

interface ChatInterfaceProps {
  config: CommerceConfig;
}

export function ChatInterface({config}: ChatInterfaceProps): React.JSX.Element {
  const {state, sendMessage, clearMessages, dismissError} = useChat(config);

  return (
    <main className="chat-shell">
      <section className="chat-container" aria-label="Commerce Agent Chat">
        <header className="chat-header">
          <h1>Commerce Agent Chat</h1>
          <button
            onClick={clearMessages}
            className="clear-button"
            type="button"
          >
            Clear
          </button>
        </header>

        <MessageList
          messages={state.messages}
          isLoading={state.isLoading}
          progressLabel={state.progressLabel}
          onActionSelected={sendMessage}
        />

        {state.error ? (
          <section className="error-banner" role="alert">
            <p>{state.error}</p>
            <button onClick={dismissError} type="button">
              Dismiss
            </button>
          </section>
        ) : null}

        <MessageInput onSend={sendMessage} disabled={state.isLoading} />
      </section>
    </main>
  );
}
