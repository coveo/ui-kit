import {useEffect, useRef} from 'react';

import type {ChatState} from '@core/types/agent.js';

import {MessageInput} from './MessageInput.js';
import {MessageList} from './MessageList.js';

interface ChatModeViewProps {
  state: ChatState;
  onSend: (content: string) => void;
  onClearMessages: () => void;
  onDismissError: () => void;
  value: string;
  onValueChange: (value: string) => void;
  aiEnabled: boolean;
  onToggleAi: (enabled: boolean) => void;
  shouldFocusInput: boolean;
  onFocusHandled: () => void;
}

interface CacChatInterfaceElement extends HTMLElement {
  error: string;
}

export function ChatModeView({
  state,
  onSend,
  onClearMessages,
  onDismissError,
  value,
  onValueChange,
  aiEnabled,
  onToggleAi,
  shouldFocusInput,
  onFocusHandled,
}: ChatModeViewProps): React.JSX.Element {
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
        onActionSelected={onSend}
      />
      <MessageInput
        slot="input"
        onSend={onSend}
        value={value}
        onValueChange={onValueChange}
        disabled={state.isLoading}
        placeholder="Ask agent..."
        aiEnabled={aiEnabled}
        onToggleAi={onToggleAi}
        shouldFocusInput={shouldFocusInput}
        onFocusHandled={onFocusHandled}
      />
    </cac-chat-interface>
  );
}
