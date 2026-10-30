/**
 * The session's cache of answers to cached actions (ADR-020): in memory, bounded, least recently
 * used first out, each entry expiring with the lifetime the producer announced. Never serialized,
 * and dropped with the session.
 */

const MAX_ENTRIES = 100;

/** The node an action is dispatched from, and the action's name. */
export interface ActionOrigin {
  surfaceId: string;
  sourceComponentId: string;
  name: string;
}

export interface ActionCache {
  /** The answer's messages, or `undefined` when there is none or it expired. */
  get(key: string): readonly unknown[] | undefined;
  set(key: string, messages: readonly unknown[], ttlMs: number): void;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item ?? null)).join(',')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.keys(value)
      .sort()
      .filter((key) => (value as Record<string, unknown>)[key] !== undefined)
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`
      );
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

/** The key of an answer: the action's origin and its payload, serialized with sorted keys. */
export function actionCacheKey(origin: ActionOrigin, payload: unknown): string {
  return JSON.stringify([
    origin.surfaceId,
    origin.sourceComponentId,
    origin.name,
    stableStringify(payload),
  ]);
}

export function createActionCache(now: () => number = Date.now): ActionCache {
  const entries = new Map<string, {messages: readonly unknown[]; expiresAt: number}>();
  return {
    get(key) {
      const entry = entries.get(key);
      entries.delete(key);
      if (!entry || entry.expiresAt <= now()) {
        return undefined;
      }
      entries.set(key, entry);
      return entry.messages;
    },
    set(key, messages, ttlMs) {
      entries.delete(key);
      entries.set(key, {messages, expiresAt: now() + ttlMs});
      if (entries.size > MAX_ENTRIES) {
        entries.delete(entries.keys().next().value!);
      }
    },
  };
}
