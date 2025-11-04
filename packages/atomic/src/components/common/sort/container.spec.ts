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

  it('should render a div with the correct classes', async () => {
    const {container} = await renderComponent();

    expect(container).toHaveClass('text-on-background');
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('flex-wrap');
    expect(container).toHaveClass('items-center');
  });

  it('should render the children inside the div', async () => {
    const {children} = await renderComponent();

    expect(children).toHaveTextContent('Test Children');
  });
});
