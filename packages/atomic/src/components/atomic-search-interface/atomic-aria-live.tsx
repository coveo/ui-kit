import {Component, h, Host, State, Element, Method} from '@stencil/core';
import {
  FindAriaLiveEventArgs,
  findAriaLiveEventName,
} from '../../utils/accessibility-utils';

/**
 * The `atomic-aria-live` component notifies screen readers of changes in the search interface.
 *
 * We do not recommend dynamically adding/removing this component from the page. It is better to have this component during the initial render of the page.
 */
@Component({
  tag: 'atomic-aria-live',
  shadow: false,
})
export class AtomicAriaLive {
  @Element() private host!: HTMLAtomicAriaLiveElement;
  @State() private message = '';

  private lastUpdatedRegion?: string;
  private disconnectFindAriaLiveEvent?: () => void;

  protected onFindAriaLive(args: FindAriaLiveEventArgs) {
    if (!args.element || !this.isInSearchInterface) {
      args.element = this.host;
    }
  }

  private get isInSearchInterface() {
    let element: Element | null = this.host;
    while (element) {
      if (element.tagName === 'ATOMIC-SEARCH-INTERFACE') {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  /**
   * @internal
   */
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
    document.addEventListener(findAriaLiveEventName, eventListener);
    this.disconnectFindAriaLiveEvent = () =>
      document.removeEventListener(findAriaLiveEventName, eventListener);
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
