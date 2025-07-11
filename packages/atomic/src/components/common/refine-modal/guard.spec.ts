import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {refineToggleGuard} from './guard';

describe('#refineToggleGuard', () => {
  const renderComponent = async (overrides = {}) => {
    const children = html`<div class="test-children">Test Children</div>`;
    const element = await renderFunctionFixture(
      html`${refineToggleGuard(
        {
          hasError: false,
          firstRequestExecuted: true,
          hasItems: true,
          ...overrides,
        },
        () => children
      )}`
    );

    return {
      element,
      placeholder: element.querySelector('[part="placeholder"]'),
      children: element.querySelector('.test-children'),
    };
  };

  it('should render nothing when hasError is true', async () => {
    const {element} = await renderComponent({
      hasError: true,
      firstRequestExecuted: true,
      hasItems: true,
    });

    expect(element).toBeEmptyDOMElement();
  });

  describe('when hasError is false', () => {
    it('should render a placeholder with correct attributes when firstRequestExecuted is false', async () => {
      const {placeholder} = await renderComponent({
        hasError: false,
        firstRequestExecuted: false,
        hasItems: true,
      });

      expect(placeholder).toBeVisible();
      expect(placeholder).toHaveAttribute('part', 'placeholder');
      expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    });

    describe('when firstRequestExecuted is true', () => {
      it('should render nothing when hasItems is false', async () => {
        const {element} = await renderComponent({
          hasError: false,
          firstRequestExecuted: true,
          hasItems: false,
        });

        expect(element).toBeEmptyDOMElement();
      });

      it('should render children when hasItems is true', async () => {
        const {children} = await renderComponent({
          hasError: false,
          firstRequestExecuted: true,
          hasItems: true,
        });

        expect(children).toBeVisible();
        expect(children).toHaveTextContent('Test Children');
      });
    });
  });
});
