import {describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {
  EndpointContributorRegistry,
  getEndpointContributorRegistry,
} from './endpoint-contributor-registry.js';

interface ConversationRequest {
  message?: string;
  language?: string;
}

const createMockEngine = (): FullEngine => {
  return {
    adoptSlice: vi.fn(async () => undefined),
    getNavigatorContextProvider: vi.fn(),
    mutate: vi.fn(),
    read: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  } as unknown as FullEngine;
};

describe('EndpointContributorRegistry', () => {
  it('returns contributors in registration order per endpoint', () => {
    const registry = new EndpointContributorRegistry();
    const first = vi.fn(() => ({message: 'first'}));
    const second = vi.fn(() => ({language: 'en'}));

    registry.register<ConversationRequest>('conversation', first);
    registry.register<ConversationRequest>('conversation', second);

    expect(registry.getOrderedContributors('conversation')).toEqual([
      first,
      second,
    ]);
  });

  it('keeps endpoint registrations isolated by endpoint key', () => {
    const registry = new EndpointContributorRegistry();
    const conversationContributor = vi.fn(() => ({message: 'hello'}));
    const searchContributor = vi.fn(() => ({language: 'fr'}));

    registry.register<ConversationRequest>(
      'conversation',
      conversationContributor
    );
    registry.register<ConversationRequest>(
      'commerce-search',
      searchContributor
    );

    expect(registry.getOrderedContributors('conversation')).toEqual([
      conversationContributor,
    ]);
    expect(registry.getOrderedContributors('commerce-search')).toEqual([
      searchContributor,
    ]);
  });

  it('unregister removes only the corresponding registration', () => {
    const registry = new EndpointContributorRegistry();
    const first = vi.fn(() => ({message: 'first'}));
    const second = vi.fn(() => ({message: 'second'}));

    const unregisterFirst = registry.register<ConversationRequest>(
      'conversation',
      first
    );
    registry.register<ConversationRequest>('conversation', second);

    unregisterFirst();

    expect(registry.getOrderedContributors('conversation')).toEqual([second]);
  });

  it('tracks registered contributor counts per endpoint', () => {
    const registry = new EndpointContributorRegistry();

    registry.register<ConversationRequest>('conversation', () => ({}));
    registry.register<ConversationRequest>('conversation', () => ({}));

    expect(registry.getRegisteredContributorCount('conversation')).toBe(2);
    expect(registry.getRegisteredContributorCount('commerce-listing')).toBe(0);
  });
});

describe('getEndpointContributorRegistry', () => {
  it('returns the same registry for the same engine', () => {
    const engine = createMockEngine();

    const first = getEndpointContributorRegistry(engine);
    const second = getEndpointContributorRegistry(engine);

    expect(first).toBe(second);
  });

  it('returns different registries for different engines', () => {
    const firstEngine = createMockEngine();
    const secondEngine = createMockEngine();

    const firstRegistry = getEndpointContributorRegistry(firstEngine);
    const secondRegistry = getEndpointContributorRegistry(secondEngine);

    expect(firstRegistry).not.toBe(secondRegistry);
  });
});
