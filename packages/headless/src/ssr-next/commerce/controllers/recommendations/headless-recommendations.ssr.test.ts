import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  buildRecommendations,
  type Recommendations,
} from '../../../../controllers/commerce/recommendations/headless-recommendations.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockCommerceBuildContext} from '../../../../test/mock-ssr-build-context.js';
import type {SSRCommerceEngine} from '../../factories/build-factory.js';
import {recommendationInternalOptionKey, SolutionType} from '../../types/controller-constants.js';
import {defineRecommendations} from './headless-recommendations.ssr.js';

vi.mock('../../../../controllers/commerce/recommendations/headless-recommendations.js');
const buildRecommendationsMock = vi.mocked(buildRecommendations);

describe('define recommendations', () => {
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    buildRecommendationsMock.mockReturnValue({} as Recommendations);
    engine = buildMockSSRCommerceEngine(buildMockCommerceState());
  });

  afterEach(() => {
    buildRecommendationsMock.mockClear();
  });

  it('should return a definition available on every kind of page that carries its slot', () => {
    const definition = defineRecommendations({options: {slotId: 'slot-1'}});

    expect(definition).toMatchObject({
      build: expect.any(Function),
      listing: true,
      search: true,
      standalone: true,
      [recommendationInternalOptionKey]: {slotId: 'slot-1'},
    });
  });

  it('should build the controller with the static options and the product ID of the request', () => {
    const definition = defineRecommendations({options: {slotId: 'slot-1'}});

    definition.build(
      engine,
      buildMockCommerceBuildContext({buildConfig: {productId: 'product-123'}})
    );

    expect(buildRecommendationsMock).toHaveBeenCalledWith(engine, {
      options: {slotId: 'slot-1', productId: 'product-123'},
    });
  });

  it('should leave the product ID out when the request carries none', () => {
    const definition = defineRecommendations({options: {slotId: 'slot-1'}});

    definition.build(engine, buildMockCommerceBuildContext({solutionType: SolutionType.search}));

    expect(buildRecommendationsMock).toHaveBeenCalledWith(engine, {options: {slotId: 'slot-1'}});
    expect(buildRecommendationsMock.mock.calls[0][1]?.options).not.toHaveProperty('productId');
  });
});
