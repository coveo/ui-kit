import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {html} from 'lit';
import {describe, it, expect} from 'vitest';
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

  describe('when there is an error', () => {
    it('should render nothing', async () => {
      const {element} = await renderComponent({
        hasResults: false,
        hasError: true,
        firstSearchExecuted: true,
      });

      expect(element).toBeEmptyDOMElement();
    });
  });

  describe('when there are no results and the first search has been executed', () => {
    it('should render nothing', async () => {
      const {element} = await renderComponent({
        hasResults: false,
        hasError: false,
        firstSearchExecuted: true,
      });

      expect(element).toBeEmptyDOMElement();
    });
  });

  describe('when there is no error', () => {
    describe('and the first search has not been executed', () => {
      it('should render a placeholder with the proper attributes', async () => {
        const {placeholder} = await renderComponent({
          hasResults: false,
          hasError: false,
          firstSearchExecuted: false,
        });

        expect(placeholder).toBeVisible();
        expect(placeholder).toHaveAttribute('part', 'placeholder');
        expect(placeholder).toHaveAttribute('aria-hidden', 'true');
      });
    });

    describe('and the first search has been executed & there are results', () => {
      it('should render the children', async () => {
        const {element} = await renderComponent({
          hasResults: true,
          hasError: false,
          firstSearchExecuted: true,
        });

        expect(element).toContainHTML('<span>Test</span>');
      });
    });
  });
});
