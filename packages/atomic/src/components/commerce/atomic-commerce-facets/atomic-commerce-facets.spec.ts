import {within} from 'shadow-dom-testing-library';
import {describe, test, expect, beforeAll, afterAll} from 'vitest';
import './atomic-commerce-facets';
import {AtomicCommerceFacets} from './atomic-commerce-facets';

describe('AtomicCommerceFacets', () => {
  let element: AtomicCommerceFacets;
  beforeAll(async () => {
    element = document.createElement('atomic-commerce-facets');
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
