import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderNoItems} from './no-items';

describe('#renderNoItems', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderNoItems({
        props: {
          i18n,
          query: 'test query',
          i18nKey: 'no-results',
          ...overrides,
        },
      })}`
    );

    return {
      noResultsDiv: element.querySelector('div[part="no-results"]'),
      highlightSpan: element.querySelector('span[part="highlight"]'),
    };
  };

  it('should render the part "no-results" on the div', async () => {
    const {noResultsDiv} = await renderComponent();

    expect(noResultsDiv).toHaveAttribute('part', 'no-results');
  });

  it('should render highlight span when query is provided', async () => {
    const {highlightSpan} = await renderComponent({
      query: 'test query',
    });

    expect(highlightSpan).toHaveAttribute('part', 'highlight');
  });

  it('should render simple i18n text when no query is provided', async () => {
    const {noResultsDiv, highlightSpan} = await renderComponent({
      query: '',
    });

    expect(noResultsDiv).toHaveTextContent('No results');
    expect(highlightSpan).toBeNull();
  });

  it('should handle different i18nKey values', async () => {
    const {noResultsDiv} = await renderComponent({
      query: '',
      i18nKey: 'no-products',
    });

    expect(noResultsDiv).toHaveTextContent('No products');
  });

  it('should handle empty query string correctly', async () => {
    const {highlightSpan} = await renderComponent({
      query: '',
    });

    expect(highlightSpan).toBeNull();
  });
});
