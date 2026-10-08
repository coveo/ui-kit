import {describe, expect, it, vi} from 'vitest';
import {createStaleScopes} from '@/src/optimistic/stale-scope.js';

describe('createStaleScopes', () => {
  it('reports nothing behind with no dispatch tracked', () => {
    const stale = createStaleScopes();

    expect(stale.isStale('results')).toBe(false);
  });

  it('marks the regions a dispatch leaves behind, and clears them when it settles', () => {
    const stale = createStaleScopes();

    stale.track('d1', ['results']);
    expect(stale.isStale('results')).toBe(true);

    stale.settle('d1');
    expect(stale.isStale('results')).toBe(false);
  });

  it('marks nothing for a gesture the producer answers without rebuilding anything', () => {
    const stale = createStaleScopes();

    stale.track('d1', []);

    expect(stale.isStale('results')).toBe(false);
    expect(stale.getVersion()).toBe(0);
  });

  it('keeps a region behind while another dispatch still holds it', () => {
    const stale = createStaleScopes();
    stale.track('d1', ['results']);
    stale.track('d2', ['results']);

    stale.settle('d1');
    expect(stale.isStale('results')).toBe(true);

    stale.settle('d2');
    expect(stale.isStale('results')).toBe(false);
  });

  it('separates regions, so one behind does not drag the others', () => {
    const stale = createStaleScopes();

    stale.track('d1', ['results']);

    expect(stale.isStale('results')).toBe(true);
    expect(stale.isStale('cart')).toBe(false);
  });

  it('ignores a second track under the same identity', () => {
    const stale = createStaleScopes();
    stale.track('d1', ['results']);
    const afterFirst = stale.getVersion();

    stale.track('d1', ['results', 'cart']);

    expect(stale.getVersion()).toBe(afterFirst);
    expect(stale.isStale('cart')).toBe(false);
  });

  it('ignores the settlement of an identity it never tracked', () => {
    const stale = createStaleScopes();
    const before = stale.getVersion();

    stale.settle('never-tracked');

    expect(stale.getVersion()).toBe(before);
  });

  describe('store contract', () => {
    it('moves the version only when the set of regions behind actually changes', () => {
      const stale = createStaleScopes();

      stale.track('d1', ['results']);
      const afterFirst = stale.getVersion();
      expect(afterFirst).not.toBe(0);

      stale.track('d2', ['results']);
      expect(stale.getVersion()).toBe(afterFirst);

      stale.settle('d1');
      expect(stale.getVersion()).toBe(afterFirst);

      stale.settle('d2');
      expect(stale.getVersion()).not.toBe(afterFirst);
    });

    it('notifies subscribers and stops once unsubscribed', () => {
      const stale = createStaleScopes();
      const listener = vi.fn();
      const unsubscribe = stale.subscribe(listener);

      stale.track('d1', ['results']);
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      stale.settle('d1');
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
