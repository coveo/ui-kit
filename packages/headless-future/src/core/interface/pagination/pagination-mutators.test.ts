import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as mutations from './pagination-mutators.js';
import {Engine} from '@/src/core/interface/engine/engine.js';
import {paginationSlice} from '@/src/core/internal/pagination/pagination-slice.js';

describe('paginationMutations', () => {
  let engine: Engine;
  let mutateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateSpy = vi.fn();
    engine = {
      mutate: mutateSpy,
    } as unknown as Engine;
  });

  it('setPage() should call engine.mutate with setPage action', () => {
    mutations.setPage(engine, 3);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      paginationSlice.actions.setPage(3)
    );
  });

  it('setPageSize() should call engine.mutate with setPageSize action', () => {
    mutations.setPageSize(engine, 25);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      paginationSlice.actions.setPageSize(25)
    );
  });

  it('setTotalCount() should call engine.mutate with setTotalCount action', () => {
    mutations.setTotalCount(engine, 100);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      paginationSlice.actions.setTotalCount(100)
    );
  });

  it('nextPage() should call engine.mutate with nextPage action', () => {
    mutations.nextPage(engine);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      paginationSlice.actions.nextPage()
    );
  });

  it('previousPage() should call engine.mutate with previousPage action', () => {
    mutations.previousPage(engine);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      paginationSlice.actions.previousPage()
    );
  });

  it('resetToFirstPage() should call engine.mutate with resetToFirstPage action', () => {
    mutations.resetToFirstPage(engine);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      paginationSlice.actions.resetToFirstPage()
    );
  });
});
