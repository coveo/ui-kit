import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {describe, it, vi, expect, beforeEach} from 'vitest';
import {
  renderLinkWithItemAnalytics,
  bindAnalyticsToLink,
  type ItemLinkProps,
} from './item-link';

// Mock external dependencies
vi.mock('@/src/utils/xss-utils', () => ({
  filterProtocol: vi.fn((url: string) => url),
}));

describe('#renderLinkWithItemAnalytics', () => {
  const renderComponent = async (
    props: Partial<ItemLinkProps> = {},
    children = html`<span>Default Link Text</span>`
  ) => {
    const defaultProps: ItemLinkProps = {
      href: 'https://example.com',
      onSelect: vi.fn(),
      onBeginDelayedSelect: vi.fn(),
      onCancelPendingSelect: vi.fn(),
      ...props,
    };

    return await renderFunctionFixture(
      html`${renderLinkWithItemAnalytics({props: defaultProps})(children)}`
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render link element with required props', async () => {
      const element = await renderComponent({
        href: 'https://test.com',
      });

      const link = element.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://test.com');
      expect(link).toHaveAttribute('target', '_self');
    });

    it('should render children correctly', async () => {
      const element = await renderComponent(
        {},
        html`<span class="test-child">Custom Link Text</span>`
      );

      const child = element.querySelector('.test-child');
      expect(child).toHaveTextContent('Custom Link Text');
    });

    it('should render multiple children correctly', async () => {
      const element = await renderComponent(
        {},
        html`
          <span class="child-1">Part 1</span>
          <span class="child-2">Part 2</span>
        `
      );

      expect(element.querySelector('.child-1')).toHaveTextContent('Part 1');
      expect(element.querySelector('.child-2')).toHaveTextContent('Part 2');
    });

    it('should handle empty children', async () => {
      const element = await renderComponent({}, html``);

      const link = element.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent('');
    });
  });

  describe('prop handling', () => {
    it('should apply className when provided', async () => {
      const element = await renderComponent({
        className: 'custom-class another-class',
      });

      const link = element.querySelector('a');
      expect(link).toHaveClass('custom-class', 'another-class');
    });

    it('should apply part attribute when provided', async () => {
      const element = await renderComponent({
        part: 'custom-part',
      });

      const link = element.querySelector('a');
      expect(link).toHaveAttribute('part', 'custom-part');
    });

    it('should apply title when provided', async () => {
      const element = await renderComponent({
        title: 'Custom Title',
      });

      const link = element.querySelector('a');
      expect(link).toHaveAttribute('title', 'Custom Title');
    });

    it('should apply rel attribute when provided', async () => {
      const element = await renderComponent({
        rel: 'noopener noreferrer',
      });

      const link = element.querySelector('a');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should apply custom target when provided', async () => {
      const element = await renderComponent({
        target: '_blank',
      });

      const link = element.querySelector('a');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should default to _self target when not provided', async () => {
      const element = await renderComponent({});

      const link = element.querySelector('a');
      expect(link).toHaveAttribute('target', '_self');
    });

    it('should apply tabIndex when provided', async () => {
      const element = await renderComponent({
        tabIndex: 5,
      });

      const link = element.querySelector('a');
      expect(link).toHaveAttribute('tabindex', '5');
    });

    it('should not apply tabindex when not provided', async () => {
      const element = await renderComponent({});

      const link = element.querySelector('a');
      expect(link).not.toHaveAttribute('tabindex');
    });

    it('should apply aria-hidden when ariaHidden is true', async () => {
      const element = await renderComponent({
        ariaHidden: true,
      });

      const link = element.querySelector('a');
      expect(link).toHaveAttribute('aria-hidden', 'true');
    });

    it('should not apply aria-hidden when ariaHidden is false', async () => {
      const element = await renderComponent({
        ariaHidden: false,
      });

      const link = element.querySelector('a');
      expect(link).not.toHaveAttribute('aria-hidden');
    });
  });

  describe('custom attributes', () => {
    it('should apply custom attributes when provided', async () => {
      const customAttributes = [
        {nodeName: 'data-test', nodeValue: 'test-value'} as Attr,
        {nodeName: 'data-id', nodeValue: '123'} as Attr,
      ];

      const element = await renderComponent({
        attributes: customAttributes,
      });

      const link = element.querySelector('a');
      expect(link).toHaveAttribute('data-test', 'test-value');
      expect(link).toHaveAttribute('data-id', '123');
    });

    it('should handle empty attributes array', async () => {
      const element = await renderComponent({
        attributes: [],
      });

      const link = element.querySelector('a');
      expect(link).toBeInTheDocument();
    });

    it('should handle undefined attributes', async () => {
      const element = await renderComponent({
        attributes: undefined,
      });

      const link = element.querySelector('a');
      expect(link).toBeInTheDocument();
    });
  });

  describe('event handlers', () => {
    it('should call onMouseOver when mouse enters', async () => {
      const handleMouseOver = vi.fn();
      const element = await renderComponent({
        onMouseOver: handleMouseOver,
      });

      const link = element.querySelector('a')!;
      const mouseOverEvent = new MouseEvent('mouseover', {bubbles: true});
      link.dispatchEvent(mouseOverEvent);

      expect(handleMouseOver).toHaveBeenCalledTimes(1);
    });

    it('should call onMouseLeave when mouse leaves', async () => {
      const handleMouseLeave = vi.fn();
      const element = await renderComponent({
        onMouseLeave: handleMouseLeave,
      });

      const link = element.querySelector('a')!;
      const mouseLeaveEvent = new MouseEvent('mouseleave', {bubbles: true});
      link.dispatchEvent(mouseLeaveEvent);

      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('should call onFocus when link receives focus', async () => {
      const handleFocus = vi.fn();
      const element = await renderComponent({
        onFocus: handleFocus,
      });

      const link = element.querySelector('a')!;
      const focusEvent = new FocusEvent('focus', {bubbles: true});
      link.dispatchEvent(focusEvent);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur when link loses focus', async () => {
      const handleBlur = vi.fn();
      const element = await renderComponent({
        onBlur: handleBlur,
      });

      const link = element.querySelector('a')!;
      const blurEvent = new FocusEvent('blur', {bubbles: true});
      link.dispatchEvent(blurEvent);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('ref callback', () => {
    it('should call ref callback with link element', async () => {
      const refCallback = vi.fn();
      await renderComponent({
        ref: refCallback,
      });

      expect(refCallback).toHaveBeenCalledTimes(1);
      expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
    });

    it('should handle undefined ref callback', async () => {
      // Should not throw when ref is undefined
      await expect(
        renderComponent({
          ref: undefined,
        })
      ).resolves.toBeDefined();
    });

    it('should handle ref lifecycle correctly', async () => {
      const refCallback = vi.fn();
      await renderComponent({
        ref: refCallback,
      });

      expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));

      expect(() => refCallback(undefined)).not.toThrow();
    });
  });

  describe('XSS protection', () => {
    it('should filter href through filterProtocol', async () => {
      const {filterProtocol} = await import('@/src/utils/xss-utils');

      await renderComponent({
        href: 'javascript:alert("xss")',
      });

      expect(filterProtocol).toHaveBeenCalledWith('javascript:alert("xss")');
    });
  });
});

describe('#bindAnalyticsToLink', () => {
  let mockLink: HTMLAnchorElement;
  let eventProps: {
    onSelect: ReturnType<typeof vi.fn>;
    onBeginDelayedSelect: ReturnType<typeof vi.fn>;
    onCancelPendingSelect: ReturnType<typeof vi.fn>;
    stopPropagation: boolean;
  };

  beforeEach(() => {
    mockLink = document.createElement('a');
    eventProps = {
      onSelect: vi.fn(),
      onBeginDelayedSelect: vi.fn(),
      onCancelPendingSelect: vi.fn(),
      stopPropagation: true,
    };
  });

  describe('click events', () => {
    it('should call onSelect for click events', () => {
      bindAnalyticsToLink(mockLink, eventProps);

      const clickEvent = new MouseEvent('click', {bubbles: true});
      mockLink.dispatchEvent(clickEvent);

      expect(eventProps.onSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect for contextmenu events', () => {
      bindAnalyticsToLink(mockLink, eventProps);

      const contextMenuEvent = new MouseEvent('contextmenu', {bubbles: true});
      mockLink.dispatchEvent(contextMenuEvent);

      expect(eventProps.onSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect for mousedown events', () => {
      bindAnalyticsToLink(mockLink, eventProps);

      const mouseDownEvent = new MouseEvent('mousedown', {bubbles: true});
      mockLink.dispatchEvent(mouseDownEvent);

      expect(eventProps.onSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect for mouseup events', () => {
      bindAnalyticsToLink(mockLink, eventProps);

      const mouseUpEvent = new MouseEvent('mouseup', {bubbles: true});
      mockLink.dispatchEvent(mouseUpEvent);

      expect(eventProps.onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('touch events', () => {
    it('should call onBeginDelayedSelect for touchstart events', () => {
      bindAnalyticsToLink(mockLink, eventProps);

      const touchStartEvent = new TouchEvent('touchstart', {bubbles: true});
      mockLink.dispatchEvent(touchStartEvent);

      expect(eventProps.onBeginDelayedSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onCancelPendingSelect for touchend events', () => {
      bindAnalyticsToLink(mockLink, eventProps);

      const touchEndEvent = new TouchEvent('touchend', {bubbles: true});
      mockLink.dispatchEvent(touchEndEvent);

      expect(eventProps.onCancelPendingSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('event propagation', () => {
    it('should stop propagation when stopPropagation is true', () => {
      bindAnalyticsToLink(mockLink, {...eventProps, stopPropagation: true});

      const clickEvent = new MouseEvent('click', {bubbles: true});
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

      mockLink.dispatchEvent(clickEvent);

      expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
      expect(eventProps.onSelect).toHaveBeenCalledTimes(1);
    });

    it('should not stop propagation when stopPropagation is false', () => {
      bindAnalyticsToLink(mockLink, {...eventProps, stopPropagation: false});

      const clickEvent = new MouseEvent('click', {bubbles: true});
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

      mockLink.dispatchEvent(clickEvent);

      expect(stopPropagationSpy).not.toHaveBeenCalled();
      expect(eventProps.onSelect).toHaveBeenCalledTimes(1);
    });

    it('should stop propagation for touch events when enabled', () => {
      bindAnalyticsToLink(mockLink, {...eventProps, stopPropagation: true});

      const touchStartEvent = new TouchEvent('touchstart', {bubbles: true});
      const stopPropagationSpy = vi.spyOn(touchStartEvent, 'stopPropagation');

      mockLink.dispatchEvent(touchStartEvent);

      expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
      expect(eventProps.onBeginDelayedSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('default stopPropagation behavior', () => {
    it('should default to stopPropagation=true when not specified', () => {
      const {stopPropagation, ...propsWithoutStopPropagation} = eventProps;
      bindAnalyticsToLink(mockLink, propsWithoutStopPropagation);

      const clickEvent = new MouseEvent('click', {bubbles: true});
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

      mockLink.dispatchEvent(clickEvent);

      expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
    });
  });
});
