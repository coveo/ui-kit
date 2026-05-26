import {useMemo, useSyncExternalStore} from 'react';
import type {ConversationControllerState} from '@coveo/headless-future';
import {getConversationController} from './conversation-controller.js';
import {getSampleConfiguration} from './env.js';
import {ConversationComposer} from './components/conversation-composer.js';
import {ConversationEventLog} from './components/conversation-event-log.js';
import {ConversationMessages} from './components/conversation-messages.js';
import {ConversationTurnStatuses} from './components/conversation-turn-statuses.js';
import {SampleConfigurationList} from './components/sample-configuration-list.js';
import {useConversationComposer} from './hooks/use-conversation-composer.js';
import {useConversationEventLog} from './hooks/use-conversation-event-log.js';

export default function App() {
  const configuration = getSampleConfiguration();
  const controller = useMemo(() => getConversationController(), []);

  const state = useSyncExternalStore<ConversationControllerState>(
    controller.subscribe,
    () => controller.state,
    () => controller.state
  );
  const {input, setInput, handleSubmit} = useConversationComposer({
    controller,
    turnCount: state.turns.length,
  });
  const events = useConversationEventLog(state);

  return (
    <main>
      <h1>Headless Future Conversation Sample</h1>
      <p>Engine initialized from environment variables.</p>
      <p>Press Enter to submit a message.</p>

      {state.error && (
        <p role="alert" className="error-banner">
          {state.error}
        </p>
      )}

      <ConversationComposer
        value={input}
        onValueChange={setInput}
        onSubmit={handleSubmit}
      />

      {state.activeTurnId && (
        <button type="button" onClick={() => controller.abortTurn()}>
          Stop response
        </button>
      )}

      <ConversationMessages messages={state.messages} />

      <ConversationTurnStatuses
        turns={state.turns}
        isLoading={state.isLoading}
        isStreamingConnected={state.streaming.isConnected}
      />

      <ConversationEventLog entries={events} />

      <SampleConfigurationList configuration={configuration} />
    </main>
  );
}
