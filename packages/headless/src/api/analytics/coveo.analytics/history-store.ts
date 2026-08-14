import {HistoryStore as CoveoAnalyticsHistoryStore} from 'coveo.analytics/dist/esm/history.mjs';
import type {WebStorage} from 'coveo.analytics/dist/esm/storage.mjs';

export type {HistoryElement} from 'coveo.analytics/dist/esm/history.mjs';

/**
 * Headless shares a single history store across the engine, whereas coveo.analytics exposes a
 * plain class. Subclassing keeps `HistoryStore` usable as both a value and a type at the existing
 * call sites while the behavior lives in coveo.analytics.
 */
export default class HistoryStore extends CoveoAnalyticsHistoryStore {
  private static instance: HistoryStore | null = null;

  public static getInstance(store?: WebStorage): HistoryStore {
    if (!HistoryStore.instance) {
      HistoryStore.instance = new HistoryStore(store);
    }
    return HistoryStore.instance;
  }

  private constructor(store?: WebStorage) {
    super(store);
  }
}
