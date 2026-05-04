import {createBufferProcessor} from '@/src/api/protocol/buffer.js';
import {parseSSEEvent} from '@/src/api/protocol/sse-parser.js';
import type {TransportAdapter} from '@/src/api/adapters/types.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as streamingMutators from '@/src/core/interface/streaming/mutate.js';
import * as conversationMutators from '@/src/core/interface/conversation/mutate.js';
import {dispatchStreamEvent} from './event-dispatcher.js';
import {finalizeTurnCompleted, finalizeTurnFailed} from './turn-finalizer.js';

export type ConversationLifecycleHooks = {
  turn_initialized?: (turnId: string) => void;
  stream_opened?: (turnId: string) => void;
  stream_closed?: (turnId: string) => void;
  turn_finalized?: (turnId: string) => void;
};

export type StreamLifecycleParams = {
  fullEngine: FullEngine;
  transport: TransportAdapter;
  turnId: string;
  assistantMessageId: string;
  body: unknown;
  signal: AbortSignal;
  hooks?: ConversationLifecycleHooks;
  onFinalized?: () => void;
};

export const openConversationStreamWithLifecycle = async ({
  fullEngine,
  transport,
  turnId,
  assistantMessageId,
  body,
  signal,
  hooks,
  onFinalized,
}: StreamLifecycleParams): Promise<void> => {
  const decoder = new TextDecoder();
  let hasTerminalEvent = false;
  let runErrorMessage: string | undefined;

  const finalizeOnce = (() => {
    let finalized = false;
    return (finalizeFn: () => void) => {
      if (finalized) {
        fullEngine.mutate(
          conversationMutators.addTurnWarnings(turnId, [
            'double_finalization_attempt',
          ])
        );
        return;
      }
      finalized = true;
      finalizeFn();
      hooks?.turn_finalized?.(turnId);
      onFinalized?.();
    };
  })();

  const bufferProcessor = createBufferProcessor((rawEvent) => {
    const normalized = parseSSEEvent(rawEvent);
    const result = dispatchStreamEvent(
      fullEngine,
      normalized,
      turnId,
      assistantMessageId
    );

    if (result.receivedTerminalEvent) {
      hasTerminalEvent = true;
    }
    if (result.runErrorMessage) {
      runErrorMessage = result.runErrorMessage;
    }
  });

  await transport.openStream({
    path: '/rest/organizations/{organizationId}/ai/v1/converse',
    body,
    signal,
    onChunk: (chunk) => {
      const text = decoder.decode(chunk, {stream: true});
      fullEngine.mutate(streamingMutators.addBytes(chunk.byteLength));
      bufferProcessor.processChunk(text);
    },
    onError: (error) => {
      fullEngine.mutate(streamingMutators.setStreamError(error));
      finalizeOnce(() => {
        finalizeTurnFailed(fullEngine, turnId, {
          code: error.code,
          message: error.message,
          source: 'transport',
          recoverable: true,
        });
      });
    },
    onClose: () => {
      bufferProcessor.flush();
      hooks?.stream_closed?.(turnId);
      fullEngine.mutate(streamingMutators.setConnected(false));

      finalizeOnce(() => {
        if (runErrorMessage) {
          finalizeTurnFailed(fullEngine, turnId, {
            code: 'RUN_ERROR',
            message: runErrorMessage,
            source: 'protocol',
            recoverable: false,
          });
          return;
        }

        finalizeTurnCompleted(
          fullEngine,
          turnId,
          assistantMessageId,
          hasTerminalEvent
        );
      });
    },
  });
};
