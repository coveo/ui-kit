import {Component, Prop, Listen} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';
import {
  AtomicInterface,
  InitializeEvent,
  initializeEventName,
} from '../../../utils/initialization-utils';

/**
 * The `atomic-external` component allows components defined outside of the `atomic-search-interface` to initialize.
 */
@Component({
  tag: 'atomic-external',
  shadow: false,
})
export class AtomicExternal {
  /**
   * The CSS selector that identifies the `atomic-search-interface` component with which to initialize the external components.
   */
  @Prop({reflect: true}) selector = 'atomic-search-interface';
  @Listen('atomic/initializeComponent')
  public handleInitialization(event: InitializeEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.#interface.dispatchEvent(
      buildCustomEvent(initializeEventName, event.detail)
    );
  }

  @Listen('atomic/scrollToTop')
  public handleScrollToTop(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.#interface.dispatchEvent(
      buildCustomEvent('atomic/scrollToTop', event.detail)
    );
  }

  /**
   * Represents the bound interface for the AtomicExternal component.
   */
  @Prop({mutable: true}) boundInterface?: AtomicInterface;

  get #interface() {
    if (!this.boundInterface) {
      this.boundInterface = document.querySelector(this.selector) ?? undefined;
      if (!this.boundInterface) {
        throw new Error(
          `Cannot find interface element with selector "${this.selector}"`
        );
      }
    }

    return this.boundInterface!;
  }
}
