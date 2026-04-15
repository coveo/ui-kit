import {useEffect, useRef} from 'react';

interface MessageSendEvent extends CustomEvent<{content: string}> {}

interface MessageInputProps {
  onSend: (message: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
  placeholder?: string;
  aiEnabled: boolean;
  onToggleAi: (enabled: boolean) => void;
  slot?: string;
}

interface MessageInputElement extends HTMLElement {
  disabled: boolean;
  placeholder: string;
  value: string;
}

export function MessageInput({
  onSend,
  value,
  onValueChange,
  disabled,
  placeholder = 'Ask agent...',
  aiEnabled,
  onToggleAi,
  slot,
}: MessageInputProps): React.JSX.Element {
  const elementRef = useRef<MessageInputElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.disabled = disabled;
      elementRef.current.placeholder = placeholder;
      elementRef.current.value = value;
    }
  }, [disabled, placeholder, value]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const handleSend = (event: Event) => {
      const customEvent = event as MessageSendEvent;
      onSend(customEvent.detail.content);
    };

    const handleInput = () => {
      onValueChange(element.value);
    };

    element.addEventListener('message-send', handleSend);
    element.addEventListener('input', handleInput);
    return () => {
      element.removeEventListener('message-send', handleSend);
      element.removeEventListener('input', handleInput);
    };
  }, [onSend, onValueChange]);

  return (
    <div className="input-with-switch" slot={slot}>
      <cac-message-input ref={elementRef}>
        <label
          slot="after-send"
          className="ai-switch"
          aria-label="Toggle AI mode"
        >
          <span className="ai-switch-label">AI</span>
          <input
            type="checkbox"
            role="switch"
            checked={aiEnabled}
            onChange={(event) => onToggleAi(event.currentTarget.checked)}
          />
        </label>
      </cac-message-input>
    </div>
  );
}
