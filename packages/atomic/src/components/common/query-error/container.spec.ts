import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderQueryErrorContainer} from './container';

describe('container', () => {
  describe('#renderQueryErrorContainer', () => {
    const renderComponent = async (
      children = html`<div class="test-children">Test Children</div>`
    ) => {
      const element = await renderFunctionFixture(
        html`${renderQueryErrorContainer()(children)}`
      );

      return {
        children: element.querySelector('.test-children'),
      };
    };

    it('should render children content', async () => {
      const {children} = await renderComponent();

      expect(children).toHaveTextContent('Test Children');
    });
  });
});
