import {within} from 'shadow-dom-testing-library';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import './atomic-insight-tab';
import type {AtomicInsightTab} from './atomic-insight-tab';

describe('AtomicInsightTab', () => {
  let element: AtomicInsightTab;
  beforeAll(async () => {
    element = document.createElement('atomic-insight-tab');
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
