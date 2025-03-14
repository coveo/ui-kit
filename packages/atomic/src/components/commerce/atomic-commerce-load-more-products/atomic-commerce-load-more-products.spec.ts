import {within} from 'shadow-dom-testing-library';
import {describe, test, expect, beforeAll, afterAll} from 'vitest';
import './atomic-commerce-load-more-products';
import {AtomicCommerceLoadMoreProducts} from './atomic-commerce-load-more-products.js';

describe('AtomicCommerceLoadMoreProducts', () => {
  let element: AtomicCommerceLoadMoreProducts;
  beforeAll(async () => {
    element = document.createElement('atomic-commerce-load-more-products');
    document.body.appendChild(element);
  });

  afterAll(() => {
    document.body.removeChild(element);
  });

  test('should render the component', async () => {
    expect(element.shadowRoot).toBeTruthy();
    const text = await within(element).findByShadowText('Hello World');
    expect(text).toBeTruthy();
  });
});
