import {useEffect, useRef} from 'react';

import type {ChatState} from '@core/types/agent.js';

import {MessageInput} from './MessageInput.js';
import {MessageList} from './MessageList.js';

interface ChatInterfaceProps {
  state: ChatState;
  onSend: (content: string) => void;
  onClearMessages: () => void;
  onDismissError: () => void;
  value: string;
  onValueChange: (value: string) => void;
  shouldFocusInput: boolean;
  onFocusHandled: () => void;
  isClassifying?: boolean;
  onActionSelected?: (prompt: string) => void;
}

interface CacChatInterfaceElement extends HTMLElement {
  error: string;
}

export function ChatInterface({
  state,
  onSend,
  onClearMessages,
  onDismissError,
  value,
  onValueChange,
  shouldFocusInput,
  onFocusHandled,
  isClassifying = false,
  onActionSelected,
}: ChatInterfaceProps): React.JSX.Element {
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

    const handleClear = () => onClearMessages();
    const handleDismiss = () => onDismissError();
    element.addEventListener('clear', handleClear);
    element.addEventListener('dismiss-error', handleDismiss);
    return () => {
      element.removeEventListener('clear', handleClear);
      element.removeEventListener('dismiss-error', handleDismiss);
    };
  }, [onClearMessages, onDismissError]);

  return (
    <cac-chat-interface ref={elementRef} heading="Commerce Agent Chat (React)">
      <MessageList
        slot="messages"
        messages={state.messages}
        isLoading={state.isLoading}
        progressSteps={state.progressSteps}
        progressTrace={state.progressTrace}
        onActionSelected={onActionSelected ?? onSend}
      />
      <MessageInput
        slot="input"
        onSend={onSend}
        value={value}
        onValueChange={onValueChange}
        disabled={state.isLoading}
        placeholder="Ask something..."
        isClassifying={isClassifying}
        shouldFocusInput={shouldFocusInput}
        onFocusHandled={onFocusHandled}
      />
    </cac-chat-interface>
  );
}
