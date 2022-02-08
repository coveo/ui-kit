import {Component, h, Host, State, Element, Method, Prop} from '@stencil/core';

export interface FindAriaLiveEventArgs {
  element?: HTMLAtomicAriaLiveElement;
}

/**
 * The `atomic-aria-live` component notifies screen readers of changes in the search interface.
 *
 * It is recommended not to dynamically add/remove this component from the page and try to have it exist on the initial render of the page.
 */
@Component({
  tag: 'atomic-aria-live',
  shadow: false,
})
export class AtomicAriaLive {
  @Element() private host!: HTMLAtomicAriaLiveElement;
  @State() private message = '';

  /**
   * Only the `atomic-aria-live` element with the greatest priority will be used to announce changes in the search interface.
   *
   * @internal
   */
  @Prop({reflect: true}) priority = 1;

  private lastUpdatedRegion?: string;
  private disconnectFindAriaLiveEvent?: () => void;

  protected onFindAriaLive(args: FindAriaLiveEventArgs) {
    if (args.element && args.element.priority > this.priority) {
      return;
    }
    args.element = this.host;
  }

  @Method()
  public async updateMessage(region: string, message: string) {
    const wouldOverwriteAnotherRegion = region !== this.lastUpdatedRegion;
    if (wouldOverwriteAnotherRegion) {
      this.lastUpdatedRegion = region;
      if (!message) {
        return;
      }
    }
    this.message = message;
  }

  public connectedCallback() {
    const eventListener = (ev: Event) =>
      this.onFindAriaLive((ev as CustomEvent<FindAriaLiveEventArgs>).detail);
    document.addEventListener(
      'atomic/accessibility/findAriaLive',
      eventListener
    );
    this.disconnectFindAriaLiveEvent = () =>
      document.removeEventListener(
        'atomic/accessibility/findAriaLive',
        eventListener
      );
  }

  public disconnectedCallback() {
    this.disconnectFindAriaLiveEvent?.();
  }

  public render() {
    return (
      <Host
        style={{position: 'absolute', right: '10000px'}}
        aria-live="polite"
        role="status"
      >
        {this.message}
      </Host>
    );
  }
}
