import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderQuerySummaryContainer} from './container';

describe('#renderQuerySummaryContainer', () => {
  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderQuerySummaryContainer({
        props: {
          ...overrides,
        },
      })(html`<span>Test</span>`)}`
    );

    return {
      container: element.querySelector('div[part="container"]'),
      children: element.querySelector('span'),
    };
  };

  it('should render the container with the correct part', async () => {
    const {container} = await renderComponent();
    expect(container).toHaveAttribute('part', 'container');
  });

  describe('when additionalClasses is provided', () => {
    it('should apply the additional classes to the container', async () => {
      const {container} = await renderComponent({
        additionalClasses: 'custom-class',
      });
      expect(container).toHaveClass('text-on-background custom-class');
    });
  });

  it('should render children inside the container', async () => {
    const {children} = await renderComponent();
    expect(children).toBeDefined();
    expect(children?.textContent).toBe('Test');
  });
});
