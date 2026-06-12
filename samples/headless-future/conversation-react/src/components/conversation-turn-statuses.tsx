import type {ConversationControllerTurn} from '@coveo/headless-future';

interface ConversationTurnStatusesProps {
  turns: ConversationControllerTurn[];
  isLoading: boolean;
  isStreamingConnected: boolean;
}

export function ConversationTurnStatuses({
  turns,
  isLoading,
  isStreamingConnected,
}: ConversationTurnStatusesProps) {
  return (
    <section>
      <h2>Turn statuses</h2>
      <p>Loading: {isLoading ? 'yes' : 'no'}</p>
      <p>Streaming connected: {isStreamingConnected ? 'yes' : 'no'}</p>
      {turns.length === 0 ? (
        <p>No turns yet.</p>
      ) : (
        <ul>
          {turns.map((turn) => (
            <li key={turn.id}>
              <strong>{turn.id}:</strong> {turn.status.type}
              {'reason' in turn.status ? ` (${turn.status.reason})` : ''}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
