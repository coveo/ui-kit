import {useState} from 'react';
import type {CommerceConfig} from '@core/config/env.js';
import {useChat} from '../hooks/useChat.js';
import {useSearch} from '../hooks/useSearch.js';
import {ChatModeView} from './ChatModeView.js';
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

  if (!aiEnabled) {
    return (
      <SearchInterface
        searchState={searchState}
        onSend={handleSend}
        value={draftValue}
        onValueChange={setDraftValue}
        aiEnabled={aiEnabled}
        onToggleAi={handleToggleAi}
        shouldFocusInput={shouldFocusInput}
        onFocusHandled={() => setShouldFocusInput(false)}
        onLoadMore={handleLoadMore}
      />
    );
  }

  return (
    <ChatModeView
      state={state}
      onSend={handleSend}
      onClearMessages={clearMessages}
      onDismissError={dismissError}
      value={draftValue}
      onValueChange={setDraftValue}
      aiEnabled={aiEnabled}
      onToggleAi={handleToggleAi}
      shouldFocusInput={shouldFocusInput}
      onFocusHandled={() => setShouldFocusInput(false)}
    />
  );
}
