import {within} from 'shadow-dom-testing-library';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import './atomic-insight-no-results';
import type {AtomicInsightNoResults} from './atomic-insight-no-results';

describe('AtomicInsightNoResults', () => {
  let element: AtomicInsightNoResults;
  beforeAll(async () => {
    element = document.createElement('atomic-insight-no-results');
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
