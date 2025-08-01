import {html, type TemplateResult} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderFacetContainer} from './facet-container';

describe('renderFacetContainer', () => {
  const setupElement = (children: TemplateResult) => {
    return renderFunctionFixture(html`${renderFacetContainer()(children)}`);
  };

  const getContainer = (element: HTMLElement) =>
    element.querySelector('div[part="facet"]');

  it('renders correctly with children', async () => {
    const element = await setupElement(html`<div>Child Content</div>`);

    const container = getContainer(element);
    expect(container).toBeInTheDocument();
    expect(container?.innerHTML).toContain('Child Content');
  });

  it('renders multiple children correctly', async () => {
    const element = await setupElement(html`
      <div>Child 1</div>
      <div>Child 2</div>
    `);

    const container = getContainer(element);
    expect(container?.innerHTML).toContain('Child 1');
    expect(container?.innerHTML).toContain('Child 2');
  });
});
