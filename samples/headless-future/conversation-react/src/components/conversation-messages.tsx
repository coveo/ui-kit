import type {ConversationControllerMessage} from '@coveo/headless-future';

interface ConversationMessagesProps {
  messages: ConversationControllerMessage[];
}

export function ConversationMessages({messages}: ConversationMessagesProps) {
  return (
    <section aria-live="polite">
      <h2>Messages</h2>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <ul>
          {messages.map((message) => (
            <li key={message.id}>
              <strong>{message.role}:</strong>{' '}
              {message.content || '(streaming...)'}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
