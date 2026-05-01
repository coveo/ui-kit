/**
 * Core Engine Operations Tests
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {createTestEngine} from '@/src/core/test-utils.js';
import * as searchBoxMutations from '@/src/core/interface/search-box/mutate.js';
import * as searchBoxSelectors from '@/src/core/interface/search-box/selectors.js';
import * as resultsMutations from '@/src/core/interface/results/mutate.js';
import * as resultsSelectors from '@/src/core/interface/results/selectors.js';
import {FullEngine, getFullEngine} from './engine.js';
import {searchBoxSlice} from '@/src/core/internal/searchBox/slice.js';
import {resultsSlice} from '@/src/core/internal/results/slice.js';
import type {State} from '@/src/core/interface/types.js';

describe('Engine: read()', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(searchBoxSlice);
    engine.adoptSlice(resultsSlice);
  });

  it('should read values from state using a selector', () => {
    const query = engine.read(searchBoxSelectors.query);

    expect(query).toBe('');
  });

  it('should return updated values after mutations', () => {
    engine.mutate(searchBoxMutations.setQuery('laptops'));
    const query = engine.read(searchBoxSelectors.query);

    expect(query).toBe('laptops');
  });

  it('should work with inline selector functions', () => {
    engine.mutate(searchBoxMutations.setQuery('test'));

    const query = engine.read((state: State) => state.searchBox?.query ?? '');

    expect(query).toBe('test');
  });
});

describe('Engine: subscribe()', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(searchBoxSlice);
    engine.adoptSlice(resultsSlice);
  });

  it('should trigger callback when subscribed value changes', () => {
    const callback = vi.fn();

    engine.subscribe(searchBoxSelectors.query, callback);
    engine.mutate(searchBoxMutations.setQuery('laptops'));

    expect(callback).toHaveBeenCalledWith('laptops');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not trigger callback when value does not change', () => {
    const callback = vi.fn();

    // Set initial value
    engine.mutate(searchBoxMutations.setQuery('test'));

    // Subscribe after value is set
    engine.subscribe(searchBoxSelectors.query, callback);

    // Set to same value
    engine.mutate(searchBoxMutations.setQuery('test'));

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not trigger callback when unrelated state changes', () => {
    const callback = vi.fn();

    engine.subscribe(searchBoxSelectors.query, callback);

    // Change loading state, not query
    engine.mutate(resultsMutations.setLoading(true));

    expect(callback).not.toHaveBeenCalled();
  });

  it('should trigger callback for each distinct change', () => {
    const callback = vi.fn();

    engine.subscribe(searchBoxSelectors.query, callback);

    engine.mutate(searchBoxMutations.setQuery('first'));
    engine.mutate(searchBoxMutations.setQuery('second'));
    engine.mutate(searchBoxMutations.setQuery('third'));

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(1, 'first');
    expect(callback).toHaveBeenNthCalledWith(2, 'second');
    expect(callback).toHaveBeenNthCalledWith(3, 'third');
  });

  it('should return an unsubscribe function', () => {
    const unsubscribe = engine.subscribe(searchBoxSelectors.query, vi.fn());

    expect(typeof unsubscribe).toBe('function');
  });

  it('should stop triggering callback after unsubscribe', () => {
    const callback = vi.fn();

    const unsubscribe = engine.subscribe(searchBoxSelectors.query, callback);

    // Should trigger
    engine.mutate(searchBoxMutations.setQuery('first'));
    expect(callback).toHaveBeenCalledTimes(1);

    // Unsubscribe
    unsubscribe();

    // Should not trigger
    engine.mutate(searchBoxMutations.setQuery('second'));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should support multiple independent subscriptions', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    engine.subscribe(searchBoxSelectors.query, callback1);
    engine.subscribe(searchBoxSelectors.query, callback2);

    engine.mutate(searchBoxMutations.setQuery('test'));

    expect(callback1).toHaveBeenCalledWith('test');
    expect(callback2).toHaveBeenCalledWith('test');
  });
});

describe('Engine: mutate()', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(searchBoxSlice);
    engine.adoptSlice(resultsSlice);
  });

  it('should update state correctly', () => {
    engine.mutate(searchBoxMutations.setQuery('test query'));

    expect(engine.read(searchBoxSelectors.query)).toBe('test query');
  });

  it('should handle multiple mutations in sequence', () => {
    engine.mutate(searchBoxMutations.setQuery('laptops'));
    engine.mutate(resultsMutations.setLoading(true));

    expect(engine.read(searchBoxSelectors.query)).toBe('laptops');
    expect(engine.read(resultsSelectors.isLoading)).toBe(true);
  });

  it('should accept library-agnostic StateMutation objects', () => {
    // Ensure slice is adopted first
    engine.read(searchBoxSelectors.query);

    engine.mutate({type: 'searchBox/setQuery', payload: 'test'});

    expect(engine.read(searchBoxSelectors.query)).toBe('test');
  });
});
