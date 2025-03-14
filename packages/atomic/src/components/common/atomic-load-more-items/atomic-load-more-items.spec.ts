import {within} from 'shadow-dom-testing-library';
import {describe, test, expect, beforeAll, afterAll} from 'vitest';
import './atomic-load-more-items';
import {AtomicLoadMoreItems} from './atomic-load-more-items';

describe('AtomicLoadMoreItems', () => {
  let element: AtomicLoadMoreItems;
  beforeAll(async () => {
    element = document.createElement('atomic-load-more-items');
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
