import type {Tab, TabState} from '@coveo/headless';
import {buildTab} from '@coveo/headless';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {
  dispatchTabLoaded,
  type TabCommon,
} from '@/src/components/common/tabs/tab-common';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';

/**
 * The `atomic-ipx-tab` component represents an individual tab within the IPX interface.
 *
 * @internal
 */
@customElement('atomic-ipx-tab')
@bindings()
@withTailwindStyles
export class AtomicIpxTab
  extends LitElement
  implements TabCommon, InitializableComponent<Bindings>
{
  static styles = css`
    @reference '../../../utils/tailwind.global.tw.css';

    :host {
      display: flex;
      @apply cursor-pointer;
      @apply focus-visible:outline-none;
    }

    [part='tab'] {
      @apply relative mt-1 mr-6 pb-3 font-semibold;
      @apply text-on-background;
      max-width: 150px;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    :host(:hover) [part='tab'],
    :host(:focus-visible) [part='tab'] {
      @apply text-primary;
    }

    :host([active]) [part='tab']::after {
      @apply bg-primary absolute bottom-0 block h-1 w-full rounded;
      content: '';
    }
  `;

  /**
   * The label that will be shown to the user.
   */
  @property({type: String, reflect: true}) public label = 'no-label';

  /**
   * Whether this tab is active upon rendering.
   * If multiple tabs are set to active on render, the last one to be rendered will override the others.
   */
  @property({type: Boolean, reflect: true, attribute: 'active'})
  public active = false;

  /**
   * The expression that will be passed to the search as a `cq` parameter upon being selected.
   */
  @property({type: String}) public expression!: string;

  @state() public bindings!: Bindings;
  @state() public error!: Error;
  @bindStateToController('tab')
  @state()
  private tabState!: TabState;
  public tab!: Tab;

  @state() private isAppLoaded = false;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeydown);
    this.updateHostAttributes();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeydown);
  }

  public initialize() {
    this.tab = buildTab(this.bindings.engine, {
      options: {expression: this.expression, id: this.label},
      initialState: {isActive: this.active},
    });
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  /**
   * Activates the tab.
   */
  public select() {
    this.tab?.select();
  }

  protected updated() {
    if (this.tabState) {
      this.active = this.tabState.isActive;
      this.updateHostAttributes();
    }
    dispatchTabLoaded(this);
  }

  private updateHostAttributes() {
    this.setAttribute('role', 'tab');
    this.setAttribute('aria-selected', this.active ? 'true' : 'false');
    this.tabIndex = this.active ? 0 : -1;
  }

  private handleClick = () => {
    this.tab?.select();
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.tab?.select();
      return;
    }

    const tablist = this.closest('[role="tablist"]');
    if (!tablist) {
      return;
    }
    const tabs = Array.from(
      tablist.querySelectorAll<HTMLElement>('[role="tab"]')
    );
    const currentIndex = tabs.indexOf(this);
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
      tabs.forEach((tab, index) => {
        tab.tabIndex = index === nextIndex ? 0 : -1;
      });
      tabs[nextIndex].focus();
    }
  };

  render() {
    return html`<span part="tab" tabindex="-1" title=${this.label}
      >${when(this.isAppLoaded, () => this.label)}</span
    >`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-tab': AtomicIpxTab;
  }
}
