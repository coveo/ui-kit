import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderLoadMoreSummary} from './summary';

describe('#renderLoadMoreSummary', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderLoadMoreSummary({
        props: {
          i18n,
          from: 1,
          to: 10,
          ...overrides,
        },
      })}`
    );

    return {
      container: element.querySelector('div[part="showing-results"]'),
      highlightElements: element.querySelectorAll('span[part="highlight"]'),
    };
  };

  it('should render the part "showing-results" on the container div', async () => {
    const {container} = await renderComponent();

    expect(container).toHaveAttribute('part', 'showing-results');
  });

  it('should render 2 highlight spans with part="highlight"', async () => {
    const {highlightElements} = await renderComponent();

    expect(highlightElements).toHaveLength(2);
    highlightElements.forEach((element) => {
      expect(element).toHaveAttribute('part', 'highlight');
    });
  });

  it('should format numbers according to locale', async () => {
    const {highlightElements} = await renderComponent({
      from: 1000,
      to: 5000,
    });

    // Assuming English locale, numbers should be formatted with commas
    expect(highlightElements[0]).toHaveTextContent('1,000');
    expect(highlightElements[1]).toHaveTextContent('5,000');
  });

  it('should use default label when none is provided', async () => {
    const {container} = await renderComponent();

    // The content should contain the translated text for the default label
    expect(container).toBeDefined();
    expect(container?.textContent).toContain('Showing');
    expect(container?.textContent).toContain('of');
    expect(container?.textContent).toContain('results');
  });

  it('should use custom label when provided', async () => {
    const {container} = await renderComponent({
      label: 'showing-products-of-load-more',
    });

    // The content should contain the translated text for the custom label
    expect(container).toBeDefined();
    expect(container?.textContent).toContain('Showing');
    expect(container?.textContent).toContain('of');
    expect(container?.textContent).toContain('products');
  });
});
