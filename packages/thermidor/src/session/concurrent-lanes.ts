/**
 * The concurrent lane (ADR-020): requests sent beside the session's single request, one lane per
 * action and source node. Only the latest dispatch of a lane is applied. A newer dispatch aborts
 * the lane's uncached request in flight; a cached miss runs to the end so its answer is cached, and
 * a dispatch with its cache key joins it instead of sending another.
 */

import type {ActionOrigin} from './action-cache.js';

export interface ConcurrentLanes {
  /** Makes `key` the latest dispatch of its lane, and aborts the lane's uncached request. */
  claim(origin: ActionOrigin, key: string): void;
  isLatest(origin: ActionOrigin, key: string): boolean;
  /** Sends a request the lane's next claim aborts. */
  sendUncached(origin: ActionOrigin, run: (signal: AbortSignal) => Promise<void>): Promise<void>;
  /** Sends a request that runs to the end, unless one with the same key is in flight: joins it. */
  sendCachedMiss(key: string, run: () => Promise<void>): Promise<void>;
}

function laneKey(origin: ActionOrigin): string {
  return JSON.stringify([origin.surfaceId, origin.sourceComponentId, origin.name]);
}

export function createConcurrentLanes(): ConcurrentLanes {
  const latest = new Map<string, string>();
  const uncached = new Map<string, AbortController>();
  const misses = new Map<string, Promise<void>>();

  return {
    claim(origin, key) {
      const lane = laneKey(origin);
      latest.set(lane, key);
      uncached.get(lane)?.abort();
      uncached.delete(lane);
    },
    isLatest(origin, key) {
      return latest.get(laneKey(origin)) === key;
    },
    async sendUncached(origin, run) {
      const lane = laneKey(origin);
      const controller = new AbortController();
      uncached.set(lane, controller);
      try {
        await run(controller.signal);
      } finally {
        if (uncached.get(lane) === controller) {
          uncached.delete(lane);
        }
      }
    },
    sendCachedMiss(key, run) {
      let miss = misses.get(key);
      if (!miss) {
        miss = run().finally(() => misses.delete(key));
        misses.set(key, miss);
      }
      return miss;
    },
  };
}
