import {within} from 'shadow-dom-testing-library';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import './atomic-insight-refine-modal';
import type {AtomicInsightRefineModal} from './atomic-insight-refine-modal';

describe('AtomicInsightRefineModal', () => {
  let element: AtomicInsightRefineModal;
  beforeAll(async () => {
    element = document.createElement('atomic-insight-refine-modal');
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
