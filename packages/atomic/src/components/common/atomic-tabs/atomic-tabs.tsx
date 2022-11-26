import {Component, Element, h} from '@stencil/core';

/**
 * @internal
 */
@Component({
  tag: 'atomic-tabs',
  styleUrl: './atomic-tabs.pcss',
  shadow: true,
})
export class AtomicTabs {
  @Element() host!: HTMLElement;

  private scrollCallback = (e: Event) => {
    e.preventDefault();
    this.host.scrollLeft += (e as WheelEvent).deltaY;
  };

  public connectedCallback() {
    this.host.addEventListener('mousewheel', this.scrollCallback);
  }
  public disconnectedCallback() {
    this.host.removeEventListener('mousewheel', this.scrollCallback);
  }

  public render() {
    return (
      <div class="flex">
        <slot></slot>
      </div>
    );
  }
}
