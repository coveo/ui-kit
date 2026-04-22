import {useEffect, useRef} from 'react';
import type {
  AgentChatMessage,
  AgentChatProgress,
} from '@coveo/headless/commerce';

interface CommerceActionClickEvent extends CustomEvent<{prompt: string}> {}

interface MessageListProps {
  messages: AgentChatMessage[];
  isStreaming: boolean;
  progress: AgentChatProgress;
  onActionSelected: (prompt: string) => void;
  slot?: string;
}

interface MessageListElement extends HTMLElement {
  messages: unknown[];
  isLoading: boolean;
  progressSteps: string[];
  progressTrace: unknown[];
}

export function MessageList({
  messages,
  isStreaming,
  progress,
  onActionSelected,
  slot,
}: MessageListProps): React.JSX.Element {
  const elementRef = useRef<MessageListElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      // Map headless messages to the shape the web component expects
      elementRef.current.messages = messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        activities: m.activities.map((a) => ({
          id: a.id,
          activityType: a.type,
          content: a.data,
        })),
        progress: m.progress
          ? {
              progressSteps: m.progress.steps,
              progressTrace: m.progress.trace,
            }
          : undefined,
      }));
      elementRef.current.isLoading = isStreaming;
      elementRef.current.progressSteps = progress.steps;
      elementRef.current.progressTrace = progress.trace;
    }
  }, [messages, isStreaming, progress]);

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
