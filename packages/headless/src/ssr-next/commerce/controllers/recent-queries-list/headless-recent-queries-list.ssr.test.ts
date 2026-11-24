import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  buildRecentQueriesList,
  type RecentQueriesList,
} from '../../../../controllers/commerce/recent-queries-list/headless-recent-queries-list.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockCommerceBuildContext} from '../../../../test/mock-ssr-build-context.js';
import type {SSRCommerceEngine} from '../../factories/build-factory.js';
import {SolutionType} from '../../types/controller-constants.js';
import {
  defineRecentQueriesList,
  type RecentQueriesListDefinition,
} from './headless-recent-queries-list.ssr.js';

vi.mock('../../../../controllers/commerce/recent-queries-list/headless-recent-queries-list.js');

describe('define recent queries list', () => {
  const context = buildMockCommerceBuildContext({
    solutionType: SolutionType.standalone,
    enableResults: {listing: false, search: true},
  });
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildRecentQueriesList).mockReturnValue({} as RecentQueriesList);
    engine = buildMockSSRCommerceEngine(buildMockCommerceState());
  });

  it('should return a definition available on every kind of page', () => {
    expect(defineRecentQueriesList()).toMatchObject<RecentQueriesListDefinition>({
      build: expect.any(Function),
      listing: true,
      search: true,
      standalone: true,
    });
  });

  it('should build the list with its static props and the search results flag of the definition', () => {
    defineRecentQueriesList({initialState: {queries: ['shoes']}}).build(engine, context);

    expect(buildRecentQueriesList).toHaveBeenCalledWith(engine, {
      initialState: {queries: ['shoes']},
      options: {enableResults: true},
    });
  });

  it('should build the list with the results flag alone when the definer takes no props', () => {
    defineRecentQueriesList().build(engine, context);

    expect(buildRecentQueriesList).toHaveBeenCalledWith(engine, {
      options: {enableResults: true},
    });
  });
});
