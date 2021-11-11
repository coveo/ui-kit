import {Component, h, Host, Listen, State} from '@stencil/core';

export interface UpdateLiveRegionEventArgs {
  region: string;
  message: string;
}

/**
 * The `atomic-aria-live` component notifies screen readers of changes in the search interface.
 * @internal
 */
@Component({
  tag: 'atomic-aria-live',
  shadow: false,
})
export class AtomicAriaLive {
  @State() public regions: Record<string, string> = {};

  @Listen('atomic/accessibility/updateLiveRegion', {target: 'document'})
  protected updateMessage({
    detail: {message, region},
  }: CustomEvent<UpdateLiveRegionEventArgs>) {
    this.regions = {...this.regions, [region]: message};
  }

  public render() {
    return (
      <Host style={{position: 'absolute', right: '10000px'}}>
        {Object.entries(this.regions).map(([region, message]) => (
          <div
            role="status"
            aria-live="polite"
            id={`atomic-aria-region-${region}`}
          >
            {message}
          </div>
        ))}
      </Host>
    );
  }
}
