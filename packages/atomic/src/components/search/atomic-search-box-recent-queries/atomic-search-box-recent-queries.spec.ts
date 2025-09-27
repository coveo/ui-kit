import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicSearchBoxRecentQueries} from './atomic-search-box-recent-queries';
import './atomic-search-box-recent-queries';

describe('atomic-search-box-recent-queries', () => {
  it('should be properly defined as a custom element', () => {
    expect(
      customElements.get('atomic-search-box-recent-queries')
    ).toBeDefined();
  });

  it('should render with default properties', async () => {
    const element = await fixture<AtomicSearchBoxRecentQueries>(
      html`<atomic-search-box-recent-queries></atomic-search-box-recent-queries>`
    );

    expect(element.maxWithQuery).toBe(3);
    expect(element.maxWithoutQuery).toBeUndefined();
    expect(element.icon).toBeUndefined();
  });
});
