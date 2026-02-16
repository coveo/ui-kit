import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderCategoryFacetTreeValueContainer} from './value-as-tree-container';

describe('#renderCategoryFacetTreeValueContainer', () => {
  const renderComponent = async (children = html`<span>Test child</span>`) => {
    const container = await renderFunctionFixture(
      html`${renderCategoryFacetTreeValueContainer()(children)}`
    );

    return {
      li: container.querySelector('li'),
      subItems: container.querySelectorAll('.subcategories li'),
    };
  };

  it('should render tree group structure', async () => {
    const {subItems, li} = await renderComponent(html`
      <ul class="subcategories">
        <li>Subcategory 1</li>
        <li>Subcategory 2</li>
      </ul>
    `);

    expect(subItems).toHaveLength(2);
    expect(li).toBeInTheDocument();
  });
});
