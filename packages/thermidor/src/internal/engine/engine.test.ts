// TODO: these tests are integration-ish. Rework into actual unit tests.

/**
 * Core Engine Operations Tests
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {getQuery} from '@/src/internal/features/search-box/index.js';
import {setQuery} from '@/src/internal/features/search-box/index.js';
import {setResultsFromResponse} from '@/src/internal/features/result-list/index.js';
import {Engine, FullEngine, getFullEngine} from './engine.js';
import {getOrCreateSearchBoxSlice} from '@/src/internal/features/search-box/index.js';
import {getOrCreateResultsSlice} from '@/src/internal/features/result-list/index.js';
import type {NavigatorContextProvider} from '@/src/internal/utils/index.js';
import {EngineOptions} from './engine-types.js';
import {ConfigurationState} from '@/src/internal/features/configuration/index.js';
import type {SearchInterface} from '@/src/public/interfaces/search.js';

describe('Engine: read()', () => {
  let engine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    const rawEngine = createTestEngine();
    engine = getFullEngine(rawEngine);
    iface = createTestInterface(rawEngine, 'default');
    engine.adoptSlice(getOrCreateSearchBoxSlice(iface));
    engine.adoptSlice(getOrCreateResultsSlice(iface));
  });

  it('should read values from state using a selector', () => {
    const query = engine.read(getQuery(iface));

    expect(query).toBe('');
  });

  it('should return updated values after mutations', () => {
    engine.mutate(setQuery('laptops', iface));
    const query = engine.read(getQuery(iface));

    expect(query).toBe('laptops');
  });

  it('should work with inline selector functions', () => {
    engine.mutate(setQuery('test', iface));

    const query = engine.read(
      (state: Record<string, any>) =>
        (state['default/searchBox'] as {query: string} | undefined)?.query ?? ''
    );

    expect(query).toBe('test');
  });
});

describe('Engine: subscribe()', () => {
  let engine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    const rawEngine = createTestEngine();
    engine = getFullEngine(rawEngine);
    iface = createTestInterface(rawEngine, 'default');
    engine.adoptSlice(getOrCreateSearchBoxSlice(iface));
    engine.adoptSlice(getOrCreateResultsSlice(iface));
  });

  it('should trigger callback when subscribed value changes', () => {
    const callback = vi.fn();

    engine.subscribe(getQuery(iface), callback);
    engine.mutate(setQuery('laptops', iface));

    expect(callback).toHaveBeenCalledWith('laptops');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not trigger callback when value does not change', () => {
    const callback = vi.fn();

    engine.mutate(setQuery('test', iface));

    engine.subscribe(getQuery(iface), callback);

    engine.mutate(setQuery('test', iface));

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not trigger callback when unrelated state changes', () => {
    const callback = vi.fn();

    engine.subscribe(getQuery(iface), callback);

    engine.mutate(setResultsFromResponse([], iface));

    expect(callback).not.toHaveBeenCalled();
  });

  it('should trigger callback for each distinct change', () => {
    const callback = vi.fn();

    engine.subscribe(getQuery(iface), callback);

    engine.mutate(setQuery('first', iface));
    engine.mutate(setQuery('second', iface));
    engine.mutate(setQuery('third', iface));

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(1, 'first');
    expect(callback).toHaveBeenNthCalledWith(2, 'second');
    expect(callback).toHaveBeenNthCalledWith(3, 'third');
  });

  it('should return an unsubscribe function', () => {
    const unsubscribe = engine.subscribe(getQuery(iface), vi.fn());

    expect(typeof unsubscribe).toBe('function');
  });

  it('should stop triggering callback after unsubscribe', () => {
    const callback = vi.fn();

    const unsubscribe = engine.subscribe(getQuery(iface), callback);

    engine.mutate(setQuery('first', iface));
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();

    engine.mutate(setQuery('second', iface));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should support multiple independent subscriptions', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    engine.subscribe(getQuery(iface), callback1);
    engine.subscribe(getQuery(iface), callback2);

    engine.mutate(setQuery('test', iface));

    expect(callback1).toHaveBeenCalledWith('test');
    expect(callback2).toHaveBeenCalledWith('test');
  });
});

describe('Engine: mutate()', () => {
  let engine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    const rawEngine = createTestEngine();
    engine = getFullEngine(rawEngine);
    iface = createTestInterface(rawEngine, 'default');
    engine.adoptSlice(getOrCreateSearchBoxSlice(iface));
    engine.adoptSlice(getOrCreateResultsSlice(iface));
  });

  it('should update state correctly', () => {
    engine.mutate(setQuery('test query', iface));

    expect(engine.read(getQuery(iface))).toBe('test query');
  });

  it('should handle multiple mutations in sequence', () => {
    engine.mutate(setQuery('laptops', iface));

    expect(engine.read(getQuery(iface))).toBe('laptops');
  });

  it('should accept library-agnostic StateMutation objects', () => {
    engine.read(getQuery(iface));

    engine.mutate({type: 'default/searchBox/setQuery', payload: 'test'});

    expect(engine.read(getQuery(iface))).toBe('test');
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

describe('Engine.dispose()', () => {
  let engine: Engine;
  let fullEngine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    iface = createTestInterface(engine, 'default');
  });

  it('disposed returns false before dispose', () => {
    expect(engine.disposed).toBe(false);
  });

  it('disposed returns true after dispose', () => {
    engine.dispose();

    expect(engine.disposed).toBe(true);
  });

  it('mutate throws after dispose', () => {
    engine.dispose();

    expect(() => fullEngine.mutate(setQuery('test', iface))).toThrow();
  });

  it('read throws after dispose', () => {
    engine.dispose();

    expect(() => fullEngine.read(getQuery(iface))).toThrow();
  });

  it('subscribe throws after dispose', () => {
    engine.dispose();

    expect(() => fullEngine.subscribe(getQuery(iface), () => {})).toThrow();
  });

  it('adoptSlice throws after dispose', async () => {
    const slice = getOrCreateSearchBoxSlice(iface);
    engine.dispose();

    await expect(fullEngine.adoptSlice(slice)).rejects.toThrow(
      'Cannot operate on a disposed Engine.'
    );
  });

  it('all operations work normally before dispose', async () => {
    await fullEngine.adoptSlice(getOrCreateSearchBoxSlice(iface));
    fullEngine.mutate(setQuery('hello', iface));
    const query = fullEngine.read(getQuery(iface));
    const unsubscribe = fullEngine.subscribe(getQuery(iface), () => {});

    expect(query).toBe('hello');
    expect(typeof unsubscribe).toBe('function');

    unsubscribe();
  });
});
