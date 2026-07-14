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
  routedEvent,
}: {
  routedEvent: ConverseEvent;
}): ConverseEvent[] => [TurnStarted(), routedEvent, TurnComplete()];

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
  buildConversationResponse({
    runId,
    middleEvents: [activitySnapshot],
    threadId,
    includeInitialStateSnapshot,
    includeFinalStateSnapshot,
  });

export {
  buildActivityOnlyResponse,
  buildConversationResponse,
  buildRoutedResponse,
};
