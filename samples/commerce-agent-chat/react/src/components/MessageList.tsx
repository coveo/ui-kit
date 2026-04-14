import {useEffect, useRef} from 'react';
import type {Message, ProgressTraceEntry} from '@core/types/agent.js';

interface CommerceActionClickEvent extends CustomEvent<{prompt: string}> {}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  progressSteps: string[];
  progressTrace: ProgressTraceEntry[];
  onActionSelected: (prompt: string) => void;
  slot?: string;
}

interface MessageListElement extends HTMLElement {
  messages: Message[];
  isLoading: boolean;
  progressSteps: string[];
  progressTrace: ProgressTraceEntry[];
}

export function MessageList({
  messages,
  isLoading,
  progressSteps,
  progressTrace,
  onActionSelected,
  slot,
}: MessageListProps): React.JSX.Element {
  const elementRef = useRef<MessageListElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.messages = messages;
      elementRef.current.isLoading = isLoading;
      elementRef.current.progressSteps = progressSteps;
      elementRef.current.progressTrace = progressTrace;
    }
  }, [messages, isLoading, progressSteps, progressTrace]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const handleActionClick = (event: Event) => {
      onActionSelected((event as CommerceActionClickEvent).detail.prompt);
    };

    element.addEventListener('commerce-action-click', handleActionClick);
    return () =>
      element.removeEventListener('commerce-action-click', handleActionClick);
  }, [onActionSelected]);

  return <cac-message-list ref={elementRef} slot={slot} />;
}
