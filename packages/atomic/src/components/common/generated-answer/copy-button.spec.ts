import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {type CopyButtonProps, renderCopyButton} from './copy-button';

describe('#renderCopyButton', () => {
  const locators = (element: Element) => ({
    get button() {
      return element.querySelector('[part="copy-button"]');
    },
    get icon() {
      return element.querySelector('atomic-icon');
    },
    get iconContainer() {
      return element.querySelector('.icon-container');
    },
  });

  const renderComponent = async (props: Partial<CopyButtonProps> = {}) => {
    return await renderFunctionFixture(
      html`${renderCopyButton({
        props: {
          title: 'Copy',
          isCopied: false,
          error: false,
          onClick: vi.fn(),
          ...props,
        },
      })}`
    );
  };

  it('should render a copy button in the document', async () => {
    const element = await renderComponent();
    const button = locators(element).button;
    expect(button).toBeInTheDocument();
  });

  it('should render a copy button with the correct title', async () => {
    const element = await renderComponent({
      title: 'Copy to clipboard',
    });
    const button = locators(element).button;

    expect(button).toHaveAttribute('title', 'Copy to clipboard');
  });

  it('should render a copy button with the correct part attribute', async () => {
    const element = await renderComponent();
    const button = locators(element).button;

    expect(button).toHaveAttribute('part', 'copy-button');
  });

  it('should render a copy button with default classes', async () => {
    const element = await renderComponent();
    const button = locators(element).button;

    expect(button).toHaveClass('rounded-md');
    expect(button).toHaveClass('p-2');
  });

  it('should add "copied" class when isCopied is true', async () => {
    const element = await renderComponent({
      isCopied: true,
    });
    const button = locators(element).button;

    expect(button).toHaveClass('copied');
    expect(button).toHaveClass('rounded-md');
    expect(button).toHaveClass('p-2');
  });

  it('should add "error" class when error is true', async () => {
    const element = await renderComponent({
      error: true,
    });
    const button = locators(element).button;

    expect(button).toHaveClass('error');
    expect(button).toHaveClass('rounded-md');
    expect(button).toHaveClass('p-2');
  });

  it('should add both "copied" and "error" classes when both are true', async () => {
    const element = await renderComponent({
      isCopied: true,
      error: true,
    });
    const button = locators(element).button;

    expect(button).toHaveClass('copied');
    expect(button).toHaveClass('error');
    expect(button).toHaveClass('rounded-md');
    expect(button).toHaveClass('p-2');
  });

  it('should call onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const element = await renderComponent({
      onClick: handleClick,
    });
    const button = locators(element).button as HTMLButtonElement;

    button.click();

    expect(handleClick).toHaveBeenCalled();
  });

  it('should render an atomic-icon component', async () => {
    const element = await renderComponent();
    const icon = locators(element).icon;

    expect(icon).toBeInTheDocument();
  });
});
