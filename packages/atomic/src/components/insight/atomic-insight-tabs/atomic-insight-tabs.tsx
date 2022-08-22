import {Component, Element, h} from '@stencil/core';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-tabs',
  styleUrl: './atomic-insight-tabs.pcss',
  shadow: true,
})
export class AtomicInsightTabs {
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
    return <slot></slot>;
  }
}
