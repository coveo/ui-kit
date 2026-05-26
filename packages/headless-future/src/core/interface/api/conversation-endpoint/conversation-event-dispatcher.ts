import type {ConversationStreamEvent} from '@/src/api/index.js';
import type {
  ConversationRuntimeFailReason,
  ConversationRuntimeSession,
} from './conversation-runtime.js';

type SessionPatch = Partial<ConversationRuntimeSession>;

export type ConversationDispatchEffect =
  | {
      type: 'append_agent_chunk';
      chunk: string;
    }
  | {
      type: 'patch_session';
      sessionPatch: SessionPatch;
    }
  | {
      type: 'complete_turn';
    }
  | {
      type: 'fail_turn';
      reason: ConversationRuntimeFailReason;
      error: string;
    }
  | {
      type: 'set_endpoint_error';
      error: string;
    };

function readTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function hasSessionPatchValue(sessionPatch: SessionPatch): boolean {
  return Object.keys(sessionPatch).length > 0;
}

function getTurnStartedSessionPatch(
  event: Extract<ConversationStreamEvent, {type: 'turn_started'}>
): SessionPatch {
  return {
    ...(event.conversationSessionId !== undefined
      ? {conversationSessionId: event.conversationSessionId}
      : {}),
    ...(event.conversationToken !== undefined
      ? {conversationToken: event.conversationToken}
      : {}),
  };
}

function getRunStartedSessionPatch(
  event: Extract<ConversationStreamEvent, {type: 'RUN_STARTED'}>
): SessionPatch {
  return event.threadId ? {conversationSessionId: event.threadId} : {};
}

function getCustomHeaderSessionPatch(
  event: Extract<ConversationStreamEvent, {type: 'CUSTOM'}>
): SessionPatch {
  if (event.name !== 'header') {
    return {};
  }

  if (
    !event.value ||
    typeof event.value !== 'object' ||
    Array.isArray(event.value)
  ) {
    return {};
  }

  const record = event.value as Record<string, unknown>;
  const conversationSessionId =
    readTrimmedString(record.conversationSessionId) ??
    readTrimmedString(record.threadId) ??
    readTrimmedString(record.conversationId);
  const conversationToken = readTrimmedString(record.conversationToken);

  return {
    ...(conversationSessionId
      ? {
          conversationSessionId,
        }
      : {}),
    ...(conversationToken
      ? {
          conversationToken,
        }
      : {}),
  };
}

export interface DispatchConversationEventOptions {
  event: ConversationStreamEvent;
}

export interface DispatchConversationEventResult {
  effects: ConversationDispatchEffect[];
  isTerminalEvent: boolean;
  isMeaningfulEvent: boolean;
}

export function dispatchConversationEvent({
  event,
}: DispatchConversationEventOptions): DispatchConversationEventResult {
  switch (event.type) {
    case 'turn_complete':
      return {
        effects: [{type: 'complete_turn'}],
        isTerminalEvent: true,
        isMeaningfulEvent: true,
      };

    case 'RUN_ERROR': {
      return {
        effects: [
          {
            type: 'fail_turn',
            reason: 'protocol_error',
            error: event.message,
          },
        ],
        isTerminalEvent: true,
        isMeaningfulEvent: true,
      };
    }

    case 'TEXT_MESSAGE_CONTENT': {
      const effects: ConversationDispatchEffect[] = [];
      if (event.delta) {
        effects.push({
          type: 'append_agent_chunk',
          chunk: event.delta,
        });
      }

      return {
        effects,
        isTerminalEvent: false,
        isMeaningfulEvent: true,
      };
    }

    case 'turn_started': {
      const sessionPatch = getTurnStartedSessionPatch(event);

      return {
        effects: hasSessionPatchValue(sessionPatch)
          ? [{type: 'patch_session', sessionPatch}]
          : [],
        isTerminalEvent: false,
        isMeaningfulEvent: true,
      };
    }

    case 'RUN_STARTED': {
      const sessionPatch = getRunStartedSessionPatch(event);

      return {
        effects: hasSessionPatchValue(sessionPatch)
          ? [{type: 'patch_session', sessionPatch}]
          : [],
        isTerminalEvent: false,
        isMeaningfulEvent: true,
      };
    }

    case 'UNKNOWN':
      return {
        effects: [
          {
            type: 'set_endpoint_error',
            error: `Conversation stream warning: unsupported event "${event.event}".`,
          },
        ],
        isTerminalEvent: false,
        isMeaningfulEvent: false,
      };

    case 'CUSTOM': {
      const sessionPatch = getCustomHeaderSessionPatch(event);

      if (hasSessionPatchValue(sessionPatch)) {
        return {
          effects: [{type: 'patch_session', sessionPatch}],
          isTerminalEvent: false,
          isMeaningfulEvent: true,
        };
      }

      return {
        effects: [
          {
            type: 'set_endpoint_error',
            error: `Conversation stream warning: custom event "${event.name}" was ignored.`,
          },
        ],
        isTerminalEvent: false,
        isMeaningfulEvent: false,
      };
    }

    default:
      return {
        effects: [],
        isTerminalEvent: false,
        isMeaningfulEvent: true,
      };
  }
}
