import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {buildCart, type Cart} from '../../../../controllers/commerce/context/cart/headless-cart.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockNavigatorContext} from '../../../../test/mock-navigator-context.js';
import type {SSRCommerceEngine} from '../../factories/build-factory.js';
import type {CommonBuildConfig} from '../../types/build.js';
import {SolutionType} from '../../types/controller-constants.js';
import {type CartDefinition, defineCart} from './headless-cart.ssr.js';

vi.mock('../../../../controllers/commerce/context/cart/headless-cart.js');
const buildCartMock = vi.mocked(buildCart);

describe('define cart', () => {
  const pageFacts: CommonBuildConfig = {
    navigatorContext: buildMockNavigatorContext(),
    context: {language: 'en', country: 'US', currency: 'USD', view: {url: 'https://example.com'}},
  };
  const item = {name: 'Product 1', price: 100, productId: '1', quantity: 1};
  let cartDefinition: CartDefinition;
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    buildCartMock.mockReturnValue({} as Cart);
    cartDefinition = defineCart();
    engine = buildMockSSRCommerceEngine(buildMockCommerceState());
  });

  afterEach(() => {
    buildCartMock.mockClear();
  });

  it('should return a definition available on every kind of page', () => {
    expect(cartDefinition).toMatchObject<CartDefinition>({
      build: expect.any(Function),
      listing: true,
      search: true,
      standalone: true,
    });
  });

  it('should build the cart with the items passed to fetchStaticState()', () => {
    cartDefinition.build(engine, {
      solutionType: SolutionType.listing,
      buildConfig: {...pageFacts, cart: {items: [item]}},
    });

    expect(buildCartMock).toHaveBeenCalledWith(engine, {initialState: {items: [item]}});
  });

  it('should build an empty cart when the request carries none', () => {
    cartDefinition.build(engine, {solutionType: SolutionType.search, buildConfig: pageFacts});

    expect(buildCartMock).toHaveBeenCalledWith(engine, {initialState: {}});
  });
});
