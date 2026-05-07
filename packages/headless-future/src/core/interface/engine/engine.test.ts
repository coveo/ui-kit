// TODO: these tests are integration-ish. Rework into actual unit tests.

/**
 * Core Engine Operations Tests
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import * as searchBoxMutations from '@/src/core/interface/search-box/search-box-mutators.js';
import * as searchBoxSelectors from '@/src/core/interface/search-box/search-box-selectors.js';
import * as resultsMutations from '@/src/core/interface/results/results-mutators.js';
import * as resultsSelectors from '@/src/core/interface/results/results-selectors.js';
import {Engine, FullEngine, getFullEngine} from './engine.js';
import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {resultsSlice} from '@/src/core/internal/results/results-slice.js';
import type {
  ConfigurationState,
  State,
} from '@/src/core/interface/interface-types.js';
import type {EngineOptions} from '@/src/core/interface/engine/engine-types.js';
import type {NavigatorContextProvider} from '@/src/core/interface/navigator-context/navigator-context-types.js';

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

describe('Engine: constructor()', () => {
  it('should not include configuration state when no configuration is passed', () => {
    const engine = new Engine();

    const configState = engine.read((state) => state.configuration);

    expect(configState).toBeUndefined();
  });

  it('should set organizationId and accessToken when configuration is passed', () => {
    const config: ConfigurationState = {
      organizationId: 'my-org',
      accessToken: 'my-token',
      trackingId: '',
      language: '',
      country: '',
      currency: '',
    };
    const engine = new Engine({configuration: config});

    expect(engine.read((state) => state.configuration?.organizationId)).toBe(
      'my-org'
    );
    expect(engine.read((state) => state.configuration?.accessToken)).toBe(
      'my-token'
    );
  });

  it('should set endpoint when provided in configuration', () => {
    const config: ConfigurationState = {
      organizationId: 'my-org',
      accessToken: 'my-token',
      trackingId: '',
      language: '',
      country: '',
      currency: '',
      endpoint: 'https://my-endpoint.coveo.com',
    };
    const engine = new Engine({configuration: config});

    expect(engine.read((state) => state.configuration?.endpoint)).toBe(
      'https://my-endpoint.coveo.com'
    );
  });

  it('should leave endpoint undefined when not provided in configuration', () => {
    const config: ConfigurationState = {
      organizationId: 'my-org',
      accessToken: 'my-token',
      trackingId: '',
      language: '',
      country: '',
      currency: '',
    };
    const engine = new Engine({configuration: config});

    expect(
      engine.read((state) => state.configuration?.endpoint)
    ).toBeUndefined();
  });

  it('should accept EngineOptions with configuration', () => {
    const options: EngineOptions = {
      configuration: {
        organizationId: 'my-org',
        accessToken: 'my-token',
        trackingId: '',
        language: '',
        country: '',
        currency: '',
      },
    };
    const engine = new Engine(options);

    expect(engine.read((state) => state.configuration?.organizationId)).toBe(
      'my-org'
    );
  });

  it('should store navigator context provider when provided', () => {
    const mockProvider: NavigatorContextProvider = () => ({
      clientId: 'test-client-id',
      location: 'https://example.com',
      referrer: 'https://google.com',
      userAgent: 'Mozilla/5.0',
    });

    const options: EngineOptions = {
      navigatorContextProvider: mockProvider,
    };
    const engine = new Engine(options);

    // Verify provider can be retrieved and called
    const provider = engine.getNavigatorContextProvider();
    expect(provider).toBe(mockProvider);
    expect(provider?.()).toEqual({
      clientId: 'test-client-id',
      location: 'https://example.com',
      referrer: 'https://google.com',
      userAgent: 'Mozilla/5.0',
    });
  });

  it('should return undefined navigator context provider when not provided', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const engine = new Engine();

    const provider = engine.getNavigatorContextProvider();
    expect(provider).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      '[WARNING] Missing navigator context provider. Provide `navigatorContextProvider` in Engine options before using conversational requests.'
    );

    warnSpy.mockRestore();
  });

  it('should warn only once when navigator context provider is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const engine = new Engine();

    engine.getNavigatorContextProvider();
    engine.getNavigatorContextProvider();

    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it('should accept both configuration and navigator context provider', () => {
    const mockProvider: NavigatorContextProvider = () => ({
      clientId: 'client-123',
      location: 'https://example.com',
      referrer: null,
      userAgent: null,
    });

    const options: EngineOptions = {
      configuration: {
        organizationId: 'my-org',
        accessToken: 'my-token',
        trackingId: '',
        language: '',
        country: '',
        currency: '',
      },
      navigatorContextProvider: mockProvider,
    };
    const engine = new Engine(options);

    expect(engine.read((state) => state.configuration?.organizationId)).toBe(
      'my-org'
    );
    expect(engine.getNavigatorContextProvider()).toBe(mockProvider);
  });
});
