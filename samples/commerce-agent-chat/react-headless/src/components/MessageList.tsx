import {Fragment, useEffect, useMemo, useRef} from 'react';
import type {
  AgentChatCatalogControllerState,
  AgentChatMessage,
  AgentChatProgress,
} from '@coveo/headless/commerce';
import {ActivityRenderer} from './ActivityRenderer.js';
import {ProgressTrace, type ProgressTraceEntry} from './ProgressTrace.js';
import {renderMarkdown} from '../lib/markdown.js';

import './MessageList.css';

interface CommerceActionClickEvent extends CustomEvent<{prompt: string}> {}

interface MessageListProps {
  messages: AgentChatMessage[];
  catalogState: AgentChatCatalogControllerState;
  isStreaming: boolean;
  progress: AgentChatProgress;
  onActionSelected: (prompt: string) => void;
}

interface ActivityMessage {
  id: string;
  activityType: string;
  content: unknown;
}
function partitionAssistantActivities(
  activities: ActivityMessage[],
  catalogState: AgentChatCatalogControllerState
) {
  return {
    leadingActivities: activities.filter(
      (activity) =>
        !catalogState.activities[activity.id]?.hasNextActionsComponent
    ),
    trailingActivities: activities.filter((activity) =>
      Boolean(catalogState.activities[activity.id]?.hasNextActionsComponent)
    ),
  };
}

function normalizeToolLabel(label: string) {
  return label
    .trim()
    .replace(/^Tool\s+call:\s*/i, '')
    .toLowerCase();
}

function groupSuccessiveToolTraceEntries(trace: ProgressTraceEntry[]) {
  const grouped: ProgressTraceEntry[] = [];

  for (const entry of trace) {
    const previous = grouped[grouped.length - 1];
    const canGroupWithPrevious =
      previous &&
      previous.kind === 'tool' &&
      entry.kind === 'tool' &&
      normalizeToolLabel(previous.label) === normalizeToolLabel(entry.label);

    if (!canGroupWithPrevious) {
      grouped.push({...entry});
      continue;
    }

    const mergedText = [previous.text, entry.text].filter(Boolean).join('\n\n');

    grouped[grouped.length - 1] = {
      ...previous,
      id: entry.id,
      label: previous.label,
      text: mergedText,
      status: entry.status,
    };
  }

  return grouped;
}

export function MessageList({
  messages,
  catalogState,
  isStreaming,
  progress,
  onActionSelected,
}: MessageListProps): React.JSX.Element {
  const listRef = useRef<HTMLElement | null>(null);
  const lastAssistantId = useMemo(
    () =>
      [...messages].reverse().find((message) => message.role === 'assistant')
        ?.id,
    [messages]
  );

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'auto',
    });
  }, [messages, isStreaming]);

  useEffect(() => {
    const element = listRef.current;
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

  if (messages.length === 0) {
    return (
      <section
        className="rh-message-list"
        ref={listRef}
        aria-live="polite"
        aria-label="Conversation messages"
      >
        <p className="rh-empty-state">
          Start a conversation with the commerce agent
        </p>
      </section>
    );
  }

  return (
    <section
      className="rh-message-list"
      ref={listRef}
      aria-live="polite"
      aria-label="Conversation messages"
    >
      {messages.map((message) => {
        const messageActivities = (message.activities ?? []).map(
          (activity) => ({
            id: activity.id,
            activityType: activity.type,
            content: activity.data,
          })
        );
        const isLatestAssistantMessage =
          isStreaming &&
          message.role === 'assistant' &&
          message.id === lastAssistantId;
        const activeActivityId =
          messageActivities[messageActivities.length - 1]?.id;
        const {leadingActivities, trailingActivities} =
          partitionAssistantActivities(messageActivities, catalogState);
        const bundleProducts =
          catalogState.messages[message.id]?.productsBySurface ?? {};
        const shouldShowStreamingProgress =
          message.role === 'assistant' && message.id === lastAssistantId;
        const messageProgressTrace = message.progress?.trace ?? [];
        const messageProgressSteps = message.progress?.steps ?? [];
        const progressTrace = shouldShowStreamingProgress
          ? progress.trace
          : messageProgressTrace;
        const progressSteps = shouldShowStreamingProgress
          ? progress.steps
          : messageProgressSteps;
        const groupedProgressTrace = groupSuccessiveToolTraceEntries(
          progressTrace as ProgressTraceEntry[]
        );

        return (
          <Fragment key={message.id}>
            {message.role === 'user' && (
              <article className="rh-message rh-message-user">
                <p className="rh-message-content rh-message-content--plain">
                  {message.content}
                </p>
              </article>
            )}

            {message.role === 'assistant' && (
              <ProgressTrace
                progressTrace={groupedProgressTrace}
                progressSteps={progressSteps}
                isStreaming={Boolean(
                  shouldShowStreamingProgress && isStreaming
                )}
                messageId={message.id}
              />
            )}

            {leadingActivities.map((activity) => (
              <ActivityRenderer
                key={activity.id}
                activity={activity}
                catalog={catalogState.activities[activity.id] ?? null}
                isLoading={Boolean(
                  isLatestAssistantMessage && activity.id === activeActivityId
                )}
                allowNextActionsFallback={Boolean(
                  catalogState.activities[activity.id]?.hasNextActionsComponent
                )}
                bundleProducts={bundleProducts}
              />
            ))}

            {message.role === 'assistant' && Boolean(message.content) && (
              <article className="rh-message rh-message-assistant">
                <div
                  className="rh-message-content rh-message-content--markdown"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(message.content),
                  }}
                />
              </article>
            )}

            {trailingActivities.map((activity) => (
              <ActivityRenderer
                key={activity.id}
                activity={activity}
                catalog={catalogState.activities[activity.id] ?? null}
                isLoading={Boolean(
                  isLatestAssistantMessage && activity.id === activeActivityId
                )}
                allowNextActionsFallback={Boolean(
                  catalogState.activities[activity.id]?.hasNextActionsComponent
                )}
                bundleProducts={bundleProducts}
              />
            ))}
          </Fragment>
        );
      })}
    </section>
  );
}
