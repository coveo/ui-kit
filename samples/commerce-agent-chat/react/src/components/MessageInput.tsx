import {useEffect, useRef} from 'react';

interface MessageSendEvent extends CustomEvent<{content: string}> {}

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
}

interface MessageInputElement extends HTMLElement {
  disabled: boolean;
  placeholder: string;
  value: string;
  focusInput?: () => void;
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
}: MessageInputProps): React.JSX.Element {
  const elementRef = useRef<MessageInputElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.disabled = disabled || isClassifying;
      elementRef.current.placeholder = isClassifying
        ? 'Classifying...'
        : placeholder;
      elementRef.current.value = value;
    }
  }, [disabled, isClassifying, placeholder, value]);

  useEffect(() => {
    if (!shouldFocusInput) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      elementRef.current?.focusInput?.();
      onFocusHandled?.();
    });

    return () => cancelAnimationFrame(frameId);
  }, [shouldFocusInput, onFocusHandled]);

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
      <cac-message-input ref={elementRef} />
    </div>
  );
}
