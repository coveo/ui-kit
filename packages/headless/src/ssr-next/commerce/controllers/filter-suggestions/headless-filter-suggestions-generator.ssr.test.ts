import {beforeEach, describe, expect, it, vi} from 'vitest';
import {buildFilterSuggestionsGenerator} from '../../../../controllers/commerce/filter-suggestions/headless-filter-suggestions-generator.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockCommerceBuildContext} from '../../../../test/mock-ssr-build-context.js';
import type {SSRCommerceEngine} from '../../factories/build-factory.js';
import {SolutionType} from '../../types/controller-constants.js';
import {
  defineFilterSuggestionsGenerator,
  type FilterSuggestionsGeneratorDefinition,
} from './headless-filter-suggestions-generator.ssr.js';

vi.mock(
  '../../../../controllers/commerce/filter-suggestions/headless-filter-suggestions-generator.js'
);

describe('define filter suggestions generator', () => {
  let definition: FilterSuggestionsGeneratorDefinition;
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    definition = defineFilterSuggestionsGenerator();
    engine = buildMockSSRCommerceEngine(buildMockCommerceState());
  });

  it('should return a definition available on every kind of page', () => {
    expect(definition).toMatchObject<FilterSuggestionsGeneratorDefinition>({
      build: expect.any(Function),
      listing: true,
      search: true,
      standalone: true,
    });
  });

  it.each([
    {solutionType: SolutionType.listing, enableResults: {listing: false, search: true}},
    {solutionType: SolutionType.standalone, enableResults: {listing: false, search: true}},
  ])(
    'should give the generator the search results flag on a $solutionType page, since a selected suggestion runs a search',
    ({solutionType, enableResults}) => {
      definition.build(engine, buildMockCommerceBuildContext({solutionType, enableResults}));

      expect(buildFilterSuggestionsGenerator).toHaveBeenCalledWith(engine, {enableResults: true});
    }
  );

  it('should leave the flag off when the definition enables results on listing pages only', () => {
    definition.build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.listing,
        enableResults: {listing: true, search: false},
      })
    );

    expect(buildFilterSuggestionsGenerator).toHaveBeenCalledWith(engine, {enableResults: false});
  });
});
