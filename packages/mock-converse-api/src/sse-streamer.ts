import type http from 'node:http';
import {setCorsHeaders} from './cors.js';

const DEFAULT_DELAY_MS = 25;

export function streamSSEResponse(
  res: http.ServerResponse,
  content: string,
  version?: string
): void {
  setCorsHeaders(res);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  let events = splitSSEEvents(content);
  if (version === '0.9') {
    events = events.map(translateEventToV09);
  }

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

function translateEventToV09(eventStr: string): string {
  if (!eventStr.includes('data:')) {
    return eventStr;
  }

  // Find where the JSON data starts
  const dataPrefix = 'data:';
  const dataIndex = eventStr.indexOf(dataPrefix);
  if (dataIndex === -1) {
    return eventStr;
  }

  // Find start of JSON object on the data line
  const jsonStart = eventStr.indexOf('{', dataIndex);
  if (jsonStart === -1) {
    return eventStr;
  }

  // Find where the JSON object ends (it might end at a newline)
  const nextNewline = eventStr.indexOf('\n', jsonStart);
  const jsonEnd = nextNewline === -1 ? eventStr.length : nextNewline;
  const jsonStr = eventStr.substring(jsonStart, jsonEnd).trim();

  try {
    const data = JSON.parse(jsonStr);

    if (
      data.type === 'ACTIVITY_SNAPSHOT' &&
      data.content &&
      Array.isArray(data.content.operations)
    ) {
      const v09Ops = data.content.operations.map((op: any) => {
        if ('beginRendering' in op) {
          const {surfaceId, catalogId} = op.beginRendering;
          return {
            createSurface: {
              surfaceId,
              catalogId: catalogId || 'a2ui-surface',
              version: '0.9',
            },
          };
        }

        if ('surfaceUpdate' in op) {
          const {surfaceId, components} = op.surfaceUpdate;
          const v09Components = components.map((comp: any) => {
            const {id, component} = comp;
            if (component && typeof component === 'object') {
              const entries = Object.entries(component);
              if (entries.length > 0) {
                const [type, props] = entries[0];
                return {
                  id,
                  component: type,
                  ...(props as Record<string, any>),
                };
              }
            }
            return comp;
          });
          return {
            updateComponents: {
              surfaceId,
              components: v09Components,
            },
          };
        }

        if ('dataModelUpdate' in op) {
          const {surfaceId, contents} = op.dataModelUpdate;
          const value: Record<string, any> = {};
          for (const content of contents) {
            value[content.key] = extractV08DataValue(content);
          }
          return {
            updateDataModel: {
              surfaceId,
              path: '/',
              value,
            },
          };
        }

        return op;
      });

      data.content.operations = v09Ops;
      const updatedJson = JSON.stringify(data);
      return (
        eventStr.substring(0, jsonStart) +
        updatedJson +
        eventStr.substring(jsonEnd)
      );
    }
  } catch (err) {
    console.error('Failed to translate SSE event to v0.9:', err);
  }

  return eventStr;
}

function extractV08DataValue(content: any): any {
  if (content.valueString !== undefined) return content.valueString;
  if (content.valueNumber !== undefined) return content.valueNumber;
  if (content.valueBoolean !== undefined) return content.valueBoolean;
  if (content.valueMap) {
    return content.valueMap.map((entry: any) => {
      if (entry.valueMap) {
        const obj: Record<string, any> = {};
        for (const field of entry.valueMap) {
          obj[field.key] =
            field.valueString ?? field.valueNumber ?? field.valueBoolean;
        }
        return obj;
      }
      return entry;
    });
  }
  return null;
}
