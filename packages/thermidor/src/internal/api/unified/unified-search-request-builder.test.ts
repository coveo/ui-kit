import {describe, it, expect, vi} from 'vitest';
import {createUnifiedSearchRequestBuilder} from './unified-search-request-builder.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle, ActionIntent} from '@/src/internal/utils/index.js';

vi.mock('@/src/internal/features/configuration/index.js', () => ({
  getOrCreateConfigurationSelectors: () => ({
    getTrackingId: (state: any) => state.__trackingId ?? 'track-1',
    getLanguage: (state: any) => state.__language ?? 'en',
    getCountry: (state: any) => state.__country ?? 'US',
    getCurrency: (state: any) => state.__currency ?? 'USD',
  }),
}));

vi.mock('@/src/internal/features/generative/index.js', () => ({
  getOrCreateGenerativeSelectors: () => ({
    getConversationSessionId: (state: any) => state.__conversationSessionId ?? 'session-abc',
    getConversationToken: (state: any) => state.__conversationToken ?? 'token-xyz',
  }),
}));

vi.mock('@/src/internal/features/cart/index.js', () => ({
  getOrCreateCartSelectors: () => ({
    getCartContext: (state: any) =>
      state.__cart ?? [{productId: 'p1', name: 'Product 1', price: 10, quantity: 1}],
  }),
}));

vi.mock('@/src/internal/utils/index.js', () => ({
  generateId: () => 'generated-id',
}));

function createMockEngine(state: Record<string, any> = {}): FullEngine {
  return {
    read: (selector: any) => selector(state),
    mutate: vi.fn(),
    adoptSlice: vi.fn(),
    getNavigatorContextProvider: () => () => ({
      clientId: 'client-abc',
      location: 'https://example.com',
      referrer: 'https://google.com',
      userAgent: 'test-agent',
    }),
  } as unknown as FullEngine;
}

function createInterfaceHandle(): InterfaceHandle {
  return {disposed: false, dispose: vi.fn()};
}

describe('createUnifiedSearchRequestBuilder', () => {
  const generativeInterface = createInterfaceHandle();
  const cartInterface = createInterfaceHandle();

  it('builds action from actionIntent with surfaceId and thermidor sourceComponentId', () => {
    const buildRequest = createUnifiedSearchRequestBuilder(
      generativeInterface,
      cartInterface,
      'my-surface'
    );
    const engine = createMockEngine();
    const actionIntent: ActionIntent = {name: 'select_page', context: {page: 2}};

    const request = buildRequest(engine, actionIntent);

    expect(request.agentInput.action).toMatchObject({
      surfaceId: 'my-surface',
      name: 'select_page',
      sourceComponentId: 'thermidor',
      actionId: null,
      wantResponse: false,
      context: {page: 2},
    });
  });

  it('sets message to null and messages to empty array', () => {
    const buildRequest = createUnifiedSearchRequestBuilder(
      generativeInterface,
      cartInterface,
      'surface-1'
    );
    const engine = createMockEngine();
    const actionIntent: ActionIntent = {name: 'execute_search', context: {query: 'shoes'}};

    const request = buildRequest(engine, actionIntent);

    expect(request.messages).toEqual([]);
    expect(request.agentInput.message).toBeNull();
  });

  it('includes conversationSessionId and conversationToken from generative state', () => {
    const buildRequest = createUnifiedSearchRequestBuilder(
      generativeInterface,
      cartInterface,
      'surface-1'
    );
    const engine = createMockEngine();
    const actionIntent: ActionIntent = {name: 'select_page', context: {page: 1}};

    const request = buildRequest(engine, actionIntent);

    expect(request.agentInput.conversationSessionId).toBe('session-abc');
    expect(request.agentInput.conversationToken).toBe('token-xyz');
  });

  it('includes trackingId, language, country, currency from configuration', () => {
    const buildRequest = createUnifiedSearchRequestBuilder(
      generativeInterface,
      cartInterface,
      'surface-1'
    );
    const engine = createMockEngine();
    const actionIntent: ActionIntent = {name: 'select_page', context: {page: 1}};

    const request = buildRequest(engine, actionIntent);

    expect(request.agentInput.trackingId).toBe('track-1');
    expect(request.agentInput.language).toBe('en');
    expect(request.agentInput.country).toBe('US');
    expect(request.agentInput.currency).toBe('USD');
  });

  it('includes navigator context', () => {
    const buildRequest = createUnifiedSearchRequestBuilder(
      generativeInterface,
      cartInterface,
      'surface-1'
    );
    const engine = createMockEngine();
    const actionIntent: ActionIntent = {name: 'select_page', context: {page: 1}};

    const request = buildRequest(engine, actionIntent);

    expect(request.agentInput.clientId).toBe('client-abc');
    expect(request.agentInput.context.view.url).toBe('https://example.com');
    expect(request.agentInput.context.view.referrer).toBe('https://google.com');
    expect(request.agentInput.context.user).toEqual({userAgent: 'test-agent'});
  });

  it('includes cart items from cart state', () => {
    const buildRequest = createUnifiedSearchRequestBuilder(
      generativeInterface,
      cartInterface,
      'surface-1'
    );
    const engine = createMockEngine();
    const actionIntent: ActionIntent = {name: 'select_page', context: {page: 1}};

    const request = buildRequest(engine, actionIntent);

    expect(request.agentInput.context.cart).toEqual([
      {productId: 'p1', name: 'Product 1', price: 10, quantity: 1},
    ]);
  });

  it('uses conversationSessionId as threadId when available', () => {
    const buildRequest = createUnifiedSearchRequestBuilder(
      generativeInterface,
      cartInterface,
      'surface-1'
    );
    const engine = createMockEngine();
    const actionIntent: ActionIntent = {name: 'select_page', context: {page: 1}};

    const request = buildRequest(engine, actionIntent);

    expect(request.session.threadId).toBe('session-abc');
  });

  it('generates threadId when conversationSessionId is empty', () => {
    const buildRequest = createUnifiedSearchRequestBuilder(
      generativeInterface,
      cartInterface,
      'surface-1'
    );
    const engine = createMockEngine({__conversationSessionId: ''});
    const actionIntent: ActionIntent = {name: 'select_page', context: {page: 1}};

    const request = buildRequest(engine, actionIntent);

    expect(request.session.threadId).toBe('generated-id');
  });

  it('handles missing navigator context gracefully', () => {
    const buildRequest = createUnifiedSearchRequestBuilder(
      generativeInterface,
      cartInterface,
      'surface-1'
    );
    const engine = {
      read: (selector: any) => selector({}),
      mutate: vi.fn(),
      adoptSlice: vi.fn(),
      getNavigatorContextProvider: () => undefined,
    } as unknown as FullEngine;
    const actionIntent: ActionIntent = {name: 'select_page', context: {page: 1}};

    const request = buildRequest(engine, actionIntent);

    expect(request.agentInput.clientId).toBeUndefined();
    expect(request.agentInput.context.view.url).toBeNull();
    expect(request.agentInput.context.view.referrer).toBeNull();
    expect(request.agentInput.context.user).toEqual({userAgent: null});
  });
});
