import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  getProductQuerySummaryI18nParameters,
  getQuerySummaryI18nParameters,
} from './utils';

describe('#getQuerySummaryI18nParameters', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const setup = async (overrides = {}) => {
    const parameters = getQuerySummaryI18nParameters({
      first: 1,
      last: 10,
      total: 50,
      query: 'query',
      isLoading: false,
      i18n,
      ...overrides,
    });

    const template = html`
      ${parameters.highlights.first} ${parameters.highlights.last}
      ${parameters.highlights.total} ${parameters.highlights.query}
    `;

    const element = await renderFunctionFixture(template);

    return {
      parameters,
      highlights: element.querySelectorAll('[part~="highlight"]'),
    };
  };

  it('should return the correct i18n key when the query is empty', async () => {
    const {parameters} = await setup({query: ''});

    expect(parameters.i18nKey).toBe('showing-results-of');
  });

  it('should return the correct i18n key when the query is not empty', async () => {
    const {parameters} = await setup({query: 'query'});

    expect(parameters.i18nKey).toBe('showing-results-of-with-query');
  });

  it('should return the correct aria live message when isLoading is true', async () => {
    const {parameters} = await setup({isLoading: true});

    expect(parameters.ariaLiveMessage).toBe('Loading new results');
  });

  it('should return the correct aria live message when isLoading is false', async () => {
    const {parameters} = await setup({isLoading: false});

    expect(parameters.ariaLiveMessage).toBe(
      'Results loaded. Results 1-10 of 50 for query'
    );
  });

  it('should render the highlights with correct values', async () => {
    const {highlights} = await setup();

    expect(highlights[0]).toHaveTextContent('1');
    expect(highlights[1]).toHaveTextContent('10');
    expect(highlights[2]).toHaveTextContent('50');
    expect(highlights[3]).toHaveTextContent('query');
  });

  it('should render highlights with correct parts', async () => {
    const {highlights} = await setup();

    expect(highlights[0]).toHaveAttribute('part', 'highlight');
    expect(highlights[1]).toHaveAttribute('part', 'highlight');
    expect(highlights[2]).toHaveAttribute('part', 'highlight');
    expect(highlights[3]).toHaveAttribute('part', 'highlight query');
  });

  it('should render highlights as bold text', async () => {
    const {highlights} = await setup();

    expect(highlights[0]).toHaveStyle({fontWeight: 'bold'});
    expect(highlights[1]).toHaveStyle({fontWeight: 'bold'});
    expect(highlights[2]).toHaveStyle({fontWeight: 'bold'});
    expect(highlights[3]).toHaveStyle({fontWeight: 'bold'});
  });
});

describe('#getProductQuerySummaryI18nParameters', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const setup = async (overrides = {}) => {
    const parameters = getProductQuerySummaryI18nParameters({
      first: 1,
      last: 10,
      total: 50,
      query: 'query',
      isLoading: false,
      i18n,
      ...overrides,
    });

    const template = html`
      ${parameters.highlights.first} ${parameters.highlights.last}
      ${parameters.highlights.total} ${parameters.highlights.query}
    `;

    const element = await renderFunctionFixture(template);

    return {
      parameters,
      highlights: element.querySelectorAll('[part~="highlight"]'),
    };
  };

  it('should return the correct i18n key when the query is empty', async () => {
    const {parameters} = await setup({query: ''});

    expect(parameters.i18nKey).toBe('showing-products-of');
  });

  it('should return the correct i18n key when the query is not empty', async () => {
    const {parameters} = await setup({query: 'query'});

    expect(parameters.i18nKey).toBe('showing-products-of-with-query');
  });

  it('should return the correct aria live message when isLoading is true', async () => {
    const {parameters} = await setup({isLoading: true});

    expect(parameters.ariaLiveMessage).toBe('Loading new products');
  });

  it('should return the correct aria live message when isLoading is false', async () => {
    const {parameters} = await setup({isLoading: false});

    expect(parameters.ariaLiveMessage).toBe(
      'Results loaded. Products 1-10 of 50 for query'
    );
  });

  it('should render the highlights with correct values', async () => {
    const {highlights} = await setup();

    expect(highlights[0]).toHaveTextContent('1');
    expect(highlights[1]).toHaveTextContent('10');
    expect(highlights[2]).toHaveTextContent('50');
    expect(highlights[3]).toHaveTextContent('query');
  });

  it('should render highlights with correct parts', async () => {
    const {highlights} = await setup();

    expect(highlights[0]).toHaveAttribute('part', 'highlight');
    expect(highlights[1]).toHaveAttribute('part', 'highlight');
    expect(highlights[2]).toHaveAttribute('part', 'highlight');
    expect(highlights[3]).toHaveAttribute('part', 'highlight query');
  });
});
