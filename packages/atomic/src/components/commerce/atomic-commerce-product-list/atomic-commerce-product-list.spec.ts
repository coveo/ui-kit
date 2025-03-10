import {within} from 'shadow-dom-testing-library';
import {describe, test, expect, beforeAll, afterAll} from 'vitest';
import './atomic-commerce-product-list';
import {AtomicCommerceProductList} from './atomic-commerce-product-list';

describe('AtomicCommerceProductList', () => {
  let element: AtomicCommerceProductList;
  beforeAll(async () => {
    element = document.createElement('atomic-commerce-product-list');
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
