import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderLoadMoreContainer} from './container';

describe('#renderLoadMoreContainer', () => {
  const renderComponent = async () => {
    const children = html`<div class="test-children">Test Children</div>`;
    const element = await renderFunctionFixture(
      html`${renderLoadMoreContainer()(children)}`
    );

    return {
      div: element.querySelector('div[part="container"]'),
      children: element.querySelector('.test-children'),
    };
  };

  it('should render the part "container" on the div', async () => {
    const {div} = await renderComponent();

    expect(div).toHaveAttribute('part', 'container');
  });

  it('should render the children inside the div', async () => {
    const {children} = await renderComponent();

    expect(children).toHaveTextContent('Test Children');
  });
});
