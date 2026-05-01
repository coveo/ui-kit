/**
 * Core Engine Operations Tests
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import * as searchBoxMutations from '@/src/core/interface/search-box/search-box-mutators.js';
import * as searchBoxSelectors from '@/src/core/interface/search-box/search-box-selectors.js';
import * as resultsMutations from '@/src/core/interface/results/results-mutators.js';
import * as resultsSelectors from '@/src/core/interface/results/results-selectors.js';
import {Engine} from './engine.js';
import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {resultsSlice} from '@/src/core/internal/results/results-slice.js';
import type {State} from '@/src/core/interface/interface-types.js';

describe('Engine: read()', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
    engine.adoptSlice(searchBoxSlice);
    engine.adoptSlice(resultsSlice);
  });

  it('should read values from state using a selector', () => {
    const query = engine.read(searchBoxSelectors.query);

    expect(query).toBe('');
  });

  it('should return updated values after mutations', () => {
    searchBoxMutations.setQuery(engine, 'laptops');
    const query = engine.read(searchBoxSelectors.query);

    expect(query).toBe('laptops');
  });

  it('should work with inline selector functions', () => {
    searchBoxMutations.setQuery(engine, 'test');

    const query = engine.read((state: State) => state.searchBox?.query ?? '');

    expect(query).toBe('test');
  });
});

describe('Engine: subscribe()', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
    engine.adoptSlice(searchBoxSlice);
    engine.adoptSlice(resultsSlice);
  });

  it('should trigger callback when subscribed value changes', () => {
    const callback = vi.fn();

    engine.subscribe(searchBoxSelectors.query, callback);
    searchBoxMutations.setQuery(engine, 'laptops');

    expect(callback).toHaveBeenCalledWith('laptops');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not trigger callback when value does not change', () => {
    const callback = vi.fn();

    // Set initial value
    searchBoxMutations.setQuery(engine, 'test');

    // Subscribe after value is set
    engine.subscribe(searchBoxSelectors.query, callback);

    // Set to same value
    searchBoxMutations.setQuery(engine, 'test');

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not trigger callback when unrelated state changes', () => {
    const callback = vi.fn();

    engine.subscribe(searchBoxSelectors.query, callback);

    // Change loading state, not query
    resultsMutations.setLoading(engine, true);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should trigger callback for each distinct change', () => {
    const callback = vi.fn();

    engine.subscribe(searchBoxSelectors.query, callback);

    searchBoxMutations.setQuery(engine, 'first');
    searchBoxMutations.setQuery(engine, 'second');
    searchBoxMutations.setQuery(engine, 'third');

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
    searchBoxMutations.setQuery(engine, 'first');
    expect(callback).toHaveBeenCalledTimes(1);

    // Unsubscribe
    unsubscribe();

    // Should not trigger
    searchBoxMutations.setQuery(engine, 'second');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should support multiple independent subscriptions', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    engine.subscribe(searchBoxSelectors.query, callback1);
    engine.subscribe(searchBoxSelectors.query, callback2);

    searchBoxMutations.setQuery(engine, 'test');

    expect(callback1).toHaveBeenCalledWith('test');
    expect(callback2).toHaveBeenCalledWith('test');
  });
});

describe('Engine: mutate()', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
    engine.adoptSlice(searchBoxSlice);
    engine.adoptSlice(resultsSlice);
  });

  it('should update state correctly', () => {
    searchBoxMutations.setQuery(engine, 'test query');

    expect(engine.read(searchBoxSelectors.query)).toBe('test query');
  });

  it('should handle multiple mutations in sequence', () => {
    searchBoxMutations.setQuery(engine, 'laptops');
    resultsMutations.setLoading(engine, true);

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
