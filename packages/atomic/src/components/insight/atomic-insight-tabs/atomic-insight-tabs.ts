import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {SlotsForNoShadowDOMMixin} from '../../../mixins/slots-for-no-shadow-dom-mixin';
import '@/src/components/common/atomic-tab-bar/atomic-tab-bar';

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
    return html`<atomic-tab-bar
      ><div role="tablist" @keydown=${this.handleTablistKeydown}>
        ${this.renderDefaultSlotContent()}
      </div></atomic-tab-bar
    >`;
  }

  private handleTablistKeydown(event: KeyboardEvent) {
    const tabs = Array.from(
      (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
        '[role="tab"]'
      )
    );
    const currentIndex = tabs.indexOf(event.target as HTMLElement);
    if (currentIndex === -1) {
      return;
    }

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      tabs[nextIndex].focus();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-tabs': AtomicInsightTabs;
  }
}
