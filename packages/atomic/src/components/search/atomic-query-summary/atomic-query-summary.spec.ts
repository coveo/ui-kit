import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import './atomic-query-summary';
import type {AtomicQuerySummary} from './atomic-query-summary';

describe('AtomicQuerySummary', () => {
  let element: AtomicQuerySummary;
  beforeAll(async () => {
    element = document.createElement('atomic-query-summary');
    document.body.appendChild(element);
  });

  afterAll(() => {
    document.body.removeChild(element);
  });

  test('should render the component', async () => {
    expect(element.shadowRoot).toBeTruthy();
  });
});
