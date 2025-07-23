import {beforeEach, describe, expect, it, vi} from 'vitest';
import {bindAnalyticsToLink} from './bind-analytics-to-link';

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

  it('should default to stopPropagation=true when not specified', () => {
    const {stopPropagation: _stopPropagation, ...propsWithoutStopPropagation} =
      eventProps;
    bindAnalyticsToLink(mockLink, propsWithoutStopPropagation);

    const clickEvent = new MouseEvent('click', {bubbles: true});
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

    mockLink.dispatchEvent(clickEvent);

    expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
  });

  it('should return a cleanup function', () => {
    const cleanup = bindAnalyticsToLink(mockLink, eventProps);

    expect(cleanup).toBeTypeOf('function');
  });

  it('should remove event listeners when cleanup function is called', () => {
    const cleanup = bindAnalyticsToLink(mockLink, eventProps);

    const clickEvent = new MouseEvent('click', {bubbles: true});
    mockLink.dispatchEvent(clickEvent);
    expect(eventProps.onSelect).toHaveBeenCalledTimes(1);

    cleanup();

    eventProps.onSelect.mockClear();

    mockLink.dispatchEvent(clickEvent);
    expect(eventProps.onSelect).not.toHaveBeenCalled();
  });

  it('should remove all event listeners when cleanup is called', () => {
    const cleanup = bindAnalyticsToLink(mockLink, eventProps);

    // Verify all listeners work before cleanup
    mockLink.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    mockLink.dispatchEvent(new MouseEvent('contextmenu', {bubbles: true}));
    mockLink.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
    mockLink.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
    mockLink.dispatchEvent(new TouchEvent('touchstart', {bubbles: true}));
    mockLink.dispatchEvent(new TouchEvent('touchend', {bubbles: true}));

    expect(eventProps.onSelect).toHaveBeenCalledTimes(4);
    expect(eventProps.onBeginDelayedSelect).toHaveBeenCalledTimes(1);
    expect(eventProps.onCancelPendingSelect).toHaveBeenCalledTimes(1);

    cleanup();

    eventProps.onSelect.mockClear();
    eventProps.onBeginDelayedSelect.mockClear();
    eventProps.onCancelPendingSelect.mockClear();

    mockLink.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    mockLink.dispatchEvent(new MouseEvent('contextmenu', {bubbles: true}));
    mockLink.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
    mockLink.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
    mockLink.dispatchEvent(new TouchEvent('touchstart', {bubbles: true}));
    mockLink.dispatchEvent(new TouchEvent('touchend', {bubbles: true}));

    expect(eventProps.onSelect).not.toHaveBeenCalled();
    expect(eventProps.onBeginDelayedSelect).not.toHaveBeenCalled();
    expect(eventProps.onCancelPendingSelect).not.toHaveBeenCalled();
  });

  it('should not throw when cleanup is called multiple times', () => {
    const cleanup = bindAnalyticsToLink(mockLink, eventProps);

    expect(() => {
      cleanup();
      cleanup();
      cleanup();
    }).not.toThrow();
  });
});
