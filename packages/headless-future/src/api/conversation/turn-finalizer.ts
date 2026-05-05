import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as conversationSelectors from '@/src/core/interface/conversation/selectors.js';
import * as conversationMutators from '@/src/core/interface/conversation/mutate.js';
import * as streamingMutators from '@/src/core/interface/streaming/mutate.js';
import type {
  ConversationErrorSource,
  ConversationWarningCode,
  TurnStatus,
} from '@/src/core/interface/conversation/types.js';

const terminalStatuses: TurnStatus[] = [
  'completed',
  'completed_with_warnings',
  'failed',
  'aborted',
];

const validTransitions: Record<TurnStatus, TurnStatus[]> = {
  pending: ['streaming', 'failed', 'aborted'],
  streaming: ['completed', 'completed_with_warnings', 'failed', 'aborted'],
  completed: [],
  completed_with_warnings: [],
  failed: [],
  aborted: [],
};

function isTerminalStatus(status: TurnStatus): boolean {
  return terminalStatuses.includes(status);
}

function getCurrentStatus(
  fullEngine: FullEngine,
  turnId: string
): TurnStatus | undefined {
  const turn = fullEngine
    .read(conversationSelectors.turns)
    .find((t) => t.id === turnId);
  return turn?.status;
}

function addWarning(
  fullEngine: FullEngine,
  turnId: string,
  warning: ConversationWarningCode
) {
  fullEngine.mutate(conversationMutators.addTurnWarnings(turnId, [warning]));
}

function applyTurnStatusTransition(
  fullEngine: FullEngine,
  turnId: string,
  nextStatus: TurnStatus,
  extras?: {
    finalizedAt?: number;
    reason?: string;
    assistantMessageId?: string;
    warnings?: ConversationWarningCode[];
  }
): boolean {
  const currentStatus = getCurrentStatus(fullEngine, turnId);
  if (!currentStatus) {
    return false;
  }

  if (currentStatus === nextStatus && isTerminalStatus(nextStatus)) {
    addWarning(fullEngine, turnId, 'double_finalization_attempt');
    return false;
  }

  if (!validTransitions[currentStatus].includes(nextStatus)) {
    addWarning(fullEngine, turnId, 'invalid_state_transition');
    return false;
  }

  fullEngine.mutate(
    conversationMutators.updateTurnStatus(turnId, nextStatus, {
      finalizedAt: extras?.finalizedAt,
      reason: extras?.reason,
      assistantMessageId: extras?.assistantMessageId,
      warningCodes: extras?.warnings,
    })
  );

  if (isTerminalStatus(nextStatus)) {
    fullEngine.mutate(conversationMutators.setActiveTurnId(null));
    fullEngine.mutate(conversationMutators.setLoading(false));
    fullEngine.mutate(streamingMutators.setConnected(false));
  }

  return true;
}

export const markTurnStreaming = (
  fullEngine: FullEngine,
  turnId: string
): boolean => {
  return applyTurnStatusTransition(fullEngine, turnId, 'streaming');
};

export const finalizeTurnCompleted = (
  fullEngine: FullEngine,
  turnId: string,
  assistantMessageId: string,
  receivedTerminalEvent: boolean
): boolean => {
  const warnings: ConversationWarningCode[] = [];
  const status: TurnStatus = receivedTerminalEvent
    ? 'completed'
    : 'completed_with_warnings';

  if (!receivedTerminalEvent) {
    warnings.push('missing_terminal_event');
  }

  return applyTurnStatusTransition(fullEngine, turnId, status, {
    finalizedAt: Date.now(),
    assistantMessageId,
    warnings,
  });
};

export const finalizeTurnFailed = (
  fullEngine: FullEngine,
  turnId: string,
  error: {
    code: string;
    message: string;
    source: ConversationErrorSource;
    recoverable: boolean;
  }
): boolean => {
  fullEngine.mutate(conversationMutators.setError(error.message));
  fullEngine.mutate(
    conversationMutators.setStructuredError({
      code: error.code,
      message: error.message,
      source: error.source,
      recoverable: error.recoverable,
      timestamp: Date.now(),
      turnId,
    })
  );

  return applyTurnStatusTransition(fullEngine, turnId, 'failed', {
    finalizedAt: Date.now(),
    reason: error.message,
  });
};

export const finalizeTurnAborted = (
  fullEngine: FullEngine,
  turnId: string,
  reason: string
): boolean => {
  fullEngine.mutate(streamingMutators.setAborted(true));

  return applyTurnStatusTransition(fullEngine, turnId, 'aborted', {
    finalizedAt: Date.now(),
    reason,
  });
};
