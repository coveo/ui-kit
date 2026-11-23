import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  buildSearchBox,
  type SearchBox,
} from '../../../../controllers/commerce/search-box/headless-search-box.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockCommerceBuildContext} from '../../../../test/mock-ssr-build-context.js';
import type {SSRCommerceEngine} from '../../factories/build-factory.js';
import {SolutionType} from '../../types/controller-constants.js';
import {defineSearchBox, type SearchBoxDefinition} from './headless-search-box.ssr.js';

vi.mock('../../../../controllers/commerce/search-box/headless-search-box.js');

describe('define search box', () => {
  const searchContext = buildMockCommerceBuildContext({
    solutionType: SolutionType.search,
    enableResults: {listing: false, search: true},
  });
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildSearchBox).mockReturnValue({} as SearchBox);
    engine = buildMockSSRCommerceEngine(buildMockCommerceState());
  });

  it('should return a definition available on search pages only', () => {
    const definition = defineSearchBox();

    expect(definition).toMatchObject<SearchBoxDefinition>({
      build: expect.any(Function),
      search: true,
    });
    expect(definition).not.toHaveProperty('listing');
  });

  it('should build the search box with its static options and the search results flag of the definition', () => {
    defineSearchBox({options: {clearFilters: false}}).build(engine, searchContext);

    expect(buildSearchBox).toHaveBeenCalledWith(engine, {
      options: {clearFilters: false, enableResults: true},
    });
  });

  it('should build the search box with the results flag alone when the definer takes no options', () => {
    defineSearchBox().build(engine, searchContext);

    expect(buildSearchBox).toHaveBeenCalledWith(engine, {options: {enableResults: true}});
  });
});
