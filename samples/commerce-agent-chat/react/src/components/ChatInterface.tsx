import {useEffect, useRef, useState} from 'react';
import type {CommerceConfig} from '@core/config/env.js';
import {useChat} from '../hooks/useChat.js';
import {useSearch} from '../hooks/useSearch.js';
import {MessageInput} from './MessageInput.js';
import {MessageList} from './MessageList.js';

interface ChatInterfaceProps {
  config: CommerceConfig;
}

interface CacChatInterfaceElement extends HTMLElement {
  error: string;
}

export function ChatInterface({config}: ChatInterfaceProps): React.JSX.Element {
  const {state, sendMessage, clearMessages, dismissError, orchestrator} =
    useChat(config);
  const {searchState, search, loadMore} = useSearch(orchestrator);
  const elementRef = useRef<CacChatInterfaceElement | null>(null);
  const searchResultsRef = useRef<HTMLElement | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [draftValue, setDraftValue] = useState('');
  const [shouldFocusInput, setShouldFocusInput] = useState(false);

  const handleSend = (content: string) => {
    if (aiEnabled) {
      sendMessage(content);
    } else {
      void search(content);
    }
    setDraftValue('');
  };

  const handleToggleAi = (enabled: boolean) => {
    setAiEnabled(enabled);
    setShouldFocusInput(true);
  };

  const handleLoadMore = () => {
    void loadMore();
  };

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.error = state.error ?? '';
    }
  }, [state.error]);

  useEffect(() => {
    if (searchResultsRef.current) {
      (searchResultsRef.current as Record<string, unknown>).searchState =
        searchState;
    }
  }, [searchState]);

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

  useEffect(() => {
    const element = searchResultsRef.current;
    if (!element) {
      return;
    }

    const handleLoadMoreEvent = () => {
      handleLoadMore();
    };

    element.addEventListener('search-load-more', handleLoadMoreEvent);
    return () => {
      element.removeEventListener('search-load-more', handleLoadMoreEvent);
    };
  }, [handleLoadMore]);

  if (!aiEnabled) {
    return (
      <section className="search-mode-shell" aria-label="Search mode">
        <div className="search-mode-input-wrap">
          <MessageInput
            onSend={handleSend}
            value={draftValue}
            onValueChange={setDraftValue}
            disabled={searchState.loading}
            placeholder="Search..."
            aiEnabled={aiEnabled}
            onToggleAi={handleToggleAi}
            shouldFocusInput={shouldFocusInput}
            onFocusHandled={() => setShouldFocusInput(false)}
          />
        </div>
        <atomock-search-results ref={searchResultsRef} />
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
        onToggleAi={handleToggleAi}
        shouldFocusInput={shouldFocusInput}
        onFocusHandled={() => setShouldFocusInput(false)}
      />
    </cac-chat-interface>
  );
}
