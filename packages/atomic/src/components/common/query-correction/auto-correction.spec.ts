import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderAutoCorrection} from './auto-correction';

describe('#renderAutoCorrection', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderAutoCorrection({
        props: {
          i18n,
          originalQuery: 'original query',
          correctedTo: 'corrected query',
          ...overrides,
        },
      })}`
    );

    return {
      noResultsParagraph: element.querySelector('p[part="no-results"]'),
      autoCorrectedParagraph: element.querySelector('p[part="auto-corrected"]'),
      originalQueryHighlight: element.querySelector(
        'p[part="no-results"] b[part="highlight"]'
      ),
      correctedQueryHighlight: element.querySelector(
        'p[part="auto-corrected"] b[part="highlight"]'
      ),
    };
  };

  it('should render the part "no-results" on the first paragraph', async () => {
    const {noResultsParagraph} = await renderComponent();

    expect(noResultsParagraph).toHaveAttribute('part', 'no-results');
  });

  it('should render the correct text in the first paragraph', async () => {
    const {noResultsParagraph} = await renderComponent({
      originalQuery: 'my original query',
    });
    expect(noResultsParagraph).toHaveTextContent(
      "We couldn't find anything for my original query"
    );
  });

  it('should render the part "auto-corrected" on the second paragraph', async () => {
    const {autoCorrectedParagraph} = await renderComponent();

    expect(autoCorrectedParagraph).toHaveAttribute('part', 'auto-corrected');
  });

  it('should render the correct text in the second paragraph', async () => {
    const {autoCorrectedParagraph} = await renderComponent({
      correctedTo: 'my corrected query',
    });
    expect(autoCorrectedParagraph).toHaveTextContent(
      'Query was automatically corrected to my corrected query'
    );
  });

  it('should render the original query text with highlight part', async () => {
    const {originalQueryHighlight} = await renderComponent({
      originalQuery: 'my original query',
    });

    expect(originalQueryHighlight).toHaveAttribute('part', 'highlight');
    expect(originalQueryHighlight).toHaveTextContent('my original query');
  });

  it('should render the corrected query text with highlight part', async () => {
    const {correctedQueryHighlight} = await renderComponent({
      correctedTo: 'my corrected query',
    });

    expect(correctedQueryHighlight).toHaveAttribute('part', 'highlight');
    expect(correctedQueryHighlight).toHaveTextContent('my corrected query');
  });
});
