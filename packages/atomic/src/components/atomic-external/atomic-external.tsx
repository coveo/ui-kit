import {Component, Prop, Listen} from '@stencil/core';
import {buildCustomEvent} from '../../utils/event-utils';
import {
  InitializeEvent,
  initializeEventName,
} from '../../utils/initialization-utils';
/**
 * The `atomic-external` component allows to initialize components outside a search interface.
 */
@Component({
  tag: 'atomic-external',
  shadow: false,
})
export class AtomicExternal {
  @Prop() selector = 'atomic-search-interface';
  @Listen('atomic/initializeComponent')
  public handleInitialization(event: InitializeEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.interface.dispatchEvent(
      buildCustomEvent(initializeEventName, event.detail)
    );
  }

  private get interface() {
    const element = document.querySelector(this.selector);
    if (!element) {
      throw new Error(
        `Cannot find interface element with selector "${this.selector}"`
      );
    }

    return element;
  }
}
