import {page} from '@vitest/browser/context';
import {html, nothing} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import '@vitest/browser/matchers.d.ts';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {type IconButtonProps, renderIconButton} from './icon-button';

// Mock the ripple utility to avoid side effects
vi.mock('../../utils/ripple', () => ({
  createRipple: vi.fn(),
}));

describe('#renderIconButton', () => {
  const locators = {
    get button() {
      return page.getByRole('button');
    },
  };

  const renderComponent = async (props: Partial<IconButtonProps> = {}) => {
    const defaultProps: IconButtonProps = {
      style: 'primary',
      icon: 'search',
      partPrefix: 'test',
      ...props,
    };

    return await renderFunctionFixture(
      html`${renderIconButton({props: defaultProps})}`
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render container with correct part attribute', async () => {
    const element = await renderComponent({partPrefix: 'custom'});

    const container = element.querySelector('[part="custom-container"]');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('relative');
  });

  it('should render button with correct classes and part', async () => {
    const element = await renderComponent({
      partPrefix: 'custom',
      style: 'outline-primary',
    });

    const button = element.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('relative', 'h-[2.6rem]', 'w-[2.6rem]', 'p-3');
    expect(button).toHaveAttribute('part', 'custom-button');
  });

  it('should render button with custom class when provided', async () => {
    const element = await renderComponent({
      class: 'custom-class extra-class',
    });

    const button = element.querySelector('button');
    expect(button).toHaveClass('custom-class', 'extra-class');
  });

  it('should render atomic-icon with correct attributes', async () => {
    const element = await renderComponent({
      icon: 'user',
      partPrefix: 'custom',
    });

    const icon = element.querySelector('atomic-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('icon', 'user');
    expect(icon).toHaveClass('h-4', 'w-4', 'shrink-0');
    expect(icon).toHaveAttribute('part', 'custom-icon');
  });

  it('should call onClick when button is clicked', async () => {
    const handleClick = vi.fn();
    await renderComponent({onClick: handleClick});

    await locators.button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should pass button ref correctly', async () => {
    const buttonRef = vi.fn();
    const element = await renderComponent({buttonRef});

    const button = element.querySelector('button');
    expect(buttonRef).toHaveBeenCalledWith(button);
  });

  it('should render with all button props', async () => {
    const element = await renderComponent({
      disabled: true,
      ariaLabel: 'Test Button',
      title: 'Test Title',
      type: 'submit',
    });

    const button = element.querySelector('button');
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-label', 'Test Button');
    expect(button).toHaveAttribute('title', 'Test Title');
    expect(button).toHaveAttribute('type', 'submit');
  });

  describe('when badge is provided', () => {
    it('should render badge with template result', async () => {
      const badgeTemplate = html`<span>5</span>`;
      const element = await renderComponent({
        badge: badgeTemplate,
        partPrefix: 'custom',
      });

      const badge = element.querySelector('[part="custom-badge"]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(
        'bg-primary',
        'text-on-primary',
        'absolute',
        '-top-2',
        '-right-2',
        'block',
        'h-4',
        'w-4',
        'rounded-full',
        'text-center',
        'text-xs',
        'leading-4'
      );
      expect(badge).toContainHTML('<span>5</span>');
    });

    it('should render badge with simple text content', async () => {
      const element = await renderComponent({
        badge: html`1`,
        partPrefix: 'test',
      });

      const badge = element.querySelector('[part="test-badge"]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('1');
    });

    it('should render badge with correct positioning classes', async () => {
      const element = await renderComponent({
        badge: html`99+`,
      });

      const badge = element.querySelector('[part="test-badge"]');
      expect(badge).toHaveClass('absolute', '-top-2', '-right-2');
    });
  });

  describe('when badge is not provided', () => {
    it('should not render badge element', async () => {
      const element = await renderComponent({
        badge: undefined,
      });

      const badge = element.querySelector('[part="test-badge"]');
      expect(badge).not.toBeInTheDocument();
    });

    it('should render empty badge when badge is nothing', async () => {
      const element = await renderComponent({
        badge: nothing,
      });

      const badge = element.querySelector('[part="test-badge"]');
      // When badge is `nothing`, the span IS rendered because `nothing` is truthy,
      // but it contains no visible content
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent?.trim()).toBe('');
    });
  });

  describe('when disabled is true', () => {
    it('should render disabled button', async () => {
      const element = await renderComponent({disabled: true});

      const button = element.querySelector('button');
      expect(button).toHaveAttribute('disabled');
    });
  });

  describe('when using different button styles', () => {
    it('should render with primary style', async () => {
      const element = await renderComponent({style: 'primary'});

      const button = element.querySelector('button');
      expect(button).toHaveClass('btn-primary');
    });

    it('should render with outline-primary style', async () => {
      const element = await renderComponent({style: 'outline-primary'});

      const button = element.querySelector('button');
      expect(button).toHaveClass('btn-outline-primary');
    });

    it('should render with text-neutral style', async () => {
      const element = await renderComponent({style: 'text-neutral'});

      const button = element.querySelector('button');
      expect(button).toHaveClass('btn-text-neutral');
    });
  });

  describe('when using different icons', () => {
    it('should render search icon', async () => {
      const element = await renderComponent({icon: 'search'});

      const icon = element.querySelector('atomic-icon');
      expect(icon).toHaveAttribute('icon', 'search');
    });

    it('should render user icon', async () => {
      const element = await renderComponent({icon: 'user'});

      const icon = element.querySelector('atomic-icon');
      expect(icon).toHaveAttribute('icon', 'user');
    });

    it('should render close icon', async () => {
      const element = await renderComponent({icon: 'close'});

      const icon = element.querySelector('atomic-icon');
      expect(icon).toHaveAttribute('icon', 'close');
    });
  });

  describe('when using different part prefixes', () => {
    it('should render with custom part prefix', async () => {
      const element = await renderComponent({
        partPrefix: 'sort',
        badge: html`1`,
      });

      expect(
        element.querySelector('[part="sort-container"]')
      ).toBeInTheDocument();
      expect(element.querySelector('[part="sort-button"]')).toBeInTheDocument();
      expect(element.querySelector('[part="sort-icon"]')).toBeInTheDocument();
      expect(element.querySelector('[part="sort-badge"]')).toBeInTheDocument();
    });

    it('should render with facet part prefix', async () => {
      const element = await renderComponent({
        partPrefix: 'facet',
      });

      expect(
        element.querySelector('[part="facet-container"]')
      ).toBeInTheDocument();
      expect(
        element.querySelector('[part="facet-button"]')
      ).toBeInTheDocument();
      expect(element.querySelector('[part="facet-icon"]')).toBeInTheDocument();
    });
  });

  describe('when using accessibility features', () => {
    it('should render with aria-label', async () => {
      const element = await renderComponent({
        ariaLabel: 'Close dialog',
      });

      const button = element.querySelector('button');
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('should render with aria-expanded', async () => {
      const element = await renderComponent({
        ariaExpanded: 'true',
      });

      const button = element.querySelector('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should render with aria-pressed', async () => {
      const element = await renderComponent({
        ariaPressed: 'true',
      });

      const button = element.querySelector('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should render with custom role', async () => {
      const element = await renderComponent({
        role: 'checkbox',
      });

      const button = element.querySelector('button');
      expect(button).toHaveAttribute('role', 'checkbox');
    });

    it('should render with tabIndex', async () => {
      const element = await renderComponent({
        tabIndex: -1,
      });

      const button = element.querySelector('button');
      expect(button).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('when using form-related attributes', () => {
    it('should render with form attribute', async () => {
      const element = await renderComponent({
        form: 'my-form',
        type: 'submit',
      });

      const button = element.querySelector('button');
      expect(button).toHaveAttribute('form', 'my-form');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should render with reset type', async () => {
      const element = await renderComponent({
        type: 'reset',
      });

      const button = element.querySelector('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('when using complex badge content', () => {
    it('should render badge with multiple elements', async () => {
      const complexBadge = html`
        <span class="icon">✓</span>
        <span class="count">3</span>
      `;

      const element = await renderComponent({
        badge: complexBadge,
      });

      const badge = element.querySelector('[part="test-badge"]');
      expect(badge).toContainHTML('<span class="icon">✓</span>');
      expect(badge).toContainHTML('<span class="count">3</span>');
    });

    it('should render badge with nested components', async () => {
      const nestedBadge = html`
        <div class="wrapper">
          <span>Icon placeholder</span>
        </div>
      `;

      const element = await renderComponent({
        badge: nestedBadge,
      });

      const badge = element.querySelector('[part="test-badge"]');
      const wrapper = badge?.querySelector('.wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('wrapper');

      const span = wrapper?.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span).toHaveTextContent('Icon placeholder');
    });
  });
});
