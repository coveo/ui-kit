import {within} from 'shadow-dom-testing-library';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import './atomic-insight-query-summary';
import type {AtomicInsightQuerySummary} from './atomic-insight-query-summary';

describe('AtomicInsightQuerySummary', () => {
  let element: AtomicInsightQuerySummary;
  beforeAll(async () => {
    element = document.createElement('atomic-insight-query-summary');
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
