import {beforeEach, describe, expect, it, vi} from 'vitest';
import {buildQueryTrigger} from '../../../../controllers/commerce/triggers/headless-query-trigger.js';
import type {QueryTrigger} from '../../../../controllers/core/triggers/headless-core-query-trigger.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockCommerceBuildContext} from '../../../../test/mock-ssr-build-context.js';
import type {SSRCommerceEngine} from '../../factories/build-factory.js';
import {SolutionType} from '../../types/controller-constants.js';
import {defineQueryTrigger, type QueryTriggerDefinition} from './headless-query-trigger.ssr.js';

vi.mock('../../../../controllers/commerce/triggers/headless-query-trigger.js');

describe('define query trigger', () => {
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildQueryTrigger).mockReturnValue({} as QueryTrigger);
    engine = buildMockSSRCommerceEngine(buildMockCommerceState());
  });

  it('should return a definition available on search pages only', () => {
    const definition = defineQueryTrigger();

    expect(definition).toMatchObject<QueryTriggerDefinition>({
      build: expect.any(Function),
      search: true,
    });
    expect(definition).not.toHaveProperty('listing');
  });

  it('should build the trigger with the search results flag of the definition', () => {
    defineQueryTrigger().build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.search,
        enableResults: {listing: false, search: true},
      })
    );

    expect(buildQueryTrigger).toHaveBeenCalledWith(engine, {enableResults: true});
  });
});
