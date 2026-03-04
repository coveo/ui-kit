import {readFileSync} from 'node:fs';
import {
  A11Y_MANUAL_CRITERIA_FILE,
  VALID_STATUSES,
} from '../shared/constants.js';
import type {OpenAIClient} from './types.js';

export class RateLimitExhaustedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitExhaustedError';
  }
}

export class LLMParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMParseError';
  }
}

export interface LLMConfig {
  model: string;
  verbose: boolean;
}

export interface LLMClientWrapper {
  getClient(): Promise<OpenAIClient>;
  config: LLMConfig;
}

export const DEFAULT_LLM_BASE_URL = 'https://models.github.ai/inference';

export function initLLMClient(config: LLMConfig): LLMClientWrapper {
  let clientPromise: Promise<OpenAIClient> | null = null;
  return {
    async getClient() {
      if (!clientPromise) {
        const baseURL = process.env.LLM_BASE_URL || DEFAULT_LLM_BASE_URL;
        const apiKey = process.env.LLM_API_KEY || process.env.GITHUB_TOKEN;

        if (!apiKey) {
          throw new Error(
            'No API key found. Set LLM_API_KEY or GITHUB_TOKEN environment variable.\n' +
              'See: https://docs.github.com/en/github-models/quickstart'
          );
        }

        // openai is not in package.json — dynamically imported at runtime.
        // The cast bridges the unresolvable module to our structural OpenAIClient type.
        clientPromise = import('openai' as string).then(
          ({default: OpenAI}) => new OpenAI({baseURL, apiKey}) as OpenAIClient
        );
      }
      return clientPromise;
    },
    config,
  };
}

export interface LLMMessage {
  role: 'system' | 'user';
  content:
    | string
    | Array<{type: string; text?: string; image_url?: {url: string}}>;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callLLMWithRetry(
  clientWrapper: LLMClientWrapper,
  messages: LLMMessage[],
  config: LLMConfig,
  maxRetries: number = 5
): Promise<unknown> {
  const client = await clientWrapper.getClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: config.model,
        messages,
        response_format: {type: 'json_object'},
        temperature: 0.1,
      });

      const content = response.choices?.[0]?.message?.content;

      if (config.verbose) {
        console.log('\n--- Raw LLM response ---');
        console.log(content);
        console.log('--- End LLM response ---\n');
      }

      if (!content) {
        throw new Error('LLM returned empty content');
      }

      return JSON.parse(content);
    } catch (error: unknown) {
      const err = error as {status?: number; code?: string; message?: string};
      lastError = error instanceof Error ? error : new Error(String(error));

      if (err.status === 429 || err.code === 'rate_limit_exceeded') {
        if (attempt >= maxRetries) {
          throw new RateLimitExhaustedError(
            `Rate limit exceeded after ${maxRetries + 1} attempts. ` +
              'Save progress and resume later with --resume.'
          );
        }

        const delay = 2 ** (attempt + 1) * 1000;
        const jitter = delay * (0.75 + Math.random() * 0.5);
        const waitMs = Math.round(jitter);

        console.log(
          `  Rate limited (attempt ${attempt + 1}/${maxRetries + 1}). ` +
            `Retrying in ${(waitMs / 1000).toFixed(1)}s...`
        );
        await sleep(waitMs);
        continue;
      }

      if (error instanceof SyntaxError) {
        if (attempt < 1) {
          console.log('  LLM returned invalid JSON. Retrying...');
          continue;
        }
        throw new LLMParseError(
          `LLM returned invalid JSON after retry: ${error.message}`
        );
      }

      if (err.status === 401 || err.status === 403) {
        throw new Error(
          'Authentication failed. Check that LLM_API_KEY (or GITHUB_TOKEN) is set and valid.\n' +
            'For GitHub Models, the PAT needs the "models: read" permission.\n' +
            `API error: ${err.message}`
        );
      }

      if ((err.status ?? 0) >= 500) {
        if (attempt >= maxRetries) {
          throw new Error(
            `Server error after ${maxRetries + 1} attempts: ${err.message}`
          );
        }
        const delay = 2 ** attempt * 1000;
        console.log(
          `  Server error (${err.status}). Retrying in ${delay / 1000}s...`
        );
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('callLLMWithRetry exhausted all retries');
}

export interface CriteriaResult {
  status: string;
  evidence: string;
}

export interface LLMValidatedResponse {
  criteria: Record<string, CriteriaResult>;
}

export function validateLLMResponse(
  parsed: unknown,
  expectedKeys: string[]
): LLMValidatedResponse {
  const obj = parsed as Record<string, unknown> | null | undefined;
  if (!obj || typeof obj !== 'object' || !('criteria' in obj)) {
    const result: Record<string, CriteriaResult> = {};
    for (const key of expectedKeys) {
      result[key] = {
        status: 'not-applicable',
        evidence: 'LLM did not return a valid evaluation for this criterion.',
      };
    }
    return {criteria: result};
  }

  const result: Record<string, CriteriaResult> = {};
  const criteria = obj.criteria as Record<
    string,
    {status?: string; evidence?: string}
  >;
  for (const key of expectedKeys) {
    const entry = criteria[key];
    if (!entry || !entry.status || !VALID_STATUSES.has(entry.status)) {
      result[key] = {
        status: 'not-applicable',
        evidence:
          entry?.evidence ||
          'LLM did not return a valid evaluation for this criterion.',
      };
    } else {
      result[key] = {
        status: entry.status,
        evidence: typeof entry.evidence === 'string' ? entry.evidence : '',
      };
    }
  }

  return {criteria: result};
}

export interface MergedResults {
  wcag22Criteria: Record<string, string>;
  evidenceParts: string[];
}

let cachedAiCriteria: string[] | null = null;

function loadAiCriteria(): string[] {
  if (cachedAiCriteria) {
    return cachedAiCriteria;
  }

  try {
    const content = readFileSync(A11Y_MANUAL_CRITERIA_FILE, 'utf8');
    const parsed = JSON.parse(content) as Record<string, unknown>;
    const criteria = Array.isArray(parsed.criteria)
      ? parsed.criteria.filter(
          (entry): entry is string => typeof entry === 'string'
        )
      : [];

    if (criteria.length === 0) {
      console.warn(
        '[llm-client]',
        `${A11Y_MANUAL_CRITERIA_FILE} must contain a "criteria" array.`
      );
    }

    cachedAiCriteria = criteria;
  } catch (error) {
    console.warn(
      '[llm-client]',
      `Unable to read ${A11Y_MANUAL_CRITERIA_FILE}.`,
      error
    );
    cachedAiCriteria = [];
  }

  return cachedAiCriteria;
}

export function mergeResults(
  ...callResults: LLMValidatedResponse[]
): MergedResults {
  const wcag22Criteria: Record<string, string> = {};
  const evidenceParts: string[] = [];

  const allCriteria: Record<string, CriteriaResult> = {};
  for (const result of callResults) {
    Object.assign(allCriteria, result.criteria);
  }

  const aiCriteria = loadAiCriteria();
  for (const key of aiCriteria) {
    const entry = allCriteria[key];
    if (entry) {
      wcag22Criteria[key] = entry.status;
      if (entry.status !== 'not-applicable' && entry.evidence) {
        evidenceParts.push(`${key}: ${entry.evidence}`);
      }
    } else {
      wcag22Criteria[key] = 'not-applicable';
    }
  }

  return {wcag22Criteria, evidenceParts};
}
