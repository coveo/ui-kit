import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';

/**
 * @internal
 * The `atomic-ipx-tabs` component is a wrapper around `atomic-tab-bar` for IPX interfaces.
 *
 * @slot (default) - The tab elements to display within the tab bar.
 */
@customElement('atomic-ipx-tabs')
@bindings()
export class AtomicIPXTabs
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @state() public bindings!: Bindings;
  @state() public error!: Error;

  public initialize() {
    // No initialization needed for this wrapper component
  }

  render() {
    return html` <atomic-tab-bar> <slot></slot> </atomic-tab-bar> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-tabs': AtomicIPXTabs;
  }
}
