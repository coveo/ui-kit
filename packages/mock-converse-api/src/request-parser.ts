import http from 'node:http';
import type {ParsedRequest} from './types.js';

export class RequestParseError extends Error {
  public readonly statusCode: number;
  public readonly errorBody: Record<string, string>;

  constructor(statusCode: number, errorBody: Record<string, string>) {
    super(errorBody.error);
    this.name = 'RequestParseError';
    this.statusCode = statusCode;
    this.errorBody = errorBody;
  }
}

function collectBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

export async function parseRequestBody(
  req: http.IncomingMessage
): Promise<ParsedRequest> {
  const raw = await collectBody(req);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch (err) {
    const details = err instanceof Error ? err.message : 'Unknown parse error';
    throw new RequestParseError(400, {
      error: 'Invalid JSON',
      details,
    });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('message' in body) ||
    typeof (body as Record<string, unknown>).message !== 'string'
  ) {
    throw new RequestParseError(400, {
      error: 'Missing required field: message',
    });
  }

  return {message: (body as Record<string, unknown>).message as string};
}
