import {useState} from 'react';
import type {CommerceConfig} from '@core/config/env.js';
import {classifyQuery, ClassificationError} from '@core/lib/heuristicClient.js';
import {generateId} from '@core/lib/chatIds.js';
import {useChat} from '../hooks/useChat.js';
import {useSearch} from '../hooks/useSearch.js';
import {ChatInterface} from './ChatInterface.js';
import {SearchInterface} from './SearchInterface.js';

interface CommerceAgentInterfaceProps {
  config: CommerceConfig;
}

export function CommerceAgentInterface({
  config,
}: CommerceAgentInterfaceProps): React.JSX.Element {
  const {state, sendMessage, clearMessages, dismissError, orchestrator} =
    useChat(config);
  const {searchState, search, loadMore} = useSearch(orchestrator);
  const [draftValue, setDraftValue] = useState('');
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [showSearchView, setShowSearchView] = useState(false);

  const handleSend = async (content: string) => {
    setShowSearchView(false);
    setIsClassifying(true);
    try {
      const decision = await classifyQuery(content);
      if (decision === 'search') {
        const store = orchestrator.getStore();
        store.setState((s) => ({
          ...s,
          isLoading: false,
          progressSteps: [],
          progressTrace: [],
          messages: [
            ...s.messages,
            {
              id: generateId('msg-user'),
              role: 'user' as const,
              content,
            },
            {
              id: generateId('msg-assistant'),
              role: 'assistant' as const,
              content: `[See search results for "**${content}**"](#see-results:${encodeURIComponent(content)})`,
            },
          ],
        }));
        setDraftValue('');
        setShowSearchView(true);
        void search(content);
      } else {
        sendMessage(content);
        setDraftValue('');
      }
    } catch (error) {
      const message =
        error instanceof ClassificationError
          ? error.message
          : 'An unexpected error occurred while classifying the query.';
      orchestrator.getStore().setState((s) => ({...s, error: message}));
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSeeResults = (query: string) => {
    if (searchState.query !== query) {
      void search(query);
    }
    setShowSearchView(true);
    setShouldFocusInput(true);
  };

  const handleLoadMore = () => {
    void loadMore();
  };

  const handleBackToChat = () => {
    setShowSearchView(false);
    setShouldFocusInput(true);
  };

  const handleBackToSearch = () => {
    setShowSearchView(true);
    setShouldFocusInput(true);
  };

  if (showSearchView) {
    return (
      <SearchInterface
        searchState={searchState}
        onSend={handleSend}
        value={draftValue}
        onValueChange={setDraftValue}
        shouldFocusInput={shouldFocusInput}
        onFocusHandled={() => setShouldFocusInput(false)}
        onLoadMore={handleLoadMore}
        isClassifying={isClassifying}
        onBack={handleBackToChat}
      />
    );
  }

  return (
    <ChatInterface
      state={state}
      onSend={handleSend}
      onClearMessages={clearMessages}
      onDismissError={dismissError}
      value={draftValue}
      onValueChange={setDraftValue}
      shouldFocusInput={shouldFocusInput}
      onFocusHandled={() => setShouldFocusInput(false)}
      isClassifying={isClassifying}
      onSeeResults={handleSeeResults}
      onBackToSearch={handleBackToSearch}
    />
  );
}
