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

  return (
    <form
      onSubmit={handleSubmit}
      className="message-input-form"
      aria-label="Send message"
    >
      <label className="visually-hidden" htmlFor="chat-input">
        Type your message
      </label>
      <input
        id="chat-input"
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Ask Zane..."
        disabled={disabled}
        className="message-input"
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
