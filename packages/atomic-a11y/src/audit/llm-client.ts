/**
 * LLM client for AI-powered WCAG accessibility audits.
 *
 * Provides OpenAI API integration with retry logic, structured JSON parsing,
 * and response validation for accessibility evaluations.
 */

import {readFileSync} from 'node:fs';
import {backOff} from 'exponential-backoff';
import OpenAI from 'openai';
import {
  A11Y_MANUAL_CRITERIA_FILE,
  VALID_STATUSES,
} from '../shared/constants.js';

/** Thrown when rate limits are exhausted after all retry attempts. */
export class RateLimitExhaustedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitExhaustedError';
  }
}

/** Thrown when LLM response cannot be parsed as valid JSON. */
export class LLMParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMParseError';
  }
}

/** Configuration for LLM requests. */
export interface LLMConfig {
  /** OpenAI model identifier (e.g., "gpt-4o"). */
  model: string;
  /** Whether to log raw LLM responses for debugging. */
  verbose: boolean;
}

/** Wrapper providing lazy-initialized OpenAI client access. */
export interface LLMClientWrapper {
  /** Returns the configured OpenAI client instance. */
  getClient(): OpenAI;
  /** Current LLM configuration. */
  config: LLMConfig;
}

/** Default base URL for GitHub Models inference endpoint. */
export const DEFAULT_LLM_BASE_URL = 'https://models.github.ai/inference';

/**
 * Creates an LLM client wrapper with lazy initialization.
 *
 * Uses LLM_API_KEY or GITHUB_TOKEN for authentication.
 * Defaults to GitHub Models endpoint unless LLM_BASE_URL is set.
 *
 * @param config - LLM configuration options
 * @returns Client wrapper for making LLM requests
 * @throws Error if no API key is available
 */
export function initLLMClient(config: LLMConfig): LLMClientWrapper {
  const baseURL = process.env.LLM_BASE_URL || DEFAULT_LLM_BASE_URL;
  const apiKey = process.env.LLM_API_KEY || process.env.GITHUB_TOKEN;

  if (!apiKey) {
    throw new Error(
      'No API key found. Set LLM_API_KEY or GITHUB_TOKEN environment variable.\n' +
        'See: https://docs.github.com/en/github-models/quickstart'
    );
  }

  const client = new OpenAI({baseURL, apiKey});

  return {
    getClient: () => client,
    config,
  };
}

/** Message format for LLM chat completions. */
export interface LLMMessage {
  role: 'system' | 'user';
  content:
    | string
    | Array<{type: string; text?: string; image_url?: {url: string}}>;
}

/**
 * Determines if an error is retryable (rate limit or server error).
 */
function isRetryableError(error: unknown): boolean {
  const err = error as {status?: number; code?: string};
  if (err.status === 429 || err.code === 'rate_limit_exceeded') return true;
  if ((err.status ?? 0) >= 500) return true;
  return false;
}

/**
 * Calls the LLM with automatic retry and exponential backoff.
 *
 * Handles rate limiting, server errors, and JSON parsing with configurable retries.
 * Uses the exponential-backoff library for consistent retry behavior.
 *
 * @param clientWrapper - Initialized LLM client wrapper
 * @param messages - Chat messages to send
 * @param config - LLM configuration
 * @param maxRetries - Maximum retry attempts (default: 5)
 * @returns Parsed JSON response from LLM
 * @throws RateLimitExhaustedError if rate limits exceeded after all retries
 * @throws LLMParseError if response is not valid JSON
 * @throws Error for authentication failures or unrecoverable errors
 */
export async function callLLMWithRetry(
  clientWrapper: LLMClientWrapper,
  messages: LLMMessage[],
  config: LLMConfig,
  maxRetries: number = 5
): Promise<unknown> {
  const client = clientWrapper.getClient();

  try {
    return await backOff(
      async () => {
        const response = await client.chat.completions.create({
          model: config.model,
          messages: messages as OpenAI.ChatCompletionMessageParam[],
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

        try {
          return JSON.parse(content);
        } catch (parseError) {
          throw new LLMParseError(
            `LLM returned invalid JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`
          );
        }
      },
      {
        numOfAttempts: maxRetries + 1,
        startingDelay: 2000,
        timeMultiple: 2,
        maxDelay: 32000,
        jitter: 'full',
        retry: (error: unknown, attemptNumber: number) => {
          const err = error as {status?: number; message?: string};

          // Don't retry auth failures
          if (err.status === 401 || err.status === 403) {
            throw new Error(
              'Authentication failed. Check that LLM_API_KEY (or GITHUB_TOKEN) is set and valid.\n' +
                'For GitHub Models, the PAT needs the "models: read" permission.\n' +
                `API error: ${err.message}`
            );
          }

          // Don't retry parse errors (LLM gave bad output)
          if (error instanceof LLMParseError) {
            return false;
          }

          if (isRetryableError(error)) {
            console.log(
              `  Retrying (attempt ${attemptNumber}/${maxRetries + 1}): ${err.status === 429 ? 'rate limited' : `server error ${err.status}`}`
            );
            return true;
          }

          return false;
        },
      }
    );
  } catch (error) {
    if (error instanceof LLMParseError) {
      throw error;
    }

    const err = error as {status?: number; code?: string};
    if (err.status === 429 || err.code === 'rate_limit_exceeded') {
      throw new RateLimitExhaustedError(
        `Rate limit exceeded after ${maxRetries + 1} attempts. ` +
          'Save progress and resume later with --resume.'
      );
    }

    throw error;
  }
}

/** Result for a single WCAG criterion evaluation. */
export interface CriteriaResult {
  /** Conformance status: pass, fail, partial, or not-applicable. */
  status: string;
  /** Supporting evidence or explanation for the status. */
  evidence: string;
}

/** Validated response structure from LLM evaluation. */
export interface LLMValidatedResponse {
  /** Map of criterion IDs to their evaluation results. */
  criteria: Record<string, CriteriaResult>;
}

/**
 * Creates a default not-applicable result for missing criteria.
 */
function createNotApplicableResult(evidence: string): CriteriaResult {
  return {status: 'not-applicable', evidence};
}

/**
 * Validates and normalizes LLM response to expected schema.
 *
 * Ensures all expected criteria have valid status values, filling in
 * not-applicable for any missing or invalid entries.
 *
 * @param parsed - Raw parsed JSON from LLM
 * @param expectedKeys - Criterion IDs that should be present
 * @returns Normalized response with all expected keys
 */
export function validateLLMResponse(
  parsed: unknown,
  expectedKeys: string[]
): LLMValidatedResponse {
  const obj = parsed as Record<string, unknown> | null | undefined;

  if (!obj || typeof obj !== 'object' || !('criteria' in obj)) {
    const result: Record<string, CriteriaResult> = {};
    for (const key of expectedKeys) {
      result[key] = createNotApplicableResult(
        'LLM did not return a valid evaluation for this criterion.'
      );
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
      result[key] = createNotApplicableResult(
        entry?.evidence ||
          'LLM did not return a valid evaluation for this criterion.'
      );
    } else {
      result[key] = {
        status: entry.status,
        evidence: typeof entry.evidence === 'string' ? entry.evidence : '',
      };
    }
  }

  return {criteria: result};
}

/** Merged results from multiple LLM evaluation calls. */
export interface MergedResults {
  /** Map of criterion IDs to their final status. */
  wcag22Criteria: Record<string, string>;
  /** Evidence strings for criteria with findings. */
  evidenceParts: string[];
}

/** Cached criteria list from config file (process-lifetime cache). */
let cachedAiCriteria: string[] | null = null;

/**
 * Loads the list of AI-auditable criteria from configuration.
 *
 * Results are cached for the process lifetime to avoid repeated file reads.
 */
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

/**
 * Merges results from multiple LLM evaluation calls into final report.
 *
 * Combines criteria results, preferring later calls for conflicts,
 * and collects evidence for non-passing criteria.
 *
 * @param callResults - Results from individual LLM calls
 * @returns Merged criteria statuses and evidence
 */
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
