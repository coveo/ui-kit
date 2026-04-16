import {useState} from 'react';
import type {CommerceConfig} from '@core/config/env.js';
import {classifyQuery, ClassificationError} from '@core/lib/heuristicClient.js';
import type {QueryRouteDecision} from '@core/types/heuristics.js';
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
  const [lastRouteDecision, setLastRouteDecision] =
    useState<QueryRouteDecision>('agent');

  const handleSend = async (content: string) => {
    setIsClassifying(true);
    try {
      const decision = await classifyQuery(content);
      setLastRouteDecision(decision);
      if (decision === 'search') {
        setDraftValue('');
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

  const handleLoadMore = () => {
    void loadMore();
  };

  if (lastRouteDecision === 'search') {
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
    />
  );
}
