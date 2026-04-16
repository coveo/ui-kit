import type {
  ClassifyResponse,
  QueryRouteDecision,
} from '../types/heuristics.js';

const CLASSIFY_TIMEOUT_MS = 5000;
const CLASSIFY_ENDPOINT = '/api/heuristics/classify';

export class ClassificationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ClassificationError';
  }
}

export async function classifyQuery(
  query: string
): Promise<QueryRouteDecision> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLASSIFY_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(CLASSIFY_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query}),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ClassificationError('Query classification timed out.');
    }
    throw new ClassificationError('Failed to reach classification endpoint.', {
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new ClassificationError(
      `Classification endpoint returned HTTP ${response.status}.`
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ClassificationError(
      'Classification endpoint returned invalid JSON.'
    );
  }

  if (!isClassifyResponse(body)) {
    throw new ClassificationError(
      'Classification endpoint returned an unexpected payload shape.'
    );
  }

  return body.decision;
}

function isClassifyResponse(value: unknown): value is ClassifyResponse {
  if (typeof value !== 'object' || value === null || !('decision' in value)) {
    return false;
  }
  const decision = (value as ClassifyResponse).decision;
  return decision === 'search' || decision === 'agent';
}
