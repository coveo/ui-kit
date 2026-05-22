import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import * as conversationMutators from '@/src/core/interface/conversation/conversation-mutators.js';
import * as conversationEndpointMutators from './conversation-endpoint-mutators.js';
import type {FailTurnPayload} from '@/src/core/interface/conversation/conversation-types.js';

const missingTerminalErrorMessage =
  'Conversation stream ended before a terminal event was received.';

interface TurnLifecycleOptions {
  turnId: string;
  finalizedAt: number;
}

interface FailedTurnLifecycleOptions extends TurnLifecycleOptions {
  reason: FailTurnPayload['reason'];
  error: string;
}

export const getStreamConnectedMutations = (): StateMutation[] => {
  return [conversationEndpointMutators.setStreamingConnected(true)];
};

export const getStreamStartedMutations = (): StateMutation[] => {
  return [conversationEndpointMutators.setStatus('streaming')];
};

export const getSuccessfulTurnMutations = ({
  turnId,
  finalizedAt,
}: TurnLifecycleOptions): StateMutation[] => {
  return [
    conversationMutators.completeTurn({turnId, finalizedAt}),
    conversationEndpointMutators.setStatus('idle'),
    conversationEndpointMutators.setStreamingConnected(false),
  ];
};

export const getFailedTurnMutations = ({
  turnId,
  finalizedAt,
  reason,
  error,
}: FailedTurnLifecycleOptions): StateMutation[] => {
  return [
    conversationMutators.failTurn({
      turnId,
      finalizedAt,
      reason,
    }),
    conversationMutators.setError(error),
    conversationEndpointMutators.setError(error),
    conversationEndpointMutators.setStatus('idle'),
    conversationEndpointMutators.setStreamingConnected(false),
  ];
};

export const getMissingTerminalMutations = ({
  turnId,
  finalizedAt,
}: TurnLifecycleOptions): StateMutation[] => {
  return getFailedTurnMutations({
    turnId,
    finalizedAt,
    reason: 'stream_interrupted',
    error: missingTerminalErrorMessage,
  });
};
