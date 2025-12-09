import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {SlotsForNoShadowDOMMixin} from '../../../mixins/slots-for-no-shadow-dom-mixin';

/**
 * The `atomic-insight-tabs` component wraps a list of `atomic-insight-tab` elements and manages their layout.
 * This is an internal component used within the Insight Panel interface.
 *
 * @internal
 * @slot default - The slot for `atomic-insight-tab` elements.
 */
@customElement('atomic-insight-tabs')
@bindings()
export class AtomicInsightTabs
  extends LightDomMixin(SlotsForNoShadowDOMMixin(LitElement))
  implements InitializableComponent<InsightBindings>
{
  @state() public bindings!: InsightBindings;
  @state() public error!: Error;

  public initialize() {}

  @errorGuard()
  protected render() {
    return html`<atomic-tab-bar>${this.renderDefaultSlotContent()}</atomic-tab-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-tabs': AtomicInsightTabs;
  }
}
