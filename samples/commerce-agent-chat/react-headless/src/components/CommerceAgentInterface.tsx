import {useState, useCallback} from 'react';
import type {EngineControllers} from '../engine.js';
import {useAgentChat} from '../hooks/useAgentChat.js';
import {useCommerceSearch} from '../hooks/useCommerceSearch.js';
import {ChatInterface} from './ChatInterface.js';
import {SearchInterface} from './SearchInterface.js';

const CLASSIFY_URL = '/api/heuristics/classify';

interface CommerceAgentInterfaceProps {
  controllers: EngineControllers;
}

async function classifyQuery(query: string): Promise<'search' | 'agent'> {
  try {
    const response = await fetch(CLASSIFY_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query}),
    });
    if (!response.ok) {
      return 'agent';
    }
    const data = (await response.json()) as {decision?: string};
    return data.decision === 'search' ? 'search' : 'agent';
  } catch {
    return 'agent';
  }
}

export function CommerceAgentInterface({
  controllers,
}: CommerceAgentInterfaceProps): React.JSX.Element {
  const {
    state: chatState,
    sendMessage,
    clearConversation,
    dismissError,
  } = useAgentChat(controllers.agentChat);
  const {state: searchState, submitSearch} = useCommerceSearch(
    controllers.search,
    controllers.searchBox
  );

  const [draftValue, setDraftValue] = useState('');
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [showSearchView, setShowSearchView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSend = useCallback(
    async (content: string) => {
      setShowSearchView(false);
      setIsClassifying(true);
      try {
        const decision = await classifyQuery(content);
        if (decision === 'search') {
          // Route to search: submit via headless search controller
          setSearchQuery(content);
          submitSearch(content);
          setDraftValue('');
          setShowSearchView(true);
        } else {
          // Route to agent: send via headless agent chat controller
          sendMessage(content);
          setDraftValue('');
        }
      } catch {
        sendMessage(content);
        setDraftValue('');
      } finally {
        setIsClassifying(false);
      }
    },
    [sendMessage, submitSearch]
  );

  const handleSeeResults = useCallback(
    (query: string) => {
      setSearchQuery(query);
      submitSearch(query);
      setShowSearchView(true);
      setShouldFocusInput(true);
    },
    [submitSearch]
  );

  const handleBackToChat = useCallback(() => {
    setShowSearchView(false);
    setShouldFocusInput(true);
  }, []);

  const handleBackToSearch = useCallback(() => {
    setShowSearchView(true);
    setShouldFocusInput(true);
  }, []);

  if (showSearchView) {
    return (
      <SearchInterface
        products={searchState.products}
        isLoading={searchState.isLoading}
        query={searchQuery}
        onSend={handleSend}
        value={draftValue}
        onValueChange={setDraftValue}
        shouldFocusInput={shouldFocusInput}
        onFocusHandled={() => setShouldFocusInput(false)}
        isClassifying={isClassifying}
        onBack={handleBackToChat}
      />
    );
  }

  return (
    <ChatInterface
      state={chatState}
      onSend={handleSend}
      onClearMessages={clearConversation}
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
