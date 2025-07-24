import {within} from 'shadow-dom-testing-library';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import './atomic-aria-live';
import type {AtomicAriaLive} from './atomic-aria-live';

describe('atomic-aria-live', () => {
  let element: AtomicAriaLive;
  beforeAll(async () => {
    element = document.createElement('atomic-aria-live');
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
