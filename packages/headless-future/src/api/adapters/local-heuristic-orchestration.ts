/**
 * Layer 1: LocalHeuristicOrchestrationAdapter
 *
 * Client-side OrchestrationAdapter driven by lightweight text heuristics.
 * Intended for development, preview, and offline-first scenarios where the
 * platform orchestration endpoint is unavailable.
 *
 * Decision logic (English-only by design):
 * - assistant-first  → open-ended question patterns, e.g. "What is…", "How do I…"
 * - search-first     → everything else (product lookups, navigational queries)
 * - blended          → short queries that look like keyword searches but also
 *                      carry question intent
 *
 * The adapter is intentionally simple and deterministic: the same input always
 * produces the same output. No network calls are made.
 */

import type {OrchestrationAdapter, OrchestrationContext} from './types.js';
import type {OrchestrationSnapshot} from '@/src/core/interface/orchestration/types.js';

// ---------------------------------------------------------------------------
// Heuristic patterns
// ---------------------------------------------------------------------------

/**
 * Patterns that strongly indicate conversational / assistant-first intent.
 * Matched case-insensitively against the trimmed user message.
 */
const ASSISTANT_FIRST_PATTERNS: RegExp[] = [
  /^(what|what's|what is)\b/i,
  /^(how|how do i|how can i|how to)\b/i,
  /^(why|why is|why does|why do)\b/i,
  /^(who|who is|who are|who was)\b/i,
  /^(when|when is|when was|when did)\b/i,
  /^(where|where is|where are|where can i)\b/i,
  /^(can you|could you|please|tell me|explain|describe|summarize|compare)\b/i,
  /\?$/,
];

/**
 * Patterns that suggest a keyword / navigational search.
 * When matched, prefer search-first over assistant-first.
 */
const SEARCH_FIRST_PATTERNS: RegExp[] = [
  /^(find|search|show|list|get)\b/i,
  /\b(price|pricing|cost|buy|purchase|order|return policy|shipping)\b/i,
];

let correlationCounter = 0;
function nextCorrelationId(): string {
  return `local-${Date.now()}-${++correlationCounter}`;
}

// ---------------------------------------------------------------------------
// Adapter implementation
// ---------------------------------------------------------------------------

export class LocalHeuristicOrchestrationAdapter implements OrchestrationAdapter {
  async getSnapshot(
    context: OrchestrationContext
  ): Promise<OrchestrationSnapshot> {
    const message = (context.lastUserMessage ?? '').trim();
    const mode = classify(message);

    return {
      mode,
      phase: mode === 'assistant-first' ? 'answering' : 'results',
      reason: `local-heuristic: ${mode}`,
      confidence: mode === 'blended' ? 0.5 : 0.8,
      timestamp: Date.now(),
      correlationId: nextCorrelationId(),
      metadata: {
        provider: 'local-heuristic',
        locale: 'en',
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Classification logic (exported for unit testing)
// ---------------------------------------------------------------------------

export function classify(
  message: string
): 'search-first' | 'assistant-first' | 'blended' {
  if (!message) {
    return 'search-first';
  }

  const isSearchFirst = SEARCH_FIRST_PATTERNS.some((p) => p.test(message));
  const isAssistantFirst = ASSISTANT_FIRST_PATTERNS.some((p) =>
    p.test(message)
  );

  if (isSearchFirst && isAssistantFirst) {
    return 'blended';
  }
  if (isAssistantFirst) {
    return 'assistant-first';
  }
  return 'search-first';
}
