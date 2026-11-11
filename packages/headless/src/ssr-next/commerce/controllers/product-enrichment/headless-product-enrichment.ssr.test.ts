import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  buildProductEnrichment,
  type ProductEnrichment,
} from '../../../../controllers/commerce/product-enrichment/headless-product-enrichment.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockCommerceBuildContext} from '../../../../test/mock-ssr-build-context.js';
import type {SSRCommerceEngine} from '../../factories/build-factory.js';
import {SolutionType} from '../../types/controller-constants.js';
import {
  defineProductEnrichment,
  type ProductEnrichmentDefinition,
} from './headless-product-enrichment.ssr.js';

vi.mock('../../../../controllers/commerce/product-enrichment/headless-product-enrichment.js');
const buildProductEnrichmentMock = vi.mocked(buildProductEnrichment);

describe('define product enrichment', () => {
  const standaloneContext = buildMockCommerceBuildContext({
    solutionType: SolutionType.standalone,
  });
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    buildProductEnrichmentMock.mockReturnValue({} as ProductEnrichment);
    engine = buildMockSSRCommerceEngine(buildMockCommerceState());
  });

  afterEach(() => {
    buildProductEnrichmentMock.mockClear();
  });

  it('should return a definition available on standalone pages only', () => {
    const definition = defineProductEnrichment();

    expect(definition).toMatchObject<ProductEnrichmentDefinition>({
      build: expect.any(Function),
      standalone: true,
    });
    expect(definition).not.toHaveProperty('listing');
    expect(definition).not.toHaveProperty('search');
  });

  it('should build the controller with the static placements and the product ID of the request', () => {
    const definition = defineProductEnrichment({options: {placementIds: ['placement-a']}});

    definition.build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.standalone,
        buildConfig: {productId: 'product-123'},
      })
    );

    expect(buildProductEnrichmentMock).toHaveBeenCalledWith(engine, {
      options: {placementIds: ['placement-a'], productId: 'product-123'},
    });
  });

  it('should leave the product ID out when the request carries none', () => {
    const definition = defineProductEnrichment({options: {placementIds: ['placement-a']}});

    definition.build(engine, standaloneContext);

    expect(buildProductEnrichmentMock).toHaveBeenCalledWith(engine, {
      options: {placementIds: ['placement-a']},
    });
    expect(buildProductEnrichmentMock.mock.calls[0][1]?.options).not.toHaveProperty('productId');
  });

  it('should build the controller with no static options when the definer takes none', () => {
    defineProductEnrichment().build(engine, standaloneContext);

    expect(buildProductEnrichmentMock).toHaveBeenCalledWith(engine, {options: {}});
  });
});
