import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderQuerySummaryGuard} from './guard';

describe('#renderQuerySummaryGuard', () => {
  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderQuerySummaryGuard({
        props: {
          hasResults: true,
          hasError: false,
          firstSearchExecuted: true,
          ...overrides,
        },
      })(html`<span>Test</span>`)}`
    );

    return {
      element,
      placeholder: element.querySelector('[part="placeholder"]'),
    };
  };

  it('should render nothing when #hasError is true', async () => {
    const {element} = await renderComponent({
      hasResults: false,
      hasError: true,
      firstSearchExecuted: true,
    });

    expect(element).toBeEmptyDOMElement();
  });

  it('should render nothing when #hasResults is false and #firstSearchExecuted is true', async () => {
    const {element} = await renderComponent({
      hasResults: false,
      hasError: false,
      firstSearchExecuted: true,
    });

    expect(element).toBeEmptyDOMElement();
  });

  describe('when #hasError is false', () => {
    it('should render a placeholder with the proper attributes when #firstSearchExecuted is false', async () => {
      const {placeholder} = await renderComponent({
        hasResults: false,
        hasError: false,
        firstSearchExecuted: false,
      });

      expect(placeholder).toBeVisible();
      expect(placeholder).toHaveAttribute('part', 'placeholder');
      expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render the children when #firstSearchExecuted is true and #hasResults is true', async () => {
      const {element} = await renderComponent({
        hasResults: true,
        hasError: false,
        firstSearchExecuted: true,
      });

      expect(element).toContainHTML('<span>Test</span>');
    });
  });
});
