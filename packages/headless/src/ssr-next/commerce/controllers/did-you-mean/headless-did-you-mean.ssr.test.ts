import {beforeEach, describe, expect, it, vi} from 'vitest';
import {buildSearch, type Search} from '../../../../controllers/commerce/search/headless-search.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockCommerceBuildContext} from '../../../../test/mock-ssr-build-context.js';
import type {SSRCommerceEngine} from '../../factories/build-factory.js';
import {SolutionType} from '../../types/controller-constants.js';
import {defineDidYouMean, type DidYouMeanDefinition} from './headless-did-you-mean.ssr.js';

vi.mock('../../../../controllers/commerce/search/headless-search.js');

describe('define did you mean', () => {
  const didYouMean = vi.fn();
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildSearch).mockReturnValue({didYouMean} as unknown as Search);
    engine = buildMockSSRCommerceEngine(buildMockCommerceState());
  });

  it('should return a definition available on search pages only', () => {
    const definition = defineDidYouMean();

    expect(definition).toMatchObject<DidYouMeanDefinition>({
      build: expect.any(Function),
      search: true,
    });
    expect(definition).not.toHaveProperty('listing');
  });

  it('should build the controller from a search controller carrying the search results flag of the definition', () => {
    defineDidYouMean().build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.search,
        enableResults: {listing: false, search: true},
      })
    );

    expect(buildSearch).toHaveBeenCalledWith(engine, {enableResults: true});
    expect(didYouMean).toHaveBeenCalledOnce();
  });
});
