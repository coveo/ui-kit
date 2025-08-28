import {within} from 'shadow-dom-testing-library';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import './atomic-insight-layout';
import type {AtomicInsightLayout} from './atomic-insight-layout';

describe('AtomicInsightLayout', () => {
  let element: AtomicInsightLayout;
  beforeAll(async () => {
    element = document.createElement('atomic-insight-layout');
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
