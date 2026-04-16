import type {QueryRouteDecision} from '../types/heuristics.js';

/**
 * Determines whether a user query should be handled by the client-side
 * Commerce Search API or delegated to the backend agent.
 *
 * Current heuristics (intentionally simple – extend as needed):
 *  - Short queries (≤ 4 words) without question marks → search
 *  - Queries that look like questions or conversational requests → agent
 *  - Everything else with > 4 words → agent
 */
export function classifyQueryLocally(query: string): QueryRouteDecision {
  const trimmed = query.trim();
  if (!trimmed) {
    return 'search';
  }

  const words = trimmed.split(/\s+/);

  if (trimmed.endsWith('?')) {
    return 'agent';
  }

  const agentPrefixes = [
    'help',
    'explain',
    'compare',
    'recommend',
    'suggest',
    'find me',
    'show me',
    'what',
    'why',
    'how',
    'which',
    'can you',
    'could you',
    'tell me',
    'i need',
    'i want',
    "i'm looking",
    'looking for',
    'please',
  ];
  const lower = trimmed.toLowerCase();
  if (agentPrefixes.some((prefix) => lower.startsWith(prefix))) {
    return 'agent';
  }

  if (words.length <= 4) {
    return 'search';
  }

  return 'agent';
}
