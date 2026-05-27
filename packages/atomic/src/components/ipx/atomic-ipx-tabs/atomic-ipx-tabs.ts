import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {SlotsForNoShadowDOMMixin} from '../../../mixins/slots-for-no-shadow-dom-mixin';
import '@/src/components/common/atomic-tab-bar/atomic-tab-bar';

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
    'atomic-ipx-tabs': AtomicIpxTabs;
  }
}
