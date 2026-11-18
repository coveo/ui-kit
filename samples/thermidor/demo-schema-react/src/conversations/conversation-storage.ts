import type {SerializedSession} from '@coveo/thermidor';

/** A saved conversation, as the drawer lists it. */
export interface ConversationSummary {
  id: string;
  /** The conversation's first prompt. */
  title: string;
  /** When the conversation was last saved, in milliseconds since the epoch. */
  updatedAt: number;
}

export interface ConversationStorage {
  /** The saved conversations, newest first. */
  list(): readonly ConversationSummary[];
  load(id: string): SerializedSession | undefined;
  /**
   * Saves the conversation, then drops the oldest ones past the cap, or to make room. A
   * conversation that does not fit even alone is not saved, and the others are kept.
   */
  save(id: string, title: string, session: SerializedSession): void;
  remove(id: string): void;
  /** Lists a conversation as the newest one before it has anything to save, unless it is listed. */
  start(id: string, title: string): void;
  /** The conversation this tab shows, which a reload resumes. */
  currentId(): string | undefined;
  setCurrentId(id: string): void;
}

const MAX_CONVERSATIONS = 20;

const INDEX_KEY = 'demo-conversations';
const ENTRY_PREFIX = 'demo-conversation:';
const CURRENT_KEY = 'demo-current-conversation';

interface ConversationStorageOptions {
  /** Where conversations are saved. `localStorage` by default. */
  local?: () => Storage;
  /** Where the current conversation is remembered. `sessionStorage` by default. */
  session?: () => Storage;
  max?: number;
  now?: () => number;
}

/**
 * Saves conversations in `localStorage` and remembers the current one in `sessionStorage`, so a
 * reload resumes it and a new tab starts over. Storage that is unavailable or full never breaks
 * the page: a read finds nothing, and a write that does not fit is dropped.
 */
export function createConversationStorage({
  local = () => window.localStorage,
  session = () => window.sessionStorage,
  max = MAX_CONVERSATIONS,
  now = Date.now,
}: ConversationStorageOptions = {}): ConversationStorage {
  const read = (storage: () => Storage, key: string) => attempt(() => storage().getItem(key));

  function list(): ConversationSummary[] {
    const raw = read(local, INDEX_KEY);
    const index = raw ? attempt(() => JSON.parse(raw) as unknown) : undefined;
    return Array.isArray(index) ? index.filter(isSummary) : [];
  }

  function writeIndex(index: readonly ConversationSummary[]) {
    local().setItem(INDEX_KEY, JSON.stringify(index));
  }

  function drop(index: ConversationSummary[], id: string) {
    attempt(() => local().removeItem(ENTRY_PREFIX + id));
    return index.filter((entry) => entry.id !== id);
  }

  return {
    list,
    load(id) {
      const raw = read(local, ENTRY_PREFIX + id);
      return raw ? attempt(() => JSON.parse(raw) as SerializedSession) : undefined;
    },
    save(id, title, serialized) {
      const key = ENTRY_PREFIX + id;
      const previous = read(local, key);
      let index = [{id, title, updatedAt: now()}, ...list().filter((entry) => entry.id !== id)];
      for (const stale of index.slice(max)) {
        index = drop(index, stale.id);
      }
      const value = JSON.stringify(serialized);
      const evicted: [string, string][] = [];
      for (;;) {
        try {
          local().setItem(key, value);
          writeIndex(index);
          return;
        } catch (error) {
          const oldest = index.findLast((entry) => entry.id !== id);
          if (isQuotaError(error) && oldest) {
            const oldestKey = ENTRY_PREFIX + oldest.id;
            const oldestValue = read(local, oldestKey);
            if (oldestValue) {
              evicted.push([oldestKey, oldestValue]);
            }
            index = drop(index, oldest.id);
            continue;
          }
          // It does not fit even alone: everything goes back as it was, its previous save included.
          attempt(() => (previous ? local().setItem(key, previous) : local().removeItem(key)));
          for (const [evictedKey, evictedValue] of evicted) {
            attempt(() => local().setItem(evictedKey, evictedValue));
          }
          return;
        }
      }
    },
    remove(id) {
      const index = drop(list(), id);
      attempt(() => writeIndex(index));
    },
    start(id, title) {
      const saved = list();
      if (saved.some((entry) => entry.id === id)) return;
      let index = [{id, title, updatedAt: now()}, ...saved];
      for (const stale of index.slice(max)) {
        index = drop(index, stale.id);
      }
      attempt(() => writeIndex(index));
    },
    currentId: () => read(session, CURRENT_KEY) ?? undefined,
    setCurrentId(id) {
      attempt(() => session().setItem(CURRENT_KEY, id));
    },
  };
}

function attempt<T>(run: () => T): T | undefined {
  try {
    return run();
  } catch {
    return undefined;
  }
}

function isQuotaError(error: unknown) {
  return error instanceof DOMException && error.name === 'QuotaExceededError';
}

function isSummary(entry: unknown): entry is ConversationSummary {
  const {id, title, updatedAt} = (entry ?? {}) as Partial<ConversationSummary>;
  return typeof id === 'string' && typeof title === 'string' && typeof updatedAt === 'number';
}
