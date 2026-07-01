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
    createBackendInterface: vi.fn(),
    updateBackendInterfaceState: vi.fn(),
    updateSuggestions: vi.fn(),
    setConversationSessionId: vi.fn(),
    setConversationToken: vi.fn(),
    updateFacetSearchResults: vi.fn(),
  };
}

describe('GenerativeRuntime.dispatchEvent — CUSTOM events', () => {
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

  it('handles coveo.interfaceCreated', () => {
    const result = dispatchEvent('turn-1', {
      type: 'CUSTOM',
      name: 'coveo.interfaceCreated',
      value: {
        interfaceId: 'ui-1',
        type: 'product_search',
        display: 'main',
        state: {query: 'shoes', products: []},
      },
    });

    expect(statePort.createBackendInterface).toHaveBeenCalledWith(
      'ui-1',
      'product_search',
      'main',
      {query: 'shoes', products: []}
    );
    expect(result.isTerminal).toBe(false);
  });

  it('handles coveo.stateUpdate', () => {
    const result = dispatchEvent('turn-1', {
      type: 'CUSTOM',
      name: 'coveo.stateUpdate',
      value: {
        interfaceId: 'ui-1',
        display: 'main',
        state: {query: 'shoes', products: [{name: 'Nike'}]},
      },
    });

    expect(statePort.updateBackendInterfaceState).toHaveBeenCalledWith(
      'ui-1',
      {query: 'shoes', products: [{name: 'Nike'}]},
      'main'
    );
    expect(result.isTerminal).toBe(false);
  });

  it('handles coveo.suggestions', () => {
    const result = dispatchEvent('turn-1', {
      type: 'CUSTOM',
      name: 'coveo.suggestions',
      value: {
        interfaceId: 'ui-1',
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
        interfaceId: 'ui-1',
        facetId: 'brand',
        query: 'Ni',
        values: [{displayValue: 'Nike', rawValue: 'Nike', count: 42}],
        moreValuesAvailable: false,
      },
    });

    expect(statePort.updateFacetSearchResults).toHaveBeenCalledWith('ui-1', {
      interfaceId: 'ui-1',
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

    expect(statePort.createBackendInterface).not.toHaveBeenCalled();
    expect(statePort.updateBackendInterfaceState).not.toHaveBeenCalled();
    expect(statePort.updateSuggestions).not.toHaveBeenCalled();
    expect(result.isTerminal).toBe(false);
  });

  it('handles CUSTOM event with null value', () => {
    const result = dispatchEvent('turn-1', {
      type: 'CUSTOM',
      name: 'coveo.interfaceCreated',
      value: undefined,
    });

    expect(statePort.createBackendInterface).not.toHaveBeenCalled();
    expect(result.isTerminal).toBe(false);
  });
});
