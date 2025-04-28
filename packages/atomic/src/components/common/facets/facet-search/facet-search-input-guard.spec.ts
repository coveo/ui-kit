import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {facetSearchInputGuard} from './facet-search-input-guard';

describe('facetSearchInputGuard', () => {
  const content = () =>
    html`<div data-testid="cupcake">Here's a cupcake 🧁</div>`;
  const locator = () => page.getByTestId('cupcake');

  it('renders nothing when withSearch is false', async () => {
    await renderFunctionFixture(
      html`${facetSearchInputGuard(
        {
          withSearch: false,
          canShowMoreValues: true,
          numberOfDisplayedValues: 10,
        },
        content
      )}`
    );
    await expect.element(locator()).not.toBeInTheDocument();
  });

  it('renders nothing when canShowMoreValues is false and numberOfDisplayedValues is less than 9', async () => {
    await renderFunctionFixture(
      html`${facetSearchInputGuard(
        {
          withSearch: true,
          canShowMoreValues: false,
          numberOfDisplayedValues: 8,
        },
        content
      )}`
    );
    await expect.element(locator()).not.toBeInTheDocument();
  });

  it('renders the content when withSearch is true, canShowMoreValues is true, and numberOfDisplayedValues is greater than or equal to 9', async () => {
    await renderFunctionFixture(
      html`${facetSearchInputGuard(
        {
          withSearch: true,
          canShowMoreValues: true,
          numberOfDisplayedValues: 10,
        },
        content
      )}`
    );
    await expect.element(locator()).toBeInTheDocument();
  });

  it('renders the content when withSearch is true, canShowMoreValues is false, but numberOfDisplayedValues is greater than or equal to 9', async () => {
    await renderFunctionFixture(
      html`${facetSearchInputGuard(
        {
          withSearch: true,
          canShowMoreValues: false,
          numberOfDisplayedValues: 9,
        },
        content
      )}`
    );
    await expect.element(locator()).toBeInTheDocument();
  });

  it('renders nothing when withSearch is true, canShowMoreValues is false, and numberOfDisplayedValues is less than 9', async () => {
    await renderFunctionFixture(
      html`${facetSearchInputGuard(
        {
          withSearch: true,
          canShowMoreValues: false,
          numberOfDisplayedValues: 8,
        },
        content
      )}`
    );
    await expect.element(locator()).not.toBeInTheDocument();
  });
});
