/**
 * Layer 1: IndexedDbPersistenceAdapter
 *
 * Browser-first, fail-soft persistence implementation backed by IndexedDB.
 * Uses structured clone payloads via `idb`.
 */

import {openDB, type DBSchema, type IDBPDatabase} from 'idb';
import type {PersistenceAdapter} from './types.js';

type PersistenceRecord = {
  key: string;
  payload: unknown;
};

interface PersistenceDBSchema extends DBSchema {
  kv: {
    key: string;
    value: PersistenceRecord;
  };
}

const DB_NAME = 'headless-future-persistence';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

export class IndexedDbPersistenceAdapter implements PersistenceAdapter {
  private dbPromise: Promise<IDBPDatabase<PersistenceDBSchema>> | null = null;

  async save(key: string, payload: unknown): Promise<void> {
    if (!this.canUseIndexedDb()) {
      return;
    }

    try {
      const db = await this.getDb();
      await db.put(STORE_NAME, {key, payload});
    } catch {
      // Fail-soft by design for MVP.
    }
  }

  async load(key: string): Promise<unknown | null> {
    if (!this.canUseIndexedDb()) {
      return null;
    }

    try {
      const db = await this.getDb();
      const record = await db.get(STORE_NAME, key);
      return record?.payload ?? null;
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.canUseIndexedDb()) {
      return;
    }

    try {
      const db = await this.getDb();
      await db.delete(STORE_NAME, key);
    } catch {
      // Fail-soft by design for MVP.
    }
  }

  async list(prefix?: string): Promise<string[]> {
    if (!this.canUseIndexedDb()) {
      return [];
    }

    try {
      const db = await this.getDb();
      const keys = (await db.getAllKeys(STORE_NAME)) as string[];

      if (!prefix) {
        return keys;
      }

      return keys.filter((key) => key.startsWith(prefix));
    } catch {
      return [];
    }
  }

  private canUseIndexedDb(): boolean {
    return (
      typeof globalThis.window !== 'undefined' &&
      typeof globalThis.indexedDB !== 'undefined'
    );
  }

  private getDb(): Promise<IDBPDatabase<PersistenceDBSchema>> {
    this.dbPromise ??= openDB<PersistenceDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {keyPath: 'key'});
        }
      },
    });

    return this.dbPromise as Promise<IDBPDatabase<PersistenceDBSchema>>;
  }
}
