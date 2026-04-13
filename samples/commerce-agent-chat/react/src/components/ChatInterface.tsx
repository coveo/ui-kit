import {useEffect, useRef} from 'react';
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

  return (
    <cac-chat-interface ref={elementRef} heading="Commerce Agent Chat (React)">
      <MessageList
        slot="messages"
        messages={state.messages}
        isLoading={state.isLoading}
        progressSteps={state.progressSteps}
        onActionSelected={sendMessage}
      />
      <MessageInput
        slot="input"
        onSend={sendMessage}
        disabled={state.isLoading}
      />
    </cac-chat-interface>
  );
}
