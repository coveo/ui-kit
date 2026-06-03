import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type FacetSearchMatchesProps,
  renderFacetSearchMatches,
} from './facet-search-matches';

describe('#renderFacetSearchMatches', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const locators = {
    get noMatch() {
      return page.getByText('No matches found for test');
    },
    get moreMatches() {
      return page.getByText('More matches for test');
    },
    get moreMatchesButton() {
      return page.getByRole('button', {
        name: 'More matches for test',
      });
    },
  };

  const renderComponent = (props: Partial<FacetSearchMatchesProps> = {}) => {
    const defaultProps: FacetSearchMatchesProps = {
      i18n,
      query: 'test',
      numberOfMatches: 0,
      hasMoreMatches: true,
      showMoreMatches: vi.fn(),
    };
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderFacetSearchMatches({props: mergedProps})}`
    );
  };

  it('renders "no matches found" message when numberOfMatches is 0', async () => {
    await renderComponent();
    await expect.element(locators.noMatch).toBeInTheDocument();
  });

  it('renders "more matches" message when hasMoreMatches is true and showMoreMatches is not provided', async () => {
    await renderComponent({
      numberOfMatches: 5,
      hasMoreMatches: true,
      showMoreMatches: undefined,
    });
    await expect.element(locators.moreMatches).toBeInTheDocument();
  });

  it('renders "show more matches" button when hasMoreMatches is true and showMoreMatches is provided', async () => {
    await renderComponent({
      numberOfMatches: 5,
      hasMoreMatches: true,
    });
    await expect.element(locators.moreMatchesButton).toBeInTheDocument();
  });

  it('calls #showMoreMatches when the "show more matches" button is clicked', async () => {
    const showMoreMatchesMock = vi.fn();
    await renderComponent({
      numberOfMatches: 5,
      hasMoreMatches: true,
      showMoreMatches: showMoreMatchesMock,
    });
    await locators.moreMatchesButton.click();
    expect(showMoreMatchesMock).toHaveBeenCalled();
  });

  it('renders nothing when numberOfMatches is greater than 0 and hasMoreMatches is false', async () => {
    const container = await renderComponent({
      numberOfMatches: 5,
      hasMoreMatches: false,
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders "no matches" with the correct part attribute', async () => {
    await renderComponent();
    await expect
      .element(locators.noMatch)
      .toHaveAttribute('part', 'no-matches');
  });
  it('renders "more matches" with the correct part attribute', async () => {
    await renderComponent({
      numberOfMatches: 5,
      hasMoreMatches: true,
    });
    await expect
      .element(locators.moreMatches)
      .toHaveAttribute('part', 'more-matches');
  });

  it('renders matched query with the correct part attribute', async () => {
    const container = await renderComponent();
    const highlightedQuery = container.querySelector('[part="matches-query"]');
    expect(highlightedQuery).toHaveTextContent('test');
  });
});
