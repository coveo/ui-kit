import {useState} from 'react';
import './MessageInput.css';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function MessageInput({
  onSend,
  disabled,
}: MessageInputProps): React.JSX.Element {
  const [input, setInput] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const next = input.trim();
    if (!next) {
      return;
    }

    onSend(next);
    setInput('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();

    const next = input.trim();
    if (!next || disabled) {
      return;
    }

    onSend(next);
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="message-input-form"
      aria-label="Send message"
    >
      <label className="visually-hidden" htmlFor="chat-input">
        Type your message
      </label>
      <p id="chat-input-hint" className="visually-hidden">
        Press Enter to send. Press Shift plus Enter to insert a new line.
      </p>
      <textarea
        id="chat-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Zane..."
        disabled={disabled}
        className="message-input"
        rows={2}
        aria-describedby="chat-input-hint"
      />
      <button
        type="submit"
        disabled={disabled || input.trim().length === 0}
        className="send-button"
      >
        Send
      </button>
    </form>
  );
}
