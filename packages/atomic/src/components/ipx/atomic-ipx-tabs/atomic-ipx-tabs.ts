import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {SlotsForNoShadowDOMMixin} from '../../../mixins/slots-for-no-shadow-dom-mixin';

/**
 * @internal
 * The `atomic-ipx-tabs` component is a wrapper around `atomic-tab-bar` for IPX interfaces.
 *
 * @slot default - The tab elements to display within the tab bar.
 */
@customElement('atomic-ipx-tabs')
@bindings()
export class AtomicIpxTabs
  extends LightDomMixin(SlotsForNoShadowDOMMixin(LitElement))
  implements InitializableComponent<Bindings>
{
  @state() public bindings!: Bindings;
  @state() public error!: Error;

  public initialize() {}

  render() {
    return html`<atomic-tab-bar>${this.renderDefaultSlotContent()}</atomic-tab-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-tabs': AtomicIpxTabs;
  }
}
