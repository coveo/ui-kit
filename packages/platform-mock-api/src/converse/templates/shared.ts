import {
  RunFinished,
  RunStarted,
  StateSnapshot,
  TurnComplete,
  TurnStarted,
  type ConverseEvent,
} from '../events.js';

interface BuildConversationResponseOptions {
  runId: string;
  middleEvents: ConverseEvent[];
  threadId?: string;
  includeInitialStateSnapshot?: boolean;
  includeFinalStateSnapshot?: boolean;
}

const buildConversationResponse = ({
  runId,
  middleEvents,
  threadId,
  includeInitialStateSnapshot = true,
  includeFinalStateSnapshot = true,
}: BuildConversationResponseOptions): ConverseEvent[] => [
  TurnStarted(),
  RunStarted({runId, threadId}),
  ...(includeInitialStateSnapshot ? [StateSnapshot()] : []),
  ...middleEvents,
  ...(includeFinalStateSnapshot ? [StateSnapshot()] : []),
  RunFinished({runId, threadId}),
  TurnComplete(),
];

const buildRoutedResponse = ({
  runId,
  routedEvent,
  threadId,
  includeInitialStateSnapshot = true,
  includeFinalStateSnapshot = true,
}: {
  runId: string;
  routedEvent: ConverseEvent;
  threadId?: string;
  includeInitialStateSnapshot?: boolean;
  includeFinalStateSnapshot?: boolean;
}): ConverseEvent[] =>
  buildConversationResponse({
    runId,
    middleEvents: [routedEvent],
    threadId,
    includeInitialStateSnapshot,
    includeFinalStateSnapshot,
  });

/**
 * @deprecated Use `buildRoutedResponse` instead.
 */
const buildActivityOnlyResponse = ({
  runId,
  activitySnapshot,
  threadId,
  includeInitialStateSnapshot = true,
  includeFinalStateSnapshot = true,
}: {
  runId: string;
  activitySnapshot: ConverseEvent;
  threadId?: string;
  includeInitialStateSnapshot?: boolean;
  includeFinalStateSnapshot?: boolean;
}): ConverseEvent[] =>
  buildRoutedResponse({
    runId,
    routedEvent: activitySnapshot,
    threadId,
    includeInitialStateSnapshot,
    includeFinalStateSnapshot,
  });

export {
  buildActivityOnlyResponse,
  buildConversationResponse,
  buildRoutedResponse,
};
