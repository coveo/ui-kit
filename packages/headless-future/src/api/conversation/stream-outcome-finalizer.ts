import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {ConverseStreamOutcome} from '@/src/api/conversation/execute-converse-stream.js';
import * as streamingMutators from '@/src/core/interface/streaming/streaming-mutators.js';
import {
  finalizeTurnAborted,
  finalizeTurnCompleted,
  finalizeTurnFailed,
} from './turn-finalizer.js';

export type StreamTurnContext = {
  turnId: string;
  assistantMessageId: string;
};

export const finalizeFromStreamOutcome = (
  fullEngine: FullEngine,
  outcome: ConverseStreamOutcome,
  turn: StreamTurnContext
): boolean => {
  switch (outcome.kind) {
    case 'completed':
      return finalizeTurnCompleted(
        fullEngine,
        turn.turnId,
        turn.assistantMessageId,
        true
      );
    case 'completed_missing_terminal':
      return finalizeTurnCompleted(
        fullEngine,
        turn.turnId,
        turn.assistantMessageId,
        false
      );
    case 'aborted':
      return finalizeTurnAborted(fullEngine, turn.turnId, 'stream-abort');
    case 'transport_error':
      fullEngine.mutate(
        streamingMutators.setStreamError({
          code: outcome.code,
          message: outcome.message,
        })
      );
      return finalizeTurnFailed(fullEngine, turn.turnId, {
        code: outcome.code,
        message: outcome.message,
        source: 'transport',
        recoverable: true,
      });
    case 'protocol_error':
      return finalizeTurnFailed(fullEngine, turn.turnId, {
        code: outcome.code,
        message: outcome.message,
        source: 'protocol',
        recoverable: false,
      });
    case 'internal_error':
      return finalizeTurnFailed(fullEngine, turn.turnId, {
        code: 'STREAM_INTERNAL_ERROR',
        message: outcome.message,
        source: 'controller',
        recoverable: true,
      });
  }
};
