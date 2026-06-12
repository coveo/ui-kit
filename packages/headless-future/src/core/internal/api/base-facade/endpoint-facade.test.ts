import {describe, expect, it, vi} from 'vitest';
import {EndpointFacade} from './endpoint-facade.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {RequestContributor} from './endpoint-facade-types.js';

interface TestRequest {
  q?: string;
  numberOfResults?: number;
  fieldsToInclude?: string[];
}

class TestEndpointFacade extends EndpointFacade<TestRequest> {
  constructor(engine: FullEngine) {
    super(engine);
  }

  public orderedContributors() {
    return this.getOrderedRequestContributors();
  }

  public registeredContributorCount() {
    return this.getRegisteredRequestContributorCount();
  }
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

describe('EndpointFacade', () => {
  const makeContributor = (
    contribute: () => Partial<TestRequest>
  ): RequestContributor<TestRequest> => contribute;

  it('registers contributors and returns them in registration order', () => {
    const facade = new TestEndpointFacade(createMockEngine());

    const resultListContributor = vi.fn(() => ({fieldsToInclude: ['title']}));
    const searchBoxContributor = vi.fn(() => ({q: 'laptops'}));

    facade.onRequest(makeContributor(resultListContributor));
    facade.onRequest(makeContributor(searchBoxContributor));

    expect(facade.orderedContributors()).toEqual([
      resultListContributor,
      searchBoxContributor,
    ]);
  });

  it('tracks registered contributor count', () => {
    const facade = new TestEndpointFacade(createMockEngine());

    facade.onRequest(makeContributor(() => ({numberOfResults: 25})));
    facade.onRequest(makeContributor(() => ({q: 'headless'})));

    expect(facade.registeredContributorCount()).toBe(2);
  });

  it('keeps multiple contributors when registered repeatedly', () => {
    const facade = new TestEndpointFacade(createMockEngine());
    const first = vi.fn(() => ({q: 'first'}));
    const second = vi.fn(() => ({q: 'second'}));

    facade.onRequest(makeContributor(first));
    facade.onRequest(makeContributor(second));

    expect(facade.orderedContributors()).toEqual([first, second]);
  });

  it('unsubscribe removes the contributor for its registration', () => {
    const facade = new TestEndpointFacade(createMockEngine());
    const unsubscribe = facade.onRequest(makeContributor(() => ({q: 'query'})));

    expect(facade.orderedContributors()).toHaveLength(1);

    unsubscribe();

    expect(facade.orderedContributors()).toEqual([]);
    expect(facade.registeredContributorCount()).toBe(0);
  });

  it('unsubscribe from older registration does not remove newer contributor', () => {
    const facade = new TestEndpointFacade(createMockEngine());
    const first = vi.fn(() => ({q: 'first'}));
    const second = vi.fn(() => ({q: 'second'}));

    const unsubscribeFirst = facade.onRequest(makeContributor(first));
    facade.onRequest(makeContributor(second));

    unsubscribeFirst();

    expect(facade.orderedContributors()).toEqual([second]);
  });
});
