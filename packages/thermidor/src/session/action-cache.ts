/**
 * The session's cache of answers to cached actions (ADR-020): in memory, bounded, least recently
 * used first out, each entry reused while younger than the lifetime the producer currently
 * announces. Never serialized, and dropped with the session.
 */

const MAX_ENTRIES = 100;

export interface ActionOrigin {
  surfaceId: string;
  sourceComponentId: string;
  name: string;
}

export interface ActionCache {
  /** The answer's messages, or `undefined` when there is none or it is `ttlMs` old. */
  get(key: string, ttlMs: number): readonly unknown[] | undefined;
  set(key: string, messages: readonly unknown[]): void;
}

/** The payload's request JSON, with object keys sorted. */
function stableStringify(value: unknown): string {
  return (
    JSON.stringify(value, (_key, item: unknown) =>
      typeof item === 'object' && item !== null && !Array.isArray(item)
        ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => (a < b ? -1 : 1)))
        : item
    ) ?? 'null'
  );
}

export function actionCacheKey(origin: ActionOrigin, payload: unknown): string {
  return JSON.stringify([
    origin.surfaceId,
    origin.sourceComponentId,
    origin.name,
    stableStringify(payload),
  ]);
}

export function createActionCache(now: () => number = Date.now): ActionCache {
  const entries = new Map<string, {messages: readonly unknown[]; storedAt: number}>();
  return {
    get(key, ttlMs) {
      const entry = entries.get(key);
      entries.delete(key);
      if (!entry || now() - entry.storedAt >= ttlMs) {
        return undefined;
      }
      entries.set(key, entry);
      return entry.messages;
    },
    set(key, messages) {
      entries.delete(key);
      entries.set(key, {messages, storedAt: now()});
      if (entries.size > MAX_ENTRIES) {
        entries.delete(entries.keys().next().value!);
      }
    },
  };
}
