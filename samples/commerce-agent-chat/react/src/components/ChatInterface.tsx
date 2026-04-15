import {useEffect, useRef, useState} from 'react';
import type {CommerceConfig} from '@core/config/env.js';
import {useChat} from '../hooks/useChat.js';
import {MessageInput} from './MessageInput.js';
import {MessageList} from './MessageList.js';

interface ChatInterfaceProps {
  config: CommerceConfig;
}

interface CacChatInterfaceElement extends HTMLElement {
  error: string;
}

export function ChatInterface({config}: ChatInterfaceProps): React.JSX.Element {
  const {state, sendMessage, clearMessages, dismissError} = useChat(config);
  const elementRef = useRef<CacChatInterfaceElement | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [draftValue, setDraftValue] = useState('');

  const handleSend = (content: string) => {
    sendMessage(content);
    setDraftValue('');
  };

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.error = state.error ?? '';
    }
  }, [state.error]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }
    const handleClear = () => clearMessages();
    const handleDismiss = () => dismissError();
    element.addEventListener('clear', handleClear);
    element.addEventListener('dismiss-error', handleDismiss);
    return () => {
      element.removeEventListener('clear', handleClear);
      element.removeEventListener('dismiss-error', handleDismiss);
    };
  }, [clearMessages, dismissError]);

  if (!aiEnabled) {
    return (
      <section className="search-mode-shell" aria-label="Search mode">
        <div className="search-mode-input-wrap">
          <MessageInput
            onSend={handleSend}
            value={draftValue}
            onValueChange={setDraftValue}
            disabled={false}
            placeholder="Search..."
            aiEnabled={aiEnabled}
            onToggleAi={setAiEnabled}
          />
        </div>
      </section>
    );
  }

  return (
    <cac-chat-interface ref={elementRef} heading="Commerce Agent Chat (React)">
      <MessageList
        slot="messages"
        messages={state.messages}
        isLoading={state.isLoading}
        progressSteps={state.progressSteps}
        progressTrace={state.progressTrace}
        onActionSelected={sendMessage}
      />
      <MessageInput
        slot="input"
        onSend={handleSend}
        value={draftValue}
        onValueChange={setDraftValue}
        disabled={state.isLoading}
        placeholder="Ask agent..."
        aiEnabled={aiEnabled}
        onToggleAi={setAiEnabled}
      />
    </cac-chat-interface>
  );
}
