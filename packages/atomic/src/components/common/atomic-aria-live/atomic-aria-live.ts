import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import type {FindAriaLiveEventArgs} from '../../../utils/accessibility-utils';
import {buildDebouncedQueue} from '../../../utils/debounce-utils';
import {randomID} from '../../../utils/utils';

type Regions = {[regionName: string]: {assertive: boolean; message: string}};

/**
 * @internal
 * The `atomic-aria-live` component notifies screen readers of changes in the search and commerce interfaces.
 */
@customElement('atomic-aria-live')
export class AtomicAriaLive extends LitElement {
  createRenderRoot() {
    return this;
  }
  @state() private regions: Readonly<Regions> = {};

  private messagesQueue = buildDebouncedQueue({delay: 500});
  private ariaLiveId!: string;

  connectedCallback() {
    super.connectedCallback();
    this.ariaLiveId = randomID('atomic-aria-live-');

    document.addEventListener(
      'atomic/accessibility/findAriaLive',
      this.onFindAriaLive
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.messagesQueue.clear();
    document.removeEventListener(
      'atomic/accessibility/findAriaLive',
      this.onFindAriaLive
    );
  }

  private onFindAriaLive = (event: Event) => {
    const customEvent = event as CustomEvent<FindAriaLiveEventArgs>;
    customEvent.detail.element = this;
  };

  /**
   * @internal
   */
  public updateMessage(region: string, message: string, assertive: boolean) {
    const updateRegion = () => {
      this.regions = {...this.regions, [region]: {assertive, message}};
    };

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
  public registerRegion(region: string, assertive: boolean) {
    if (region in this.regions) {
      return;
    }
    this.regions = {...this.regions, [region]: {assertive, message: ''}};
  }

  render() {
    const hostStyles = {
      position: 'absolute',
      display: 'block',
      height: '0',
      overflow: 'hidden',
      margin: '0',
    };

    return html`
      <div style=${styleMap(hostStyles)}>
        ${Object.entries(this.regions).map(
          ([regionName, {assertive, message}]) => html`
            <div
              id="${this.ariaLiveId}-${regionName}"
              aria-live="${assertive ? 'assertive' : 'polite'}"
              role="status"
            >
              ${message}
            </div>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-aria-live': AtomicAriaLive;
  }
}
