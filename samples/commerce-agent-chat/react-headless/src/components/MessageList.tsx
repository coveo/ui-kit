import {Fragment, useEffect, useMemo, useRef} from 'react';
import type {
  AgentChatMessage,
  AgentChatProgress,
} from '@coveo/headless/commerce';
import {ActivityRenderer} from './ActivityRenderer.js';
import {renderMarkdown} from '../../../core/src/lib/markdown.js';

import './MessageList.css';

interface CommerceActionClickEvent extends CustomEvent<{prompt: string}> {}

interface MessageListProps {
  messages: AgentChatMessage[];
  isStreaming: boolean;
  progress: AgentChatProgress;
  onActionSelected: (prompt: string) => void;
}

interface ActivityMessage {
  id: string;
  activityType: string;
  content: unknown;
}

interface ProgressTraceElement extends HTMLElement {
  progressTrace: unknown[];
  progressSteps: string[];
  isStreaming: boolean;
  messageId: string;
}

interface ProgressTraceBridgeProps {
  progressTrace: unknown[];
  progressSteps: string[];
  isStreaming: boolean;
  messageId: string;
}

interface ProgressTraceEntry {
  id: string;
  kind: 'reasoning' | 'tool';
  label: string;
  text: string;
  status: 'streaming' | 'completed';
}

interface SurfaceComponent {
  component?: Record<string, unknown>;
}

interface SurfaceOperation {
  dataModelUpdate?: {
    surfaceId?: string;
    contents?: Array<{
      valueMap?: Array<{
        valueMap?: Array<{
          key: string;
          valueString?: string;
          valueNumber?: number;
        }>;
      }>;
    }>;
  };
  surfaceUpdate?: {
    surfaceId?: string;
    components?: SurfaceComponent[];
  };
}

interface SurfaceContent {
  operations?: SurfaceOperation[];
}

type ProductRecord = Record<string, unknown>;

function getSurfaceOperations(activity: ActivityMessage): SurfaceOperation[] {
  if (activity.activityType !== 'a2ui-surface') {
    return [];
  }

  return (activity.content as SurfaceContent | undefined)?.operations ?? [];
}

function activityContainsNextActions(activity: ActivityMessage) {
  const operations = getSurfaceOperations(activity);

  return operations.some((operation) =>
    (operation.surfaceUpdate?.components ?? []).some((component) =>
      Object.keys(component.component ?? {}).some((componentType) =>
        isType(componentType, 'NextActionsBar')
      )
    )
  );
}

function normalizeType(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isType(value: string, expected: string) {
  return normalizeType(value) === normalizeType(expected);
}

function valueMapToRecord(
  entries: Array<{key: string; valueString?: string; valueNumber?: number}>
): Record<string, string | number | undefined> {
  const record: Record<string, string | number | undefined> = {};
  for (const entry of entries) {
    if (entry.valueString != null) {
      record[entry.key] = entry.valueString;
    } else if (entry.valueNumber != null) {
      record[entry.key] = entry.valueNumber;
    }
  }
  return record;
}

function extractProductsBySurface(
  operations: SurfaceOperation[]
): Map<string, ProductRecord[]> {
  const bySurface = new Map<string, Map<string, ProductRecord>>();

  const getSurfaceProductsById = (surfaceId: string) => {
    const existing = bySurface.get(surfaceId);
    if (existing) {
      return existing;
    }
    const created = new Map<string, ProductRecord>();
    bySurface.set(surfaceId, created);
    return created;
  };

  for (const operation of operations) {
    const update = operation.dataModelUpdate;
    if (!update) {
      continue;
    }

    const surfaceId = (update.surfaceId ?? '').trim();
    if (!surfaceId) {
      continue;
    }

    for (const collection of update.contents ?? []) {
      for (const item of collection.valueMap ?? []) {
        if (!item.valueMap) {
          continue;
        }
        const record = valueMapToRecord(item.valueMap);
        if (typeof record.ec_product_id !== 'string') {
          continue;
        }

        const surfaceProductsById = getSurfaceProductsById(surfaceId);
        surfaceProductsById.delete(record.ec_product_id);
        surfaceProductsById.set(record.ec_product_id, record);
      }
    }
  }

  return new Map(
    Array.from(bySurface.entries(), ([surfaceId, productsById]) => [
      surfaceId,
      Array.from(productsById.values()),
    ])
  );
}

function partitionAssistantActivities(activities: ActivityMessage[]) {
  return {
    leadingActivities: activities.filter(
      (activity) => !activityContainsNextActions(activity)
    ),
    trailingActivities: activities.filter((activity) =>
      activityContainsNextActions(activity)
    ),
  };
}

function buildBundleProducts(activities: ActivityMessage[]) {
  const operations = activities.flatMap((activity) =>
    getSurfaceOperations(activity)
  );
  return extractProductsBySurface(operations) as Map<string, ProductRecord[]>;
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

function ProgressTraceBridge({
  progressTrace,
  progressSteps,
  isStreaming,
  messageId,
}: ProgressTraceBridgeProps): React.JSX.Element {
  const elementRef = useRef<ProgressTraceElement | null>(null);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    elementRef.current.progressTrace = progressTrace;
    elementRef.current.progressSteps = progressSteps;
    elementRef.current.isStreaming = isStreaming;
    elementRef.current.messageId = messageId;
  }, [progressTrace, progressSteps, isStreaming, messageId]);

  const hasStatus =
    isStreaming || progressTrace.length > 0 || progressSteps.length > 0;
  if (!hasStatus) {
    return <></>;
  }

  return <cac-progress-trace ref={elementRef} />;
}

export function MessageList({
  messages,
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
          partitionAssistantActivities(messageActivities);
        const bundleProducts = buildBundleProducts(messageActivities);
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
              <ProgressTraceBridge
                progressTrace={groupedProgressTrace as unknown[]}
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
                isLoading={Boolean(
                  isLatestAssistantMessage && activity.id === activeActivityId
                )}
                allowNextActionsFallback={activityContainsNextActions(activity)}
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
                isLoading={Boolean(
                  isLatestAssistantMessage && activity.id === activeActivityId
                )}
                allowNextActionsFallback={activityContainsNextActions(activity)}
                bundleProducts={bundleProducts}
              />
            ))}
          </Fragment>
        );
      })}
    </section>
  );
}
