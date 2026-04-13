import {useEffect, useRef} from 'react';

interface MessageSendEvent extends CustomEvent<{content: string}> {}

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  slot?: string;
}

interface MessageInputElement extends HTMLElement {
  disabled: boolean;
}

export function MessageInput({
  onSend,
  disabled,
  slot,
}: MessageInputProps): React.JSX.Element {
  const elementRef = useRef<MessageInputElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.disabled = disabled;
    }
  }, [disabled]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const handleSend = (event: Event) => {
      const customEvent = event as MessageSendEvent;
      onSend(customEvent.detail.content);
    };

    element.addEventListener('message-send', handleSend);
    return () => element.removeEventListener('message-send', handleSend);
  }, [onSend]);

  return <cac-message-input ref={elementRef} slot={slot} />;
}
