import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as mutations from './search-box-mutators.js';
import {Engine} from '@/src/core/interface/engine/engine.js';
import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';

describe('searchBoxMutations', () => {
  let engine: Engine;
  let mutateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateSpy = vi.fn();
    engine = {
      mutate: mutateSpy,
    } as unknown as Engine;
  });

  describe('setQuery()', () => {
    it('should call engine.mutate with the setQuery mutation', () => {
      mutations.setQuery(engine, 'test query');

      expect(mutateSpy).toHaveBeenCalledTimes(1);
      expect(mutateSpy).toHaveBeenCalledWith(
        searchBoxSlice.actions.setQuery('test query')
      );
    });

    it('should call engine.mutate with empty query', () => {
      mutations.setQuery(engine, '');

      expect(mutateSpy).toHaveBeenCalledTimes(1);
      expect(mutateSpy).toHaveBeenCalledWith(
        searchBoxSlice.actions.setQuery('')
      );
    });
  });
});
