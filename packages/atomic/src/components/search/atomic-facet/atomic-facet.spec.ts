import {within} from 'shadow-dom-testing-library';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import './atomic-facet';
import type {AtomicFacet} from './atomic-facet';

describe('AtomicFacet', () => {
  let element: AtomicFacet;
  beforeAll(async () => {
    element = document.createElement('atomic-facet');
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
