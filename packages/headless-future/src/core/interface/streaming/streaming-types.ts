/**
 * Streaming Feature Types
 *
 * Tracks SSE stream connection lifecycle: status, telemetry, error state.
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 */

export type StreamError = {
  code: string;
  message: string;
};

export interface StreamingState {
  /** Whether the SSE connection is currently open */
  isConnected: boolean;
  /** Whether data is being buffered but not yet dispatched */
  isBuffering: boolean;
  /** Total bytes received in the current stream session */
  bytesReceived: number;
  /** Total normalized events dispatched in the current stream session */
  eventsReceived: number;
  /** Timestamp (ms) of the last received event */
  lastEventAt?: number;
  /** Non-null when the stream terminated with an error */
  error?: StreamError;
  /** Whether the stream was intentionally aborted by the client */
  aborted: boolean;
}
