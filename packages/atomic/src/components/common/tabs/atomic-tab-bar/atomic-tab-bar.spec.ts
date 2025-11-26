import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture, html} from '@/vitest-utils';
import type {AtomicTabBar} from './atomic-tab-bar';

describe('atomic-tab-bar', () => {
  let element: AtomicTabBar;

  beforeEach(async () => {
    element = await fixture<AtomicTabBar>(
      html`<atomic-tab-bar>
        <atomic-tab-button
          label="Tab 1"
          .active=${true}
          .select=${vi.fn()}
        ></atomic-tab-button>
        <atomic-tab-button
          label="Tab 2"
          .active=${false}
          .select=${vi.fn()}
        ></atomic-tab-button>
      </atomic-tab-bar>`
    );
    await element.updateComplete;
  });

  it('should render', async () => {
    await expect.element(element).toBeInTheDocument();
  });

  it('should have overflow clip styles', async () => {
    expect(element.style.overflow).toBe('clip');
    expect(element.style.overflowY).toBe('visible');
  });

  it('should render the tab popover', async () => {
    const popover = element.shadowRoot!.querySelector('atomic-tab-popover');
    expect(popover).toBeTruthy();
  });

  it('should render slotted tab buttons', async () => {
    const slot = element.shadowRoot!.querySelector('slot');
    expect(slot).toBeTruthy();
  });

  it('should set up resize observer on connect', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
    expect((element as any).resizeObserver).toBeTruthy();
  });

  it('should disconnect resize observer on disconnect', async () => {
    const disconnectSpy = vi.spyOn(
      // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
      (element as any).resizeObserver!,
      'disconnect'
    );
    element.remove();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should listen to atomic/tabRendered events', async () => {
    const addEventListenerSpy = vi.spyOn(element, 'addEventListener');
    element.connectedCallback();
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'atomic/tabRendered',
      expect.any(Function)
    );
  });

  it('should remove atomic/tabRendered listener on disconnect', async () => {
    const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');
    element.disconnectedCallback();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'atomic/tabRendered',
      expect.any(Function)
    );
  });
});
