import {within} from 'shadow-dom-testing-library';
import {describe, test, expect, beforeAll, afterAll} from 'vitest';
import './atomic-bla';
import {AtomicBla} from './atomic-bla';

describe('AtomicBla', () => {
  let element: AtomicBla;
  beforeAll(async () => {
    element = document.createElement('atomic-bla');
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
