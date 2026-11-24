import type {BaseEvent} from '@ag-ui/core';
import {
  type EventSourceMessage,
  getBytes,
  getLines,
  getMessages,
} from '../../../../../utils/fetch-event-source/parse.js';

const flushTrailingFrame = new Uint8Array([10, 10]);

/**
 * Reads an AG-UI server-sent event stream and calls `onEvent` with the JSON payload of each frame's `data` field.
 * Frames without data, and fields other than `data` (`event`, `id`, `retry`, comments), are ignored.
 * A last frame not terminated by a blank line is still dispatched when the stream ends, like `@ag-ui/client` does.
 *
 * @param body The response body to read.
 * @param onEvent Called for each event, in order.
 * @returns A promise that resolves when the stream ends, and rejects if reading fails or a frame isn't valid JSON.
 */
export async function readEventStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: BaseEvent) => void
) {
  const onMessage = ({data}: EventSourceMessage) => {
    if (data) {
      onEvent(JSON.parse(data));
    }
  };
  const onChunk = getLines(
    getMessages(
      () => {},
      () => {},
      onMessage
    )
  );
  await getBytes(body, onChunk);
  onChunk(flushTrailingFrame);
}
