import {
  Component,
  h,
  Host,
  State,
  Element,
  Method,
  Listen,
} from '@stencil/core';
import {buildDebouncedQueue} from '../../../utils/debounce-utils';
import {FindAriaLiveEventArgs} from '../../../utils/stencil-accessibility-utils';
import {randomID} from '../../../utils/utils';

type Regions = {[regionName: string]: {assertive: boolean; message: string}};

/**
 * The `atomic-aria-live` component notifies screen readers of changes in the search interface.
 */
@Component({
  tag: 'atomic-aria-live',
  shadow: false,
})
export class AtomicAriaLive {
  @Element() private host!: HTMLAtomicAriaLiveElement;
  @State() private regions: Readonly<Regions> = {};

  private messagesQueue = buildDebouncedQueue({delay: 500});
  private id = randomID('aria-live-');

  @Listen('atomic/accessibility/findAriaLive', {target: 'document'})
  protected onFindAriaLive({detail: args}: CustomEvent<FindAriaLiveEventArgs>) {
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
  public async updateMessage(
    region: string,
    message: string,
    assertive: boolean
  ) {
    const updateRegion = () =>
      (this.regions = {...this.regions, [region]: {assertive, message}});

    if (message) {
      this.messagesQueue.enqueue(updateRegion, region);
    } else {
      this.messagesQueue.cancelActionIfQueued(region);
      updateRegion();
    }
  }

  /**
   * @internal
   */
  @Method()
  public async registerRegion(region: string, assertive: boolean) {
    if (region in this.regions) {
      return;
    }
    this.regions = {...this.regions, [region]: {assertive, message: ''}};
  }

  public disconnectedCallback() {
    this.messagesQueue.clear();
  }

  public render() {
    return (
      <Host
        style={{
          position: 'absolute',
          display: 'block',
          height: '0',
          overflow: 'hidden',
          margin: '0',
        }}
      >
        {Object.entries(this.regions).map(
          ([regionName, {assertive, message}]) => (
            <div
              key={regionName}
              id={`${this.id}-${regionName}`}
              aria-live={assertive ? 'assertive' : 'polite'}
              role="status"
            >
              {message}
            </div>
          )
        )}
      </Host>
    );
  }
}
