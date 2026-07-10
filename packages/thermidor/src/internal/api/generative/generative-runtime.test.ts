import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {
  GenerativeStatePort,
  HydrateSubInterface,
} from './generative-runtime.js';
import {GenerativeRuntime} from './generative-runtime.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {RoutedInterface} from '@/src/internal/features/generative/index.js';

const mockReadConversationEventStream = vi.fn();
const mockEndpointClientCall = vi.fn();
const mockGenerateId = vi.fn(() => 'generated-turn-id');

vi.mock('@/src/internal/api/conversation/index.js', () => ({
  readConversationEventStream: (...args: unknown[]) =>
    mockReadConversationEventStream(...args),
  createConversationEndpointClient: () => ({call: mockEndpointClientCall}),
  createConversationEndpointRequestSelector: () => () => ({
    trackingId: 'tracking-id',
    language: 'en',
    country: 'US',
    currency: 'USD',
    message: '',
    cart: [],
  }),
}));

vi.mock('@/src/internal/features/configuration/index.js', () => ({
  readEndpointClientConfiguration: () => ({
    organizationId: 'org-123',
    accessToken: 'token-abc',
  }),
}));

vi.mock('@/src/internal/utils/index.js', () => ({
  generateId: () => mockGenerateId(),
}));

function createMockStatePort(): GenerativeStatePort {
  return {
    createTurn: vi.fn(),
    setActiveTurnId: vi.fn(),
    replaceTurnId: vi.fn(),
    setRoutedInterface: vi.fn(),
    initAgentResponse: vi.fn(),
    startMessage: vi.fn(),
    appendMessageDelta: vi.fn(),
    appendSurface: vi.fn(),
    startToolCall: vi.fn(),
    appendToolCallArgs: vi.fn(),
    completeToolCall: vi.fn(),
    setStateSnapshot: vi.fn(),
    completeTurn: vi.fn(),
    failTurn: vi.fn(),
    clearTurnResponse: vi.fn(),
    startReasoning: vi.fn(),
    appendReasoningDelta: vi.fn(),
    endReasoning: vi.fn(),
  };
}

function createMockEngine(): FullEngine {
  return {
    read: vi.fn(() => ({
      trackingId: 'tracking-id',
      language: 'en',
      country: 'US',
      currency: 'USD',
      message: '',
      cart: [],
    })),
    getNavigatorContextProvider: vi.fn(() => undefined),
    adoptSlice: vi.fn(),
    addInterface: vi.fn(),
    removeInterface: vi.fn(),
    mutate: vi.fn(),
    storeHydrationSnapshot: vi.fn(),
    subscribe: vi.fn(),
  } as unknown as FullEngine;
}

function setupStreamWithEvents(events: unknown[], callOnDone = true) {
  mockEndpointClientCall.mockResolvedValue({
    success: true,
    data: {stream: {} as ReadableStream<Uint8Array>},
  });

  mockReadConversationEventStream.mockImplementation(
    async ({onEvent, onDone}) => {
      for (const event of events) {
        onEvent(event);
      }
      if (callOnDone) {
        onDone?.();
      }
    }
  );
}

describe('GenerativeRuntime – routed search event handling', () => {
  let statePort: GenerativeStatePort;
  let hydrateSubInterface: HydrateSubInterface;
  let engine: FullEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    statePort = createMockStatePort();
    hydrateSubInterface = vi.fn();
    engine = createMockEngine();

    GenerativeRuntime['cache'] = new WeakMap();
  });

  function buildRuntime() {
    return GenerativeRuntime.getInstance(engine, 'test-interface', {
      statePort,
      hydrateSubInterface,
      generativeInterface: {} as never,
      cartInterface: {} as never,
    });
  }

  describe('commerce-search-api-response event with successful hydration', () => {
    it('calls setRoutedInterface and completeTurn, stream is terminal', async () => {
      const mockRoutedInterface: RoutedInterface = {
        useCase: 'commerceSearch',
        interface: {} as never,
      };
      vi.mocked(hydrateSubInterface).mockReturnValue(mockRoutedInterface);

      const eventPayload = {
        type: 'commerce-search-api-response',
        products: [{permanentid: 'p1'}],
        pagination: {totalEntries: 1},
      };
      setupStreamWithEvents([eventPayload]);

      const runtime = buildRuntime();
      await runtime.submit('shoes');

      expect(hydrateSubInterface).toHaveBeenCalledWith(
        'commerce-search-api-response',
        eventPayload,
        'shoes'
      );
      expect(statePort.setRoutedInterface).toHaveBeenCalledWith(
        'generated-turn-id',
        mockRoutedInterface
      );
      expect(statePort.completeTurn).toHaveBeenCalledWith('generated-turn-id');
      expect(statePort.failTurn).not.toHaveBeenCalled();
    });
  });

  describe('search-api-response event with successful hydration', () => {
    it('calls setRoutedInterface and completeTurn, stream is terminal', async () => {
      const mockRoutedInterface: RoutedInterface = {
        useCase: 'search',
        interface: {} as never,
      };
      vi.mocked(hydrateSubInterface).mockReturnValue(mockRoutedInterface);

      const eventPayload = {
        type: 'search-api-response',
        results: [{uniqueId: 'r1'}],
        totalCount: 1,
      };
      setupStreamWithEvents([eventPayload]);

      const runtime = buildRuntime();
      await runtime.submit('red running shoes');

      expect(hydrateSubInterface).toHaveBeenCalledWith(
        'search-api-response',
        eventPayload,
        'red running shoes'
      );
      expect(statePort.setRoutedInterface).toHaveBeenCalledWith(
        'generated-turn-id',
        mockRoutedInterface
      );
      expect(statePort.completeTurn).toHaveBeenCalledWith('generated-turn-id');
      expect(statePort.failTurn).not.toHaveBeenCalled();
    });
  });

  describe('routed event when hydration returns null', () => {
    it('does not call state port mutation methods and returns non-terminal', async () => {
      vi.mocked(hydrateSubInterface).mockReturnValue(null);

      const eventPayload = {
        type: 'commerce-search-api-response',
        products: [],
      };
      setupStreamWithEvents([eventPayload, {type: 'RUN_FINISHED'}]);

      const runtime = buildRuntime();
      await runtime.submit('test query');

      expect(statePort.setRoutedInterface).not.toHaveBeenCalled();
      expect(statePort.completeTurn).toHaveBeenCalledTimes(1);
      expect(statePort.completeTurn).toHaveBeenCalledWith('generated-turn-id');
    });
  });

  describe('currentPrompt forwarding', () => {
    it('passes the user prompt to hydrateSubInterface as the query parameter', async () => {
      const mockRoutedInterface: RoutedInterface = {
        useCase: 'commerceSearch',
        interface: {} as never,
      };
      vi.mocked(hydrateSubInterface).mockReturnValue(mockRoutedInterface);

      const eventPayload = {
        type: 'commerce-search-api-response',
        products: [],
      };
      setupStreamWithEvents([eventPayload]);

      const runtime = buildRuntime();
      await runtime.submit('blue sneakers');

      expect(hydrateSubInterface).toHaveBeenCalledWith(
        'commerce-search-api-response',
        eventPayload,
        'blue sneakers'
      );
    });
  });

  describe('routed event as only event before stream closes with null hydration', () => {
    it('calls failTurn because no terminal event was received', async () => {
      vi.mocked(hydrateSubInterface).mockReturnValue(null);

      setupStreamWithEvents([
        {type: 'commerce-search-api-response', products: []},
      ]);

      const runtime = buildRuntime();
      await runtime.submit('hello');

      expect(statePort.failTurn).toHaveBeenCalledWith(
        'generated-turn-id',
        'Stream ended without a terminal event.'
      );
      expect(statePort.completeTurn).not.toHaveBeenCalled();
    });
  });

  describe('unrecognized event type falls through default', () => {
    it('does not call any state port mutation methods for unknown events', async () => {
      vi.mocked(hydrateSubInterface).mockReturnValue(null);

      setupStreamWithEvents([
        {type: 'some-unknown-event', data: 'whatever'},
        {type: 'RUN_FINISHED'},
      ]);

      const runtime = buildRuntime();
      await runtime.submit('test');

      expect(statePort.setRoutedInterface).not.toHaveBeenCalled();
      expect(statePort.initAgentResponse).not.toHaveBeenCalled();
      expect(statePort.startMessage).not.toHaveBeenCalled();
      expect(statePort.appendMessageDelta).not.toHaveBeenCalled();
      expect(statePort.appendSurface).not.toHaveBeenCalled();
      expect(statePort.failTurn).not.toHaveBeenCalled();
      expect(statePort.completeTurn).toHaveBeenCalledTimes(1);
    });
  });
});
