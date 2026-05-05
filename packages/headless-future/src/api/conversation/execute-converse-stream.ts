import type {TransportAdapter} from '@/src/api/adapters/types.js';
import {createBufferProcessor} from '@/src/api/protocol/buffer.js';
import {parseSSEEvent} from '@/src/api/protocol/sse-parser.js';
import type {NormalizedStreamEvent} from '@/src/api/protocol/types.js';

export type StreamLifecycleEvent = {type: 'opened' | 'closed'};

export type ConverseStreamCallbacks = {
  onNormalizedEvent?: (event: NormalizedStreamEvent) => void;
  onBytesReceived?: (bytes: number) => void;
  onLifecycle?: (event: StreamLifecycleEvent) => void;
  onUnknownEvent?: (
    event: Extract<NormalizedStreamEvent, {type: 'UNKNOWN' | 'CUSTOM'}>
  ) => void;
};

export type ConverseStreamOutcome =
  | {kind: 'completed'}
  | {kind: 'completed_missing_terminal'}
  | {kind: 'aborted'; reason?: unknown}
  | {kind: 'transport_error'; code: string; message: string}
  | {kind: 'protocol_error'; code: string; message: string}
  | {kind: 'internal_error'; message: string};

export type ExecuteConverseStreamParams = {
  transport: TransportAdapter;
  body: unknown;
  signal?: AbortSignal;
  callbacks?: ConverseStreamCallbacks;
};

export async function executeConverseStream({
  transport,
  body,
  signal,
  callbacks,
}: ExecuteConverseStreamParams): Promise<ConverseStreamOutcome> {
  const decoder = new TextDecoder();
  const runtimeState: {
    sawTerminalEvent: boolean;
    streamClosed: boolean;
    protocolError: {code: string; message: string} | null;
    transportError: {code: string; message: string} | null;
  } = {
    sawTerminalEvent: false,
    streamClosed: false,
    protocolError: null,
    transportError: null,
  };

  const bufferProcessor = createBufferProcessor((rawEvent) => {
    const normalized = parseSSEEvent(rawEvent);
    callbacks?.onNormalizedEvent?.(normalized);

    if (
      normalized.type === 'RUN_FINISHED' ||
      normalized.type === 'turn_complete'
    ) {
      runtimeState.sawTerminalEvent = true;
    }

    if (normalized.type === 'RUN_ERROR') {
      runtimeState.protocolError = {
        code: normalized.code ?? 'RUN_ERROR',
        message: normalized.message ?? 'Stream error',
      };
    }

    if (normalized.type === 'CUSTOM' || normalized.type === 'UNKNOWN') {
      callbacks?.onUnknownEvent?.(normalized);
    }
  });

  try {
    callbacks?.onLifecycle?.({type: 'opened'});

    await transport.openStream({
      path: '/rest/organizations/{organizationId}/ai/v1/converse',
      body,
      signal,
      onChunk: (chunk) => {
        callbacks?.onBytesReceived?.(chunk.byteLength);
        const text = decoder.decode(chunk, {stream: true});
        bufferProcessor.processChunk(text);
      },
      onError: (error) => {
        runtimeState.transportError = error;
      },
      onClose: () => {
        bufferProcessor.flush();
        runtimeState.streamClosed = true;
        callbacks?.onLifecycle?.({type: 'closed'});
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected stream failure';
    return {kind: 'internal_error', message};
  }

  if (signal?.aborted && !runtimeState.streamClosed) {
    return {kind: 'aborted', reason: signal.reason};
  }

  if (runtimeState.transportError) {
    return {
      kind: 'transport_error',
      code: runtimeState.transportError.code,
      message: runtimeState.transportError.message,
    };
  }

  if (runtimeState.protocolError) {
    return {
      kind: 'protocol_error',
      code: runtimeState.protocolError.code,
      message: runtimeState.protocolError.message,
    };
  }

  if (runtimeState.streamClosed) {
    return runtimeState.sawTerminalEvent
      ? {kind: 'completed'}
      : {kind: 'completed_missing_terminal'};
  }

  if (signal?.aborted) {
    return {kind: 'aborted', reason: signal.reason};
  }

  return {
    kind: 'internal_error',
    message: 'Stream ended without terminal close, error, or abort signal',
  };
}
