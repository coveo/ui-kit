import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import type {AtomicSearchBoxQuerySuggestions} from './atomic-search-box-query-suggestions';
import './atomic-search-box-query-suggestions';

describe('atomic-search-box-query-suggestions', () => {
  const renderSearchBoxQuerySuggestions = async (
    props: {maxWithQuery?: number; maxWithoutQuery?: number; icon?: string} = {}
  ) => {
    const template = html`
      <atomic-search-box-query-suggestions
        .maxWithQuery="${props.maxWithQuery ?? 3}"
        .maxWithoutQuery="${props.maxWithoutQuery}"
        .icon="${props.icon ?? ''}"
      >
      </atomic-search-box-query-suggestions>
    `;

    const {element} =
      await renderInAtomicSearchInterface<AtomicSearchBoxQuerySuggestions>({
        template,
        selector: 'atomic-search-box-query-suggestions',
      });

    await element.updateComplete;

    return {element};
  };

  it('should render with default properties', async () => {
    const {element} = await renderSearchBoxQuerySuggestions();

    expect(element).toBeDefined();
    expect(element.maxWithQuery).toBe(3);
    expect(element.maxWithoutQuery).toBeUndefined();
    expect(element.icon).toBe('');
  });

  it('should render with custom properties', async () => {
    const {element} = await renderSearchBoxQuerySuggestions({
      maxWithQuery: 5,
      maxWithoutQuery: 2,
      icon: 'custom-icon.svg',
    });

    expect(element.maxWithQuery).toBe(5);
    expect(element.maxWithoutQuery).toBe(2);
    expect(element.icon).toBe('custom-icon.svg');
  });

  it('should reflect properties to attributes', async () => {
    const {element} = await renderSearchBoxQuerySuggestions({
      maxWithQuery: 8,
      maxWithoutQuery: 3,
    });

    expect(element.getAttribute('max-with-query')).toBe('8');
    expect(element.getAttribute('max-without-query')).toBe('3');
  });

  it('should handle undefined maxWithoutQuery properly', async () => {
    const {element} = await renderSearchBoxQuerySuggestions({
      maxWithQuery: 5,
    });

    expect(element.maxWithQuery).toBe(5);
    expect(element.maxWithoutQuery).toBeUndefined();
    expect(element.getAttribute('max-without-query')).toBe(null);
  });

  it('should render nothing (hidden component)', async () => {
    const {element} = await renderSearchBoxQuerySuggestions();

    // This component shows an error when not inside a search box, but that's expected
    expect(element.shadowRoot?.innerHTML).toContain('<!---->');
  });

  it('should be properly defined as a custom element', () => {
    expect(
      customElements.get('atomic-search-box-query-suggestions')
    ).toBeDefined();
  });
});
