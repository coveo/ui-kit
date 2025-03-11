import {within} from 'shadow-dom-testing-library';
import {describe, test, expect, beforeAll, afterAll} from 'vitest';
import './atomic-commerce-sort-dropdown';
import {AtomicCommerceSortDropdown} from './atomic-commerce-sort-dropdown';

describe('AtomicCommerceSortDropdown', () => {
  let element: AtomicCommerceSortDropdown;
  beforeAll(async () => {
    element = document.createElement('atomic-commerce-sort-dropdown');
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
