import type {Unsubscribe} from '@coveo/headless';
import {
  buildTab as buildInsightTab,
  type Tab as InsightTab,
  type TabState as InsightTabState,
} from '@coveo/headless/insight';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {randomID} from '../../../utils/utils';
import {renderButton} from '../../common/button';
import {createAppLoadedListener} from '../../common/interface/store';
import {dispatchTabLoaded, type TabCommon} from '../../common/tabs/tab-common';
import type {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@customElement('atomic-insight-tab')
@bindings()
@withTailwindStyles
export class AtomicInsightTab
  extends LitElement
  implements TabCommon, InitializableComponent<InsightBindings>
{
  private tabId = randomID('insight-tab');
  private unsubscribe: Unsubscribe = () => {};

  @state() public bindings!: InsightBindings;
  @state() public error!: Error;
  @state() private isAppLoaded = false;

  @bindStateToController('tab')
  @state()
  private tabState!: InsightTabState;

  /**
   * The label that will be shown to the user.
   */
  @property({reflect: true}) public label = 'no-label';

  /**
   * Whether this tab is active upon rendering.
   * If multiple tabs are set to active on render, the last one to be rendered will override the others.
   */
  @property({reflect: true, type: Boolean}) public active = false;

  /**
   * The expression that will be passed to the search as a `cq` paramenter upon being selected.
   */
  @property() public expression!: string;

  public tab!: InsightTab;

  /**
   * Activates the tab.
   */
  async select() {
    this.tab.select();
  }

  public initialize() {
    this.tab = buildInsightTab(this.bindings.engine, {
      options: {expression: this.expression, id: this.tabId},
      initialState: {isActive: this.active},
    });
    this.unsubscribe = this.tab.subscribe(() => {
      this.active = this.tab.state.isActive;
    });
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  connectedCallback() {
    super.connectedCallback();
  }

  updated() {
    dispatchTabLoaded(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe();
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(this.isAppLoaded, () =>
      renderButton({
        props: {
          style: 'text-transparent',
          part: 'tab',
          class: `relative mt-1 mr-6 pb-3 font-semibold max-w-[150px] text-ellipsis overflow-hidden ${
            this.tabState.isActive
              ? 'after:content-[""] after:bg-primary after:absolute after:bottom-0 after:block after:h-1 after:w-full after:rounded'
              : ''
          }`,
          ariaLabel: this.bindings.i18n.t('tab-search', {label: this.label}),
          title: this.label,
          ariaPressed: this.tabState.isActive ? 'true' : 'false',
          onClick: () => this.tab.select(),
        },
      })(html`${this.label}`)
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-tab': AtomicInsightTab;
  }
}
