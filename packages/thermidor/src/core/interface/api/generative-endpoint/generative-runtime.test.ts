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
