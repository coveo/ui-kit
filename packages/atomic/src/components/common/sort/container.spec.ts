import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderSortContainer} from './container';

describe('#renderSortContainer', () => {
  const renderComponent = async () => {
    const children = html`<div class="test-children">Test Children</div>`;
    const element = await renderFunctionFixture(
      html`${renderSortContainer()(children)}`
    );

    return {
      container: element.querySelector('div'),
      children: element.querySelector('.test-children'),
    };
  };

  it('should render a div', async () => {
    const {container} = await renderComponent();

    expect(container?.tagName).toBe('DIV');
  });

  it('should render the children inside the div', async () => {
    const {container, children} = await renderComponent();

    expect(children).toHaveTextContent('Test Children');
    expect(container).toContainElement(children);
  });
});
