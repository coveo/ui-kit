import {useCallback, useRef, useState} from 'react';
import type {ClearRecentQueriesPayload, RemoveRecentQueryPayload} from '@coveo/thermidor-schema';
import {useLatestWhenFree} from '../session-request.js';

export type RecentQueryEdit =
  | {name: 'clearRecentQueries'; payload: ClearRecentQueriesPayload}
  | {name: 'removeRecentQuery'; payload: RemoveRecentQueryPayload};

interface PendingEdit {
  edit: RecentQueryEdit;
  /** The `answered` count the session's answer to the edit brought. */
  answeredAs?: number;
}

export interface RecentQueryEdits {
  /** How many edits the session has answered; suggestions fetched after one show its effect. */
  answered: number;
  /** `queries` without those an edit hides. */
  hide: (queries: readonly string[]) => string[];
  remove: (query: string) => void;
  clear: () => void;
  /** Shows again what the edits answered by `answered` hid, once suggestions fetched then settle. */
  refreshed: (answered: number) => void;
  /** What the last edit did, for screen readers. */
  announcement: string;
}

/**
 * Removes recent queries, or clears them, through `dispatch`, one edit at a time once the session is
 * free. An edit hides its queries at once, until suggestions fetched after its answer settle.
 */
export function useRecentQueryEdits(
  dispatch: (edit: RecentQueryEdit) => Promise<void> | void
): RecentQueryEdits {
  const [edits, setEdits] = useState<PendingEdit[]>([]);
  const [answered, setAnswered] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const answeredRef = useRef(0);

  useLatestWhenFree(
    edits.find(({answeredAs}) => answeredAs === undefined),
    (pending) => {
      void Promise.resolve(dispatch(pending.edit)).then(() => {
        const answeredAs = ++answeredRef.current;
        setEdits((current) =>
          current.map((edit) => (edit === pending ? {...pending, answeredAs} : edit))
        );
        setAnswered(answeredAs);
      });
    }
  );

  const hide = (queries: readonly string[]) => {
    if (edits.some(({edit}) => edit.name === 'clearRecentQueries')) {
      return [];
    }
    const removed = new Set(
      edits.flatMap(({edit}) =>
        edit.name === 'removeRecentQuery' ? [edit.payload.query.toLowerCase()] : []
      )
    );
    return queries.filter((query) => !removed.has(query.toLowerCase()));
  };

  const remove = useCallback((query: string) => {
    setEdits((current) => [...current, {edit: {name: 'removeRecentQuery', payload: {query}}}]);
    setAnnouncement(`${query} removed from recent searches.`);
  }, []);

  const clear = useCallback(() => {
    setEdits((current) => [...current, {edit: {name: 'clearRecentQueries', payload: {}}}]);
    setAnnouncement('Recent searches cleared.');
  }, []);

  const refreshed = useCallback((fetchedAfter: number) => {
    setEdits((current) =>
      current.filter(({answeredAs}) => answeredAs === undefined || answeredAs > fetchedAfter)
    );
  }, []);

  return {answered, hide, remove, clear, refreshed, announcement};
}
