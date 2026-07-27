import type {Tab as InsightTab, TabState as InsightTabState} from '@coveo/headless/insight';
import {buildTab as buildInsightTab} from '@coveo/headless/insight';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {dispatchTabLoaded, type TabCommon} from '@/src/components/common/tabs/tab-common';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {randomID} from '@/src/utils/utils';

/**
 * The `atomic-insight-tab` component represents an individual tab within the insight interface.
 *
 * @internal
 */
@customElement('atomic-insight-tab')
@bindings()
@withTailwindStyles
export class AtomicInsightTab
  extends LitElement
  implements TabCommon, InitializableComponent<InsightBindings>
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

  @state() public bindings!: InsightBindings;
  @state() public error!: Error;
  @bindStateToController('tab')
  @state()
  private tabState!: InsightTabState;
  public tab!: InsightTab;

  @state() private isAppLoaded = false;

  private tabId = randomID('insight-tab');

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
    this.tab = buildInsightTab(this.bindings.engine, {
      options: {expression: this.expression, id: this.tabId},
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
    const tabs = Array.from(tablist.querySelectorAll<HTMLElement>('[role="tab"]'));
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

  @errorGuard()
  @bindingGuard()
  render() {
    return html`<span part="tab" title=${this.label}
      >${when(this.isAppLoaded, () => this.label)}</span
    >`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-tab': AtomicInsightTab;
  }
}
