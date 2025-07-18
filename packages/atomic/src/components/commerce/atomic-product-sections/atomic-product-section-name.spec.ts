import {describe, expect, it} from 'vitest';
import './atomic-product-section-name';
import {html} from 'lit';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicProductSectionName} from './atomic-product-section-name';

describe('AtomicProductSectionName', () => {
  let element: AtomicProductSectionName;

  const setupProductSectionName = async (content = 'Product Name') => {
    const element = await fixture<AtomicProductSectionName>(html`
      <atomic-product-section-name>
        ${content}
      </atomic-product-section-name>
    `);

    return element;
  };

  it('should render children in light DOM', async () => {
    element = await setupProductSectionName();

    expect(element.shadowRoot).toBeNull();
    expect(element.textContent?.trim()).toBe('Product Name');
  });

  it('should be visible when it contains content', async () => {
    element = await setupProductSectionName('Product Title');

    expect(element.style.display).not.toBe('none');
  });

  it('should be hidden when it contains no visual content', async () => {
    element = await setupProductSectionName('');

    // Allow time for the updated() lifecycle method to run
    await element.updateComplete;

    expect(element.style.display).toBe('none');
  });

  it('should be hidden when it contains only whitespace', async () => {
    element = await setupProductSectionName('   ');

    // Allow time for the updated() lifecycle method to run
    await element.updateComplete;

    expect(element.style.display).toBe('none');
  });
});
