import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  type FacetSearchInputGuardProps,
  facetSearchInputGuard,
} from './facet-search-input-guard';

function renderWithGuard(
  props: FacetSearchInputGuardProps,
  content: string = 'Search Input'
) {
  return renderFunctionFixture(
    html`${facetSearchInputGuard(
      props,
      () =>
        html`<div data-testid="search-input" id="search-input">${content}</div>`
    )}`
  );
}

const locators = {
  get searchInput() {
    return page.getByTestId('search-input');
  },
};

describe('facetSearchInputGuard', () => {
  it('should render nothing if withSearch is false', async () => {
    const el = await renderWithGuard({
      withSearch: false,
      canShowMoreValues: true,
      numberOfDisplayedValues: 10,
    });
    expect(el.querySelector('#search-input')).toBeNull();
  });

  it('should render nothing if canShowMoreValues is false and numberOfDisplayedValues < 9', async () => {
    const el = await renderWithGuard({
      withSearch: true,
      canShowMoreValues: false,
      numberOfDisplayedValues: 5,
    });
    expect(el.querySelector('#search-input')).toBeNull();
  });

  it('should render content if withSearch is true and canShowMoreValues is true', async () => {
    await renderWithGuard({
      withSearch: true,
      canShowMoreValues: true,
      numberOfDisplayedValues: 5,
    });
    await expect.element(locators.searchInput).not.toBeNull();
    await expect
      .element(locators.searchInput)
      .toHaveTextContent('Search Input');
  });

  it('should render content if withSearch is true, canShowMoreValues is false, but numberOfDisplayedValues >= 9', async () => {
    await renderWithGuard({
      withSearch: true,
      canShowMoreValues: false,
      numberOfDisplayedValues: 10,
    });
    await expect.element(locators.searchInput).not.toBeNull();
  });

  it('should render content if withSearch is true, canShowMoreValues is true, and numberOfDisplayedValues < 9', async () => {
    await renderWithGuard({
      withSearch: true,
      canShowMoreValues: true,
      numberOfDisplayedValues: 5,
    });
    await expect.element(locators.searchInput).not.toBeNull();
  });
});
