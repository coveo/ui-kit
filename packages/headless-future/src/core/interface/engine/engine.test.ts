// TODO: these tests are integration-ish. Rework into actual unit tests.

/**
 * Core Engine Operations Tests
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {getQuery} from '@/src/core/interface/search-box/search-box-selectors.js';
import {setQuery} from '@/src/core/interface/search-box/search-box-mutators.js';
import {setStatus} from '@/src/core/interface/api/search-endpoint/search-endpoint-mutators.js';
import {isLoading} from '@/src/core/interface/api/search-endpoint/search-endpoint-selectors.js';
import {Engine, FullEngine, getFullEngine} from './engine.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {resultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import {searchEndpointSlice} from '@/src/core/internal/api/search-endpoint/search-endpoint-slice.js';
import type {NavigatorContextProvider} from '@/src/core/interface/navigator-context/navigator-context-types.js';
import {EngineOptions, State} from './engine-types.js';
import {ConfigurationState} from '../configuration/configuration-types.js';

describe('Engine: read()', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(getOrCreateSearchBoxSlice('default'));
    engine.adoptSlice(resultsSlice);
    engine.adoptSlice(searchEndpointSlice);
  });

  it('should read values from state using a selector', () => {
    const query = engine.read(getQuery);

    expect(query).toBe('');
  });

  it('should return updated values after mutations', () => {
    engine.mutate(setQuery('laptops'));
    const query = engine.read(getQuery);

    expect(query).toBe('laptops');
  });

  it('should work with inline selector functions', () => {
    engine.mutate(setQuery('test'));

    const query = engine.read(
      (state: Record<string, any>) =>
        (state['default/searchBox'] as {query: string} | undefined)?.query ?? ''
    );

    expect(query).toBe('test');
  });
});

describe('Engine: subscribe()', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(getOrCreateSearchBoxSlice('default'));
    engine.adoptSlice(resultsSlice);
  });

  it('should trigger callback when subscribed value changes', () => {
    const callback = vi.fn();

    engine.subscribe(getQuery, callback);
    engine.mutate(setQuery('laptops'));

    expect(callback).toHaveBeenCalledWith('laptops');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not trigger callback when value does not change', () => {
    const callback = vi.fn();

    // Set initial value
    engine.mutate(setQuery('test'));

    // Subscribe after value is set
    engine.subscribe(getQuery, callback);

    // Set to same value
    engine.mutate(setQuery('test'));

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not trigger callback when unrelated state changes', () => {
    const callback = vi.fn();

    engine.subscribe(getQuery, callback);

    engine.mutate(setStatus('pending'));

    expect(callback).not.toHaveBeenCalled();
  });

  it('should trigger callback for each distinct change', () => {
    const callback = vi.fn();

    engine.subscribe(getQuery, callback);

    engine.mutate(setQuery('first'));
    engine.mutate(setQuery('second'));
    engine.mutate(setQuery('third'));

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(1, 'first');
    expect(callback).toHaveBeenNthCalledWith(2, 'second');
    expect(callback).toHaveBeenNthCalledWith(3, 'third');
  });

  it('should return an unsubscribe function', () => {
    const unsubscribe = engine.subscribe(getQuery, vi.fn());

    expect(typeof unsubscribe).toBe('function');
  });

  it('should stop triggering callback after unsubscribe', () => {
    const callback = vi.fn();

    const unsubscribe = engine.subscribe(getQuery, callback);

    // Should trigger
    engine.mutate(setQuery('first'));
    expect(callback).toHaveBeenCalledTimes(1);

    // Unsubscribe
    unsubscribe();

    // Should not trigger
    engine.mutate(setQuery('second'));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should support multiple independent subscriptions', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    engine.subscribe(getQuery, callback1);
    engine.subscribe(getQuery, callback2);

    engine.mutate(setQuery('test'));

    expect(callback1).toHaveBeenCalledWith('test');
    expect(callback2).toHaveBeenCalledWith('test');
  });
});

describe('Engine: mutate()', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(getOrCreateSearchBoxSlice('default'));
    engine.adoptSlice(resultsSlice);
    engine.adoptSlice(searchEndpointSlice);
  });

  it('should update state correctly', () => {
    engine.mutate(setQuery('test query'));

    expect(engine.read(getQuery)).toBe('test query');
  });

  it('should handle multiple mutations in sequence', () => {
    engine.mutate(setQuery('laptops'));
    engine.mutate(setStatus('pending'));

    expect(engine.read(getQuery)).toBe('laptops');
    expect(engine.read(isLoading)).toBe(true);
  });

  it('should accept library-agnostic StateMutation objects', () => {
    // Ensure slice is adopted first
    engine.read(getQuery);

    engine.mutate({type: 'default/searchBox/setQuery', payload: 'test'});

    expect(engine.read(getQuery)).toBe('test');
  });
});

describe('Engine: constructor()', () => {
  it('should return the same FullEngine wrapper for the same Engine instance', () => {
    const engine = new Engine();

    const firstWrapper = getFullEngine(engine);
    const secondWrapper = getFullEngine(engine);

    expect(firstWrapper).toBe(secondWrapper);
  });

  it('should not include configuration state when no configuration is passed', () => {
    const engine = getFullEngine(new Engine());

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
    const engine = getFullEngine(new Engine({configuration: config}));

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
    const engine = getFullEngine(new Engine({configuration: config}));

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
    const engine = getFullEngine(new Engine({configuration: config}));

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
    const engine = getFullEngine(new Engine(options));

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
    const fullEngine = getFullEngine(new Engine(options));

    // Verify provider can be retrieved and called
    const provider = fullEngine.getNavigatorContextProvider();
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
    const fullEngine = getFullEngine(new Engine());

    const provider = fullEngine.getNavigatorContextProvider();
    expect(provider).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      '[WARNING] Missing navigator context provider. Provide `navigatorContextProvider` in Engine options before using conversational requests.'
    );

    warnSpy.mockRestore();
  });

  it('should warn only once when navigator context provider is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fullEngine = getFullEngine(new Engine());

    fullEngine.getNavigatorContextProvider();
    fullEngine.getNavigatorContextProvider();

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
    const fullEngine = getFullEngine(new Engine(options));

    expect(
      fullEngine.read((state) => state.configuration?.organizationId)
    ).toBe('my-org');
    expect(fullEngine.getNavigatorContextProvider()).toBe(mockProvider);
  });
});
