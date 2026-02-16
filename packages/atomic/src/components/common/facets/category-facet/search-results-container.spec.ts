import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderCategoryFacetSearchResultsContainer} from './search-results-container';

describe('#renderCategoryFacetSearchResultsContainer', () => {
  const renderComponent = async (children = html`<li>Test child</li>`) => {
    const container = await renderFunctionFixture(
      html`${renderCategoryFacetSearchResultsContainer()(children)}`
    );

    return {
      container,
      ul: container.querySelector('ul'),
    };
  };

  it('should render a ul element', async () => {
    const {ul} = await renderComponent();

    expect(ul).toBeInTheDocument();
  });

  it('should have correct part attribute on ul element', async () => {
    const {ul} = await renderComponent();

    expect(ul).toHaveAttribute('part', 'search-results');
  });

  it('should render children inside the ul element', async () => {
    const {ul, container} = await renderComponent(
      html`<li class="test-child">Test Item</li>`
    );

    const child = container.querySelector('.test-child');

    expect(ul).toBeInTheDocument();
    expect(child).toBeInTheDocument();
  });
});
