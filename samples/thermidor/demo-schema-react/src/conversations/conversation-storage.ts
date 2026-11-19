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
   * conversation that does not fit even alone is not saved, and the others are kept. A saved
   * conversation keeps its title, `title` naming a new one.
   */
  save(id: string, title: string, session: SerializedSession): void;
  remove(id: string): void;
  rename(id: string, title: string): void;
  /** Lists a conversation as the newest one before it has anything to save, unless it is listed. */
  start(id: string, title: string): void;
  /** The conversation this tab shows, which a reload resumes. */
  currentId(): string | undefined;
  setCurrentId(id: string): void;
}

const MAX_CONVERSATIONS = 20;

const INDEX = 'demo-conversations';
const ENTRY = 'demo-conversation:';
const CURRENT = 'demo-current-conversation';

interface ConversationStorageOptions {
  /**
   * Prefixes every key, so configurations served from the same origin keep their conversations
   * apart: a session's keys only resume against the organization and agent that issued them.
   */
  scope?: string;
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
  scope,
  local = () => window.localStorage,
  session = () => window.sessionStorage,
  max = MAX_CONVERSATIONS,
  now = Date.now,
}: ConversationStorageOptions = {}): ConversationStorage {
  const prefix = scope ? `${scope}:` : '';
  const indexKey = prefix + INDEX;
  const entryPrefix = prefix + ENTRY;
  const currentKey = prefix + CURRENT;
  const read = (storage: () => Storage, key: string) => attempt(() => storage().getItem(key));

  function list(): ConversationSummary[] {
    const raw = read(local, indexKey);
    const index = raw ? attempt(() => JSON.parse(raw) as unknown) : undefined;
    return Array.isArray(index) ? index.filter(isSummary) : [];
  }

  function writeIndex(index: readonly ConversationSummary[]) {
    local().setItem(indexKey, JSON.stringify(index));
  }

  function drop(index: ConversationSummary[], id: string) {
    attempt(() => local().removeItem(entryPrefix + id));
    return index.filter((entry) => entry.id !== id);
  }

  return {
    list,
    load(id) {
      const raw = read(local, entryPrefix + id);
      return raw ? attempt(() => JSON.parse(raw) as SerializedSession) : undefined;
    },
    save(id, title, serialized) {
      const key = entryPrefix + id;
      const previous = read(local, key);
      const saved = list();
      const kept = saved.find((entry) => entry.id === id)?.title ?? title;
      let index = [
        {id, title: kept, updatedAt: now()},
        ...saved.filter((entry) => entry.id !== id),
      ];
      const evicted: [string, string][] = [];
      const evict = (staleId: string) => {
        const staleKey = entryPrefix + staleId;
        const staleValue = read(local, staleKey);
        if (staleValue) {
          evicted.push([staleKey, staleValue]);
        }
        index = drop(index, staleId);
      };
      for (const stale of index.slice(max)) {
        evict(stale.id);
      }
      const value = JSON.stringify(serialized);
      for (;;) {
        try {
          local().setItem(key, value);
          writeIndex(index);
          return;
        } catch (error) {
          const oldest = index.findLast((entry) => entry.id !== id);
          if (isQuotaError(error) && oldest) {
            evict(oldest.id);
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
    rename(id, title) {
      const index = list().map((entry) => (entry.id === id ? {...entry, title} : entry));
      attempt(() => writeIndex(index));
    },
    start(id, title) {
      const saved = list();
      if (saved.some((entry) => entry.id === id)) return;
      const index = [{id, title, updatedAt: now()}, ...saved];
      // The evicted transcripts go only once the index no longer lists them.
      const written = attempt(() => {
        writeIndex(index.slice(0, max));
        return true;
      });
      if (!written) return;
      for (const stale of index.slice(max)) {
        attempt(() => local().removeItem(entryPrefix + stale.id));
      }
    },
    currentId: () => read(session, currentKey) ?? undefined,
    setCurrentId(id) {
      attempt(() => session().setItem(currentKey, id));
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
