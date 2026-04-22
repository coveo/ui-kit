import {useEffect, useRef} from 'react';
import type {AgentChatControllerState} from '@coveo/headless/commerce';

import {MessageInput} from './MessageInput.js';
import {MessageList} from './MessageList.js';

interface ChatInterfaceProps {
  state: AgentChatControllerState;
  onSend: (content: string) => void;
  onClearMessages: () => void;
  onDismissError: () => void;
  value: string;
  onValueChange: (value: string) => void;
  shouldFocusInput: boolean;
  onFocusHandled: () => void;
  isClassifying?: boolean;
  onSeeResults?: (query: string) => void;
  onBackToSearch?: () => void;
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
  onSeeResults,
  onBackToSearch,
}: ChatInterfaceProps): React.JSX.Element {
  const elementRef = useRef<CacChatInterfaceElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.error = state.error?.message ?? '';
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

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !onSeeResults) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const anchor = event
        .composedPath()
        .find((el): el is HTMLAnchorElement => el instanceof HTMLAnchorElement);
      if (!anchor) {
        return;
      }
      const href = anchor.getAttribute('href') ?? '';
      const match = href.match(/^#see-results:(.+)$/);
      if (match) {
        event.preventDefault();
        onSeeResults(decodeURIComponent(match[1]));
      }
    };

    element.addEventListener('click', handleClick);
    return () => element.removeEventListener('click', handleClick);
  }, [onSeeResults]);

  return (
    <cac-chat-interface
      ref={elementRef}
      heading="Commerce Agent Chat (Headless)"
    >
      <MessageList
        slot="messages"
        messages={state.messages}
        isStreaming={state.isStreaming}
        progress={state.progress}
        onActionSelected={onSend}
      />
      <MessageInput
        slot="input"
        onSend={onSend}
        value={value}
        onValueChange={onValueChange}
        disabled={state.isStreaming}
        placeholder="Ask something..."
        isClassifying={isClassifying}
        shouldFocusInput={shouldFocusInput}
        onFocusHandled={onFocusHandled}
        onGoToSearch={onBackToSearch}
      />
    </cac-chat-interface>
  );
}
