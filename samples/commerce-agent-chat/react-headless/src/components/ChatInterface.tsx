import {useEffect, useRef} from 'react';
import type {
  AgentChatCatalogControllerState,
  AgentChatControllerState,
} from '@coveo/headless/commerce';

import {MessageInput} from './MessageInput.js';
import {MessageList} from './MessageList.js';

interface ChatInterfaceProps {
  state: AgentChatControllerState;
  catalogState: AgentChatCatalogControllerState;
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

export function ChatInterface({
  state,
  catalogState,
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
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    if (!onSeeResults) {
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
    return () => {
      element.removeEventListener('click', handleClick);
    };
  }, [onSeeResults]);

  const errorMessage = state.error?.message?.trim() ?? '';

  return (
    <section
      className="rh-chat-interface"
      aria-label="Commerce Agent Chat (Headless)"
    >
      <div className="rh-chat-container" ref={containerRef}>
        <header className="rh-chat-header">
          <h1>Commerce Agent Chat (Headless)</h1>
          <button
            className="rh-clear-button"
            type="button"
            onClick={onClearMessages}
          >
            Clear
          </button>
        </header>

        <MessageList
          messages={state.messages}
          catalogState={catalogState}
          isStreaming={state.isStreaming}
          progress={state.progress}
          onActionSelected={onSend}
        />

        {Boolean(errorMessage) && (
          <section className="rh-error-banner" role="alert">
            <p>{errorMessage}</p>
            <button type="button" onClick={onDismissError}>
              Dismiss
            </button>
          </section>
        )}

        <MessageInput
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
      </div>
    </section>
  );
}
