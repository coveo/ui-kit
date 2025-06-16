import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {html} from 'lit';
import {describe, test, expect, beforeEach} from 'vitest';
import './atomic-commerce-query-error';
import {AtomicCommerceQueryError} from './atomic-commerce-query-error';

describe('AtomicCommerceQueryError', () => {
  let element: AtomicCommerceQueryError;

  beforeEach(async () => {
    const result = await renderInAtomicCommerceInterface({
      template: html`<atomic-commerce-query-error></atomic-commerce-query-error>`,
    });
    element = result.element as AtomicCommerceQueryError;
  });

  test('should render the component', () => {
    expect(element).toBeTruthy();
    expect(element.tagName.toLowerCase()).toBe('atomic-commerce-query-error');
  });

  test('should not render anything when there is no error', async () => {
    await element.updateComplete;
    expect(element.shadowRoot?.textContent?.trim()).toBe('');
  });

  test('should have proper initialization', async () => {
    expect(element.initialize).toBeDefined();
    expect(typeof element.initialize).toBe('function');
  });
});
