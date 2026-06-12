import type {FormEventHandler} from 'react';

interface ConversationComposerProps {
  value: string;
  onValueChange: (nextValue: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function ConversationComposer({
  value,
  onValueChange,
  onSubmit,
}: ConversationComposerProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="composer"
      aria-label="Conversation composer"
    >
      <label htmlFor="message-input">Message input</label>
      <input
        id="message-input"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder="Ask a question about products"
        autoComplete="off"
      />
    </form>
  );
}
