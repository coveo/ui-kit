import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {GenerativeStatePort} from './generative-runtime.js';

vi.mock('@/src/api/index.js', () => ({
  readConversationEventStream: vi.fn(),
  createConversationEndpointClient: vi.fn(),
}));

vi.mock('@/src/core/internal/configuration/configuration-reader.js', () => ({
  readEndpointClientConfiguration: vi.fn(() => ({})),
}));

function createMockStatePort(): GenerativeStatePort {
  return {
    createTurn: vi.fn(),
    setActiveTurnId: vi.fn(),
    replaceTurnId: vi.fn(),
    initAgentResponse: vi.fn(),
    startMessage: vi.fn(),
    appendMessageDelta: vi.fn(),
    appendSurface: vi.fn(),
    startToolCall: vi.fn(),
    appendToolCallArgs: vi.fn(),
    completeToolCall: vi.fn(),
    completeTurn: vi.fn(),
    failTurn: vi.fn(),
    clearTurnResponse: vi.fn(),
    createBackendSurface: vi.fn(),
    updateBackendSurfaceState: vi.fn(),
    deleteBackendSurface: vi.fn(),
    updateSuggestions: vi.fn(),
    setConversationSessionId: vi.fn(),
    setConversationToken: vi.fn(),
    updateFacetSearchResults: vi.fn(),
  };
}

describe('GenerativeRuntime.dispatchEvent — A2UI + CUSTOM events', () => {
  let statePort: GenerativeStatePort;
  let dispatchEvent: (
    turnId: string,
    event: {type: string; name?: string; value?: unknown; [k: string]: unknown}
  ) => {turnId: string; isTerminal: boolean};

  beforeEach(async () => {
    statePort = createMockStatePort();

    const {GenerativeRuntime} = await import('./generative-runtime.js');

    const mockEngine = {
      read: vi.fn(() => ({
        trackingId: 'test',
        language: 'en',
        country: 'US',
        currency: 'USD',
        message: '',
        cart: [],
      })),
      getNavigatorContextProvider: vi.fn(() => () => ({})),
      subscribe: vi.fn(),
      mutate: vi.fn(),
      adoptSlice: vi.fn(),
      storeHydrationSnapshot: vi.fn(),
    } as any;

    const runtime = GenerativeRuntime.getInstance(mockEngine, 'test-runtime', {
      generativeInterfaceId: 'test-runtime',
      cartInterfaceId: 'test-runtime',
      statePort,
    });

    dispatchEvent = (runtime as any).dispatchEvent.bind(runtime);
  });

  function snapshot(operations: unknown[]) {
    return {
      type: 'ACTIVITY_SNAPSHOT',
      activityType: 'a2ui-surface',
      content: {operations},
    };
  }

  it('registers a stateful surface from createSurface', () => {
    const result = dispatchEvent('turn-1', {
      ...snapshot([
        {
          createSurface: {
            surfaceId: 'ui-1',
            catalogId: 'commerce',
            surfaceProperties: {placement: 'main'},
            components: [{id: 'root', component: 'ProductSearchSurface'}],
            dataModel: {query: 'shoes', products: []},
          },
        },
      ]),
    });

    expect(statePort.createBackendSurface).toHaveBeenCalledWith(
      'ui-1',
      'product_search',
      'main',
      {query: 'shoes', products: []},
      'turn-1'
    );
    expect(statePort.appendSurface).not.toHaveBeenCalled();
    expect(result.isTerminal).toBe(false);
  });

  it('appends a display-only surface to the transcript', () => {
    const createSurface = {
      surfaceId: 'comparison-1',
      catalogId: 'commerce',
      surfaceProperties: {placement: 'inline'},
      components: [{id: 'root', component: 'ComparisonTable'}],
      dataModel: {items: []},
    };

    const result = dispatchEvent('turn-1', {...snapshot([{createSurface}])});

    expect(statePort.appendSurface).toHaveBeenCalledWith(
      'turn-1',
      createSurface
    );
    expect(statePort.createBackendSurface).not.toHaveBeenCalled();
    expect(result.isTerminal).toBe(false);
  });

  it('patches a stateful surface from updateDataModel', () => {
    const result = dispatchEvent('turn-1', {
      ...snapshot([
        {
          updateDataModel: {
            surfaceId: 'ui-1',
            path: '/products',
            value: [{name: 'Nike'}],
          },
        },
      ]),
    });

    expect(statePort.updateBackendSurfaceState).toHaveBeenCalledWith(
      'ui-1',
      '/products',
      [{name: 'Nike'}]
    );
    expect(result.isTerminal).toBe(false);
  });

  it('removes a surface from deleteSurface', () => {
    const result = dispatchEvent('turn-1', {
      ...snapshot([{deleteSurface: {surfaceId: 'ui-1'}}]),
    });

    expect(statePort.deleteBackendSurface).toHaveBeenCalledWith('ui-1');
    expect(result.isTerminal).toBe(false);
  });

  it('ignores ACTIVITY_SNAPSHOT with a non-a2ui activityType', () => {
    const result = dispatchEvent('turn-1', {
      type: 'ACTIVITY_SNAPSHOT',
      activityType: 'other',
      content: {operations: [{deleteSurface: {surfaceId: 'ui-1'}}]},
    });

    expect(statePort.deleteBackendSurface).not.toHaveBeenCalled();
    expect(result.isTerminal).toBe(false);
  });

  it('handles coveo.suggestions', () => {
    const result = dispatchEvent('turn-1', {
      type: 'CUSTOM',
      name: 'coveo.suggestions',
      value: {
        surfaceId: 'ui-1',
        query: 'red',
        completions: [{expression: 'red shirt', highlighted: 'red shirt'}],
        products: [],
      },
    });

    expect(statePort.updateSuggestions).toHaveBeenCalledWith('ui-1', {
      query: 'red',
      completions: [{expression: 'red shirt', highlighted: 'red shirt'}],
      products: [],
    });
    expect(result.isTerminal).toBe(false);
  });

  it('handles coveo.facetSearchResults', () => {
    const result = dispatchEvent('turn-1', {
      type: 'CUSTOM',
      name: 'coveo.facetSearchResults',
      value: {
        surfaceId: 'ui-1',
        facetId: 'brand',
        query: 'Ni',
        values: [{displayValue: 'Nike', rawValue: 'Nike', count: 42}],
        moreValuesAvailable: false,
      },
    });

    expect(statePort.updateFacetSearchResults).toHaveBeenCalledWith('ui-1', {
      surfaceId: 'ui-1',
      facetId: 'brand',
      query: 'Ni',
      values: [{displayValue: 'Nike', rawValue: 'Nike', count: 42}],
      moreValuesAvailable: false,
    });
    expect(result.isTerminal).toBe(false);
  });

  it('ignores unknown CUSTOM events', () => {
    const result = dispatchEvent('turn-1', {
      type: 'CUSTOM',
      name: 'some.other.event',
      value: {data: 'whatever'},
    });

    expect(statePort.createBackendSurface).not.toHaveBeenCalled();
    expect(statePort.updateBackendSurfaceState).not.toHaveBeenCalled();
    expect(statePort.updateSuggestions).not.toHaveBeenCalled();
    expect(result.isTerminal).toBe(false);
  });

  it('handles CUSTOM event with null value', () => {
    const result = dispatchEvent('turn-1', {
      type: 'CUSTOM',
      name: 'coveo.suggestions',
      value: undefined,
    });

    expect(statePort.updateSuggestions).not.toHaveBeenCalled();
    expect(result.isTerminal).toBe(false);
  });
});

describe('GenerativeRuntime.submit — context fields in request', () => {
  let mockCall: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();

    mockCall = vi.fn().mockResolvedValue({
      success: true,
      data: {stream: new ReadableStream({start: (c) => c.close()})},
    });

    const {createConversationEndpointClient} =
      await import('@/src/api/index.js');
    (createConversationEndpointClient as any).mockReturnValue({call: mockCall});
  });

  async function buildRuntimeAndSubmit(contextConfig: unknown) {
    const {GenerativeRuntime} = await import('./generative-runtime.js');

    const mockEngine = {
      read: vi.fn(() => ({
        trackingId: 'test',
        language: 'en',
        country: 'US',
        currency: 'USD',
        message: 'hello',
        cart: [],
        context: contextConfig,
      })),
      getNavigatorContextProvider: vi.fn(() => () => ({
        clientId: 'client-1',
        location: 'https://store.example.com',
        referrer: null,
        userAgent: 'TestAgent/1.0',
      })),
      subscribe: vi.fn(),
      mutate: vi.fn(),
      adoptSlice: vi.fn(),
      storeHydrationSnapshot: vi.fn(),
    } as any;

    const statePort = createMockStatePort();
    const runtime = GenerativeRuntime.getInstance(
      mockEngine,
      `ctx-test-${Math.random()}`,
      {
        generativeInterfaceId: 'ctx-test',
        cartInterfaceId: 'ctx-test',
        statePort,
      }
    );

    await runtime.submit('hello');
    return mockCall.mock.calls[0][0];
  }

  it('includes latitude and longitude in context.user when configured', async () => {
    const request = await buildRuntimeAndSubmit({
      user: {latitude: 45.5, longitude: -73.5},
    });

    expect(request.context.user).toEqual({
      userAgent: 'TestAgent/1.0',
      latitude: 45.5,
      longitude: -73.5,
    });
  });

  it('includes dictionaryFieldContext when configured', async () => {
    const request = await buildRuntimeAndSubmit({
      dictionaryFieldContext: {price: 'usd'},
    });

    expect(request.context.dictionaryFieldContext).toEqual({price: 'usd'});
  });

  it('includes fieldAliases when configured', async () => {
    const request = await buildRuntimeAndSubmit({
      fieldAliases: {priceField: 'ec_price_usd'},
    });

    expect(request.context.fieldAliases).toEqual({
      priceField: 'ec_price_usd',
    });
  });

  it('omits context fields when not configured', async () => {
    const request = await buildRuntimeAndSubmit(undefined);

    expect(request.context.user).toEqual({userAgent: 'TestAgent/1.0'});
    expect(request.context.dictionaryFieldContext).toBeUndefined();
    expect(request.context.fieldAliases).toBeUndefined();
  });

  it('includes all context fields together', async () => {
    const request = await buildRuntimeAndSubmit({
      user: {latitude: 40.7, longitude: -74.0},
      dictionaryFieldContext: {price: 'cad'},
      fieldAliases: {nameField: 'ec_name_fr'},
    });

    expect(request.context.user).toEqual({
      userAgent: 'TestAgent/1.0',
      latitude: 40.7,
      longitude: -74.0,
    });
    expect(request.context.dictionaryFieldContext).toEqual({price: 'cad'});
    expect(request.context.fieldAliases).toEqual({nameField: 'ec_name_fr'});
  });
});
