import type http from 'node:http';
import {setCorsHeaders, handlePreflight} from './cors.js';
import {parseRequestBody, RequestParseError} from './request-parser.js';
import {matchPrompt} from './prompt-matcher.js';
import {loadTemplate} from './template-loader.js';
import {streamSSEResponse} from './sse-streamer.js';

export function isConverseRoute(url: string): boolean {
  return new URL(url, 'http://localhost').pathname.endsWith('/converse');
}

function sendJsonError(
  res: http.ServerResponse,
  statusCode: number,
  body: Record<string, string>
): void {
  setCorsHeaders(res);
  res.writeHead(statusCode, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(body));
}

export function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse
): void {
  const method = req.method?.toUpperCase() ?? '';

  if (method === 'OPTIONS') {
    handlePreflight(res);
    return;
  }

  const url = req.url ?? '/';

  if (!isConverseRoute(url)) {
    sendJsonError(res, 404, {error: 'Not Found'});
    return;
  }

  if (method !== 'POST') {
    sendJsonError(res, 405, {error: 'Method Not Allowed'});
    return;
  }

  handlePost(req, res).catch(() => {
    sendJsonError(res, 500, {error: 'Internal Server Error'});
  });
}

async function handlePost(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  let parsed;
  try {
    parsed = await parseRequestBody(req);
  } catch (err) {
    if (err instanceof RequestParseError) {
      sendJsonError(res, err.statusCode, err.errorBody);
      return;
    }
    throw err;
  }

  const url = req.url ?? '/';
  const urlObj = new URL(url, 'http://localhost');
  const a2uiVersion = urlObj.searchParams.get('a2uiVersion') ?? '0.8';

  const templateId = matchPrompt(parsed.message);
  const template = await loadTemplate(templateId);
  streamSSEResponse(res, template, a2uiVersion);
}
