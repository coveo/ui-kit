import type {ConversationEventEntry} from '../hooks/use-conversation-event-log.js';

interface ConversationEventLogProps {
  entries: ConversationEventEntry[];
}

export function ConversationEventLog({entries}: ConversationEventLogProps) {
  return (
    <section>
      <h2>Raw event log</h2>
      {entries.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ol>
          {entries.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.type}</strong>
              <pre>{JSON.stringify(entry.payload, null, 2)}</pre>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
