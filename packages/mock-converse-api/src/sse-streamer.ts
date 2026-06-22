import type http from 'node:http';
import {setCorsHeaders} from './cors.js';

const DEFAULT_DELAY_MS = 25;

export function streamSSEResponse(
  res: http.ServerResponse,
  content: string
): void {
  setCorsHeaders(res);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const events = splitSSEEvents(content);

  let index = 0;
  const writeNext = () => {
    if (index < events.length) {
      res.write(events[index]);
      index++;
      setTimeout(writeNext, DEFAULT_DELAY_MS);
    } else {
      res.end();
    }
  };

  writeNext();
}

function splitSSEEvents(content: string): string[] {
  const events: string[] = [];
  const lines = content.split('\n');
  let current = '';

  for (const line of lines) {
    if (line.startsWith('event:') && current.trim()) {
      events.push(current.trimEnd() + '\n\n');
      current = '';
    }
    current += line + '\n';
  }

  if (current.trim()) {
    events.push(current.trimEnd() + '\n\n');
  }

  return events;
}
