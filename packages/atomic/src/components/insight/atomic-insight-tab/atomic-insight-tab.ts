import type {
  Tab as InsightTab,
  TabState as InsightTabState,
} from '@coveo/headless/insight';
import {buildTab as buildInsightTab} from '@coveo/headless/insight';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {
  dispatchTabLoaded,
  type TabCommon,
} from '@/src/components/common/tabs/tab-common';
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
    .active::after {
      @apply bg-primary absolute bottom-0 block h-1 w-full rounded;
      content: '';
    }

    [part='tab'] {
      @apply relative mt-1 mr-6 pb-3 font-semibold;
      max-width: 150px;
      text-overflow: ellipsis;
      overflow: hidden;
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
    this.setAttribute('role', 'tab');
    if (!this.hasAttribute('tabindex')) {
      this.tabIndex = this.active ? 0 : -1;
    }
    this.addEventListener('keydown', this.handleKeydown);
    this.addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeydown);
    this.removeEventListener('click', this.handleClick);
  }

  private handleClick = () => {
    this.tab?.select();
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.tab?.select();
    } else if (
      event.key === 'ArrowRight' ||
      event.key === 'ArrowLeft' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      event.preventDefault();
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
      let nextIndex: number;
      if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else {
        nextIndex = tabs.length - 1;
      }
      tabs[nextIndex].focus();
    }
  };

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
    this.tab.select();
  }

  protected updated() {
    if (this.tabState) {
      this.active = this.tabState.isActive;
      this.setAttribute('role', 'tab');
      this.setAttribute(
        'aria-selected',
        this.tabState.isActive ? 'true' : 'false'
      );
      this.tabIndex = this.tabState.isActive ? 0 : -1;
    }
    dispatchTabLoaded(this);
  }

  @errorGuard()
  @bindingGuard()
  render() {
    return html`${when(
      this.isAppLoaded,
      () =>
        html`<span
          part="tab"
          class="btn-text-transparent ${this.tabState.isActive ? 'active' : ''}"
          aria-label=${this.bindings.i18n.t('tab-search', {label: this.label})}
          title=${this.label}
          aria-hidden="true"
          >${this.label}</span
        >`
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-tab': AtomicInsightTab;
  }
}
