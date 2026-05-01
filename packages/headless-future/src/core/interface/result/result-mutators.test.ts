import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as mutations from './result-mutatators.js';
import {resultSlice} from '@/src/core/internal/result/result-slice.js';
import {Engine} from '@/src/core/interface/engine/engine.js';

describe('resultMutations', () => {
  let engine: Engine;
  let mutateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateSpy = vi.fn();
    engine = {
      mutate: mutateSpy,
    } as unknown as Engine;
  });

  it('initializeResults() should call engine.mutate with initializeResults action', () => {
    mutations.initializeResults(engine, ['r1', 'r2']);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      resultSlice.actions.initializeResults(['r1', 'r2'])
    );
  });

  it('setSelected() should call engine.mutate with setSelected action', () => {
    mutations.setSelected(engine, 'r1', true);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      resultSlice.actions.setSelected({id: 'r1', isSelected: true})
    );
  });

  it('setExpanded() should call engine.mutate with setExpanded action', () => {
    mutations.setExpanded(engine, 'r1', true);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      resultSlice.actions.setExpanded({id: 'r1', isExpanded: true})
    );
  });

  it('clearAll() should call engine.mutate with clearAll action', () => {
    mutations.clearAll(engine);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      resultSlice.actions.clearAll()
    );
  });
});
