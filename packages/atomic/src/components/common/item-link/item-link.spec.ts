import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {type ItemLinkProps, renderLinkWithItemAnalytics} from './item-link';

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

  it('should render link element ', async () => {
    const element = await renderComponent({});

    const link = element.querySelector('a');
    expect(link).toBeInTheDocument();
  });

  it('should render children correctly', async () => {
    const element = await renderComponent(
      {},
      html`
          <span class="child-1">child 1</span>
          <span class="child-2">child 2</span>
        `
    );

    expect(element.querySelector('.child-1')).toHaveTextContent('child 1');
    expect(element.querySelector('.child-2')).toHaveTextContent('child 2');
  });

  it('should apply href when provided', async () => {
    const element = await renderComponent({
      href: 'https://custom-link.com',
    });
    const link = element.querySelector('a');
    expect(link).toHaveAttribute('href', 'https://custom-link.com');
  });

  it('should apply className when provided', async () => {
    const element = await renderComponent({
      className: 'custom-class another-class',
    });

    const link = element.querySelector('a');
    expect(link).toHaveClass('custom-class', 'another-class');
  });

  it('should not apply class when className is not provided', async () => {
    const element = await renderComponent({});

    const link = element.querySelector('a');
    expect(link).not.toHaveAttribute('class');
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

  it('should override prop attributes when custom attribute conflicts', async () => {
    const customAttributes = [
      {nodeName: 'href', nodeValue: 'https://custom-override.com'} as Attr,
      {nodeName: 'target', nodeValue: '_parent'} as Attr,
      {nodeName: 'title', nodeValue: 'Custom Override Title'} as Attr,
    ];

    const element = await renderComponent({
      href: 'https://original.com',
      target: '_blank',
      title: 'Original Title',
      attributes: customAttributes,
    });

    const link = element.querySelector('a');
    expect(link).toHaveAttribute('href', 'https://custom-override.com');
    expect(link).toHaveAttribute('target', '_parent');
    expect(link).toHaveAttribute('title', 'Custom Override Title');
  });

  it('should call onMouseOver when mouse enters', async () => {
    const handleMouseOver = vi.fn();
    const element = await renderComponent({
      onMouseOver: handleMouseOver,
    });

    const link = element.querySelector('a')!;
    const mouseOverEvent = new MouseEvent('mouseover', {bubbles: true});
    link.dispatchEvent(mouseOverEvent);

    expect(handleMouseOver).toHaveBeenCalledOnce();
  });

  it('should call onMouseLeave when mouse leaves', async () => {
    const handleMouseLeave = vi.fn();
    const element = await renderComponent({
      onMouseLeave: handleMouseLeave,
    });

    const link = element.querySelector('a')!;
    const mouseLeaveEvent = new MouseEvent('mouseleave', {bubbles: true});
    link.dispatchEvent(mouseLeaveEvent);

    expect(handleMouseLeave).toHaveBeenCalledOnce();
  });

  it('should call onFocus when link receives focus', async () => {
    const handleFocus = vi.fn();
    const element = await renderComponent({
      onFocus: handleFocus,
    });

    const link = element.querySelector('a')!;
    const focusEvent = new FocusEvent('focus', {bubbles: true});
    link.dispatchEvent(focusEvent);

    expect(handleFocus).toHaveBeenCalledOnce();
  });

  it('should call onBlur when link loses focus', async () => {
    const handleBlur = vi.fn();
    const element = await renderComponent({
      onBlur: handleBlur,
    });

    const link = element.querySelector('a')!;
    const blurEvent = new FocusEvent('blur', {bubbles: true});
    link.dispatchEvent(blurEvent);

    expect(handleBlur).toHaveBeenCalledOnce();
  });

  it('should call ref callback with link element', async () => {
    const refCallback = vi.fn();
    await renderComponent({
      ref: refCallback,
    });

    expect(refCallback).toHaveBeenCalledOnce();
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

  it('should filter href through filterProtocol', async () => {
    const {filterProtocol} = await import('@/src/utils/xss-utils');

    await renderComponent({
      href: 'javascript:alert("xss")',
    });

    expect(filterProtocol).toHaveBeenCalledWith('javascript:alert("xss")');
  });

  it('should call onInitializeLink with cleanup function when provided', async () => {
    const onInitializeLink = vi.fn();
    await renderComponent({
      onInitializeLink,
    });

    expect(onInitializeLink).toHaveBeenCalledOnce();
    expect(onInitializeLink).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should not throw when onInitializeLink is not provided', async () => {
    await expect(
      renderComponent({
        onInitializeLink: undefined,
      })
    ).resolves.toBeDefined();
  });
});
