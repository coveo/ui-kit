import {buildContext} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeContext} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/context-controller';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import type {AtomicProductPrice} from './atomic-product-price';
import './atomic-product-price';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-product-price', () => {
  const mockedEngine = buildFakeCommerceEngine();
  const mockedContext = buildFakeContext({});
  const renderProductPrice = async (
    props: {ecPrice?: number; ecPromoPrice?: number} = {}
  ) => {
    const mockedProduct = buildFakeProduct({
      ec_price: props.ecPrice ?? 100,
      ec_promo_price: props.ecPromoPrice ?? null,
    });

    vi.mocked(buildContext).mockReturnValue(mockedContext);

    const {element} = await renderInAtomicProduct<AtomicProductPrice>({
      template: html`<atomic-product-price></atomic-product-price>`,
      selector: 'atomic-product-price',
      product: mockedProduct,
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        return bindings;
      },
    });

    return {
      element,
      firstPrice: element.querySelector('.truncate.break-keep'),
      originalPrice: element.querySelector('.original-price'),
    };
  };

  it('should call buildContext', async () => {
    const {element} = await renderProductPrice();
    expect(buildContext).toHaveBeenCalledWith(mockedEngine);
    expect(element.context).toBe(mockedContext);
  });

  it('should render the main price in a normal color when ec_promo_price is not set', async () => {
    const {firstPrice} = await renderProductPrice();
    expect(firstPrice).not.toHaveClass('text-error');
    expect(firstPrice).toHaveTextContent('100');
  });

  it('should render the main price in a normal color when ec_promo_price is set but equal or higher to ec_price', async () => {
    const {firstPrice} = await renderProductPrice({
      ecPrice: 100,
      ecPromoPrice: 100,
    });
    expect(firstPrice).not.toHaveClass('text-error');
    expect(firstPrice).toHaveTextContent('100');
  });

  it('should render the main price in red when ec_promo_price is lower than ec_price', async () => {
    const {firstPrice} = await renderProductPrice({
      ecPrice: 100,
      ecPromoPrice: 80,
    });
    expect(firstPrice).toHaveClass('text-error');
    expect(firstPrice).toHaveTextContent('80');
  });

  it('should render the original price in a line-through style when ec_promo_price is lower than ec_price', async () => {
    const {originalPrice} = await renderProductPrice({
      ecPrice: 100,
      ecPromoPrice: 80,
    });
    expect(originalPrice).toHaveClass('line-through');
    expect(originalPrice).toHaveTextContent('100');
  });

  it('should render the prices in the correct currency format', async () => {
    const {firstPrice, originalPrice} = await renderProductPrice({
      ecPrice: 100,
      ecPromoPrice: 80,
    });
    expect(firstPrice).toHaveTextContent('$80.00');
    expect(originalPrice).toHaveTextContent('$100.00');
  });
});
