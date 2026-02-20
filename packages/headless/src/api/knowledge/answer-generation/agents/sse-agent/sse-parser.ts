/**
 * Parses an SSE (Server-Sent Events) byte stream into JSON objects.
 *
 * Follows the SSE standard:
 * - Events are separated by double newlines (`\n\n`)
 * - Only `data:` prefixed lines are processed
 * - Multi-line data events are joined before parsing
 * - Non-data fields (event, id, retry) are ignored
 */
export async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<unknown> {
  const decoder = new TextDecoder('utf-8', {fatal: false});
  let buffer = '';

  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, {stream: true});

      const events = buffer.split('\n\n');
      // Keep the last potentially incomplete event in the buffer
      buffer = events.pop() ?? '';

      for (const rawEvent of events) {
        const parsed = processSSEEvent(rawEvent);
        if (parsed !== undefined) {
          yield parsed;
        }
      }
    }

    // Flush any remaining bytes from the decoder
    buffer += decoder.decode();
    if (buffer) {
      const parsed = processSSEEvent(buffer);
      if (parsed !== undefined) {
        yield parsed;
      }
    }
  } finally {
    reader.cancel().catch(() => {
      /* already done */
    });
  }
}

/**
 * Extracts and joins `data:` lines from a single SSE event block,
 * then parses the result as JSON.
 */
function processSSEEvent(eventText: string): unknown | undefined {
  const lines = eventText.split('\n');
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('data:')) {
      // Remove 'data:' prefix and optionally a single space afterwards
      dataLines.push(line.slice(5).replace(/^ /, ''));
    }
  }

  if (dataLines.length === 0) {
    return undefined;
  }

  return JSON.parse(dataLines.join('\n'));
}
