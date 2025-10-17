import {html, nothing} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {type IconButtonProps, renderIconButton} from './icon-button';

vi.mock('@/src/utils/ripple-utils', {spy: true});

describe('#renderIconButton', () => {
  const defaultPartPrefix = 'test';

  const locators = (element: Element, partPrefix = defaultPartPrefix) => ({
    get container() {
      return element.querySelector(`[part="${partPrefix}-container"]`);
    },
    get button() {
      return element.querySelector(`[part="${partPrefix}-button"]`);
    },
    get icon() {
      return element.querySelector(`[part="${partPrefix}-icon"]`);
    },
    get badge() {
      return element.querySelector(`[part="${partPrefix}-badge"]`);
    },
  });

  const renderComponent = async (props: Partial<IconButtonProps> = {}) => {
    return await renderFunctionFixture(
      html`${renderIconButton({
        props: {
          style: 'primary',
          icon: 'search',
          partPrefix: defaultPartPrefix,
          ...props,
        },
      })}`
    );
  };

  it('should render with valid props', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render container div with the correct part', async () => {
    const partPrefix = 'custom';

    const element = await renderComponent({partPrefix});
    const container = locators(element, partPrefix).container;

    expect(container).not.toBeNull();
    expect(container?.tagName).toBe('DIV');
    expect(container?.part).toContain('custom-container');
  });

  it('should render button with the correct part', async () => {
    const partPrefix = 'custom';

    const element = await renderComponent({partPrefix});
    const button = locators(element, partPrefix).button;

    expect(button).not.toBeNull();
    expect(button?.tagName).toBe('BUTTON');
    expect(button?.part).toContain('custom-button');
  });

  it('should render button with custom class when provided', async () => {
    const element = await renderComponent({
      class: 'custom-class extra-class',
    });
    const button = locators(element).button;

    expect(button).toHaveClass('custom-class', 'extra-class');
  });

  it('should call specified onClick when button is clicked', async () => {
    const handleClick = vi.fn();

    const element = await renderComponent({onClick: handleClick});
    (locators(element).button! as HTMLButtonElement).click();

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should pass button ref correctly', async () => {
    const buttonRef = vi.fn();

    const element = await renderComponent({buttonRef});
    const button = locators(element).button;

    expect(buttonRef).toHaveBeenCalledWith(button);
  });

  it('should render button text when provided', async () => {
    const element = await renderComponent({
      text: 'hello world!',
    });
    const button = locators(element).button;

    expect(button).toHaveTextContent('hello world!');
  });

  // Cursory check, this is covered in depth in the button spec.
  it('should render button with additional props', async () => {
    const element = await renderComponent({
      style: 'square-neutral',
      type: 'submit',
      form: 'Test Form',
      role: 'toolbar',
      disabled: true,
      ariaLabel: 'Test Button',
      ariaExpanded: 'true',
      ariaPressed: 'true',
      ariaChecked: 'true',
      ariaCurrent: 'page',
      ariaHidden: 'true',
      tabIndex: 10,
      title: 'Test Title',
    });

    const button = locators(element).button;

    expect(button?.classList).toContain('btn-square-neutral');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('form', 'Test Form');
    expect(button).toHaveAttribute('role', 'toolbar');
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-label', 'Test Button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('aria-checked', 'true');
    expect(button).toHaveAttribute('aria-current', 'page');
    expect(button).toHaveAttribute('aria-hidden', 'true');
    expect(button).toHaveAttribute('tabindex', '10');
    expect(button).toHaveAttribute('title', 'Test Title');
  });

  it('should render atomic-icon with the correct part', async () => {
    const partPrefix = 'custom';
    const element = await renderComponent({
      partPrefix,
    });
    const icon = locators(element, partPrefix).icon;

    expect(icon).not.toBeNull();
    expect(icon?.tagName).toBe('ATOMIC-ICON');
    expect(icon?.part).toContain('custom-icon');
  });

  it('should render atomic-icon with the specified icon', async () => {
    const element = await renderComponent({
      icon: 'user',
    });
    const icon = locators(element).icon;

    expect(icon).toHaveAttribute('icon', 'user');
  });

  describe('when badge is provided', () => {
    it('should render badge span element with the correct part', async () => {
      const partPrefix = 'custom';
      const badgeTemplate = html`badger!`;
      const element = await renderComponent({
        badge: badgeTemplate,
        partPrefix,
      });
      const badge = locators(element, partPrefix).badge;

      expect(badge?.tagName).toBe('SPAN');
      expect(badge?.part).toContain('custom-badge');
    });

    it('should render badge template', async () => {
      const element = await renderComponent({
        badge: html`<span>badger!</span>`,
      });
      const badge = locators(element).badge;
      const template = badge?.querySelector('span');

      expect(template).toBeInTheDocument();
      expect(template).toHaveTextContent('badger!');
    });
  });

  describe('when badge is not provided', () => {
    it('should not render badge element', async () => {
      const element = await renderComponent({
        badge: undefined,
      });
      const badge = locators(element).badge;

      expect(badge).not.toBeInTheDocument();
    });

    it('should render empty badge when badge is nothing', async () => {
      const element = await renderComponent({
        badge: nothing,
      });
      const badge = locators(element).badge;

      expect(badge).toBeInTheDocument();
      expect(badge?.textContent?.trim()).toBe('');
    });
  });
});
