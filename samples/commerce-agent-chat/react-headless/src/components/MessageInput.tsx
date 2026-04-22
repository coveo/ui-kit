import {useEffect, useId, useRef} from 'react';
import './MessageInput.css';

interface MessageInputProps {
  onSend: (message: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
  placeholder?: string;
  isClassifying?: boolean;
  shouldFocusInput?: boolean;
  onFocusHandled?: () => void;
  slot?: string;
  onGoToSearch?: () => void;
}

export function MessageInput({
  onSend,
  value,
  onValueChange,
  disabled,
  placeholder = 'Ask something...',
  isClassifying = false,
  shouldFocusInput = false,
  onFocusHandled,
  slot,
  onGoToSearch,
}: MessageInputProps): React.JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inputId = useId();
  const inputHintId = `${inputId}-hint`;

  useEffect(() => {
    if (!shouldFocusInput) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      textareaRef.current?.focus();
      onFocusHandled?.();
    });

    return () => cancelAnimationFrame(frameId);
  }, [shouldFocusInput, onFocusHandled]);

  const isDisabled = disabled || isClassifying;
  const resolvedPlaceholder = isClassifying ? 'Classifying...' : placeholder;
  const isSubmitDisabled = isDisabled || value.trim().length === 0;

  const submitValue = () => {
    const content = value.trim();
    if (!content || isDisabled) {
      return;
    }
    onSend(content);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitValue();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }
    event.preventDefault();
    submitValue();
  };

  return (
    <div className="input-with-switch" slot={slot}>
      <form
        className="rh-message-input-form"
        aria-label="Send message"
        onSubmit={onSubmit}
      >
        <label className="visually-hidden" htmlFor={inputId}>
          Type your message
        </label>
        <p id={inputHintId} className="visually-hidden">
          Press Enter to send. Press Shift plus Enter to insert a new line.
        </p>
        <div className="rh-message-input-shell">
          <textarea
            ref={textareaRef}
            id={inputId}
            className="rh-message-input"
            value={value}
            disabled={isDisabled}
            placeholder={resolvedPlaceholder}
            rows={2}
            aria-describedby={inputHintId}
            onChange={(event) => onValueChange(event.currentTarget.value)}
            onKeyDown={onKeyDown}
          />
          <button
            className="rh-send-button"
            type="submit"
            disabled={isSubmitDisabled}
          >
            Send
          </button>
        </div>
      </form>
      {onGoToSearch && (
        <button
          type="button"
          className="go-search-btn"
          onClick={onGoToSearch}
          aria-label="Go to search"
          title="Go to search"
        >
          <span aria-hidden="true">🔍</span>
        </button>
      )}
    </div>
  );
}
