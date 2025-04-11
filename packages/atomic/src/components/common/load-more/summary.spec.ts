import {getInnerHTMLWithoutComments} from '@/test-utils/html';
import {getI18nTestInstance} from '@/test-utils/mocks/i18n';
import type {i18n as I18n} from 'i18next';
import {html, render} from 'lit';
import {loadMoreSummary} from './summary';

describe('loadMoreSummary', () => {
  let i18n: I18n;
  let container: HTMLElement;

  beforeAll(async () => {
    i18n = await getI18nTestInstance();
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const renderLoadMoreSummary = (
    props: Parameters<typeof loadMoreSummary>[0]
  ) => {
    render(html`${loadMoreSummary(props)}`, container);
  };

  it('should render the correct HTML structure', () => {
    renderLoadMoreSummary({
      i18n,
      from: 1,
      to: 10,
      label: 'showing-results-of-load-more',
    });

    expect(getInnerHTMLWithoutComments(container)).toMatchSnapshot();
  });

  it('should localize the content correctly', () => {
    renderLoadMoreSummary({
      i18n,
      from: 1,
      to: 10,
      label: 'showing-results-of-load-more',
    });
    expect(container).toHaveTextContent('Showing 1 of 10 results');
  });

  it('should bolden the numbers', () => {
    renderLoadMoreSummary({
      i18n,
      from: 1,
      to: 10,
      label: 'showing-results-of-load-more',
    });
    const highlights = container.querySelectorAll('[part="highlight"]');

    expect(highlights).toHaveLength(2);
    expect(highlights[0]).toHaveTextContent('1');
    expect(highlights[1]).toHaveTextContent('10');
    expect(highlights[0].className).toBe(highlights[1].className);
    expect(highlights[0].classList).toContain('font-bold');
  });
});
