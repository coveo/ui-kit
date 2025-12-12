import type {Tab, TabState} from '@coveo/headless';
import {buildTab} from '@coveo/headless';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {renderButton} from '@/src/components/common/button';
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

    .active::after {
      @apply bg-primary absolute bottom-0 block h-1 w-full rounded;
      content: '';
    }

    [part='tab'] {
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

  @state() public bindings!: Bindings;
  @state() public error!: Error;
  @bindStateToController('tab')
  @state()
  private tabState!: TabState;
  public tab!: Tab;

  @state() private isAppLoaded = false;

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
    this.tab.select();
  }

  protected updated() {
    if (this.tabState) {
      this.active = this.tabState.isActive;
    }
    dispatchTabLoaded(this);
  }

  render() {
    return when(
      this.isAppLoaded,
      () => {
        const buttonClasses = [
          'relative',
          'pb-3',
          'mt-1',
          'mr-6',
          'font-semibold',
        ];
        if (this.tabState.isActive) {
          buttonClasses.push('active');
        }

        return renderButton({
          props: {
            style: 'text-transparent',
            part: 'tab',
            class: buttonClasses.join(' '),
            ariaLabel: this.bindings.i18n.t('tab-search', {label: this.label}),
            title: this.label,
            ariaPressed: this.tabState.isActive ? 'true' : 'false',
            onClick: () => this.tab.select(),
          },
        })(html`${this.label}`);
      },
      () => nothing
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-tab': AtomicIpxTab;
  }
}
