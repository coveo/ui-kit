import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {type CopyButtonProps, renderCopyButton} from './copy-button';

vi.mock('@/src/utils/ripple-utils', {spy: true});

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
          onClick: () => {},
          ...props,
        },
      })}`
    );
  };

  it('should render with valid props', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render button with the correct part', async () => {
    const element = await renderComponent();
    const button = locators(element).button;

    expect(button).not.toBeNull();
    expect(button?.tagName).toBe('BUTTON');
    expect(button?.part).toContain('copy-button');
  });

  it('should render button with title attribute', async () => {
    const element = await renderComponent({
      title: 'Copy to clipboard',
    });
    const button = locators(element).button;

    expect(button).toHaveAttribute('title', 'Copy to clipboard');
  });

  it('should render button with text-transparent style', async () => {
    const element = await renderComponent();
    const button = locators(element).button;

    expect(button?.classList).toContain('btn-text-transparent');
  });

  it('should render button with base classes', async () => {
    const element = await renderComponent();
    const button = locators(element).button;

    expect(button).toHaveClass('rounded-md', 'p-2');
  });

  it('should call onClick when button is clicked', async () => {
    const handleClick = vi.fn();

    const element = await renderComponent({onClick: handleClick});
    (locators(element).button! as HTMLButtonElement).click();

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should render atomic-icon', async () => {
    const element = await renderComponent();
    const icon = locators(element).icon;

    expect(icon).not.toBeNull();
    expect(icon?.tagName).toBe('ATOMIC-ICON');
  });

  it('should render atomic-icon with correct classes', async () => {
    const element = await renderComponent();
    const icon = locators(element).icon;

    expect(icon).toHaveClass('w-5');
  });

  it('should render icon container with correct classes', async () => {
    const element = await renderComponent();
    const container = locators(element).iconContainer;

    expect(container).not.toBeNull();
    expect(container).toHaveClass('icon-container', 'text-neutral-dark');
  });

  describe('when isCopied is true', () => {
    it('should add "copied" class to button', async () => {
      const element = await renderComponent({isCopied: true});
      const button = locators(element).button;

      expect(button).toHaveClass('copied');
    });

    it('should keep base classes', async () => {
      const element = await renderComponent({isCopied: true});
      const button = locators(element).button;

      expect(button).toHaveClass('rounded-md', 'p-2', 'copied');
    });
  });

  describe('when isCopied is false', () => {
    it('should not have "copied" class', async () => {
      const element = await renderComponent({isCopied: false});
      const button = locators(element).button;

      expect(button).not.toHaveClass('copied');
    });
  });

  describe('when error is true', () => {
    it('should add "error" class to button', async () => {
      const element = await renderComponent({error: true});
      const button = locators(element).button;

      expect(button).toHaveClass('error');
    });

    it('should keep base classes', async () => {
      const element = await renderComponent({error: true});
      const button = locators(element).button;

      expect(button).toHaveClass('rounded-md', 'p-2', 'error');
    });
  });

  describe('when error is false', () => {
    it('should not have "error" class', async () => {
      const element = await renderComponent({error: false});
      const button = locators(element).button;

      expect(button).not.toHaveClass('error');
    });
  });

  describe('when both isCopied and error are true', () => {
    it('should have both "copied" and "error" classes', async () => {
      const element = await renderComponent({
        isCopied: true,
        error: true,
      });
      const button = locators(element).button;

      expect(button).toHaveClass('copied', 'error');
    });

    it('should keep base classes', async () => {
      const element = await renderComponent({
        isCopied: true,
        error: true,
      });
      const button = locators(element).button;

      expect(button).toHaveClass('rounded-md', 'p-2', 'copied', 'error');
    });
  });
});
