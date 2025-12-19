import {buildTab, Tab, TabState, Unsubscribe} from '@coveo/headless';
import {Component, h, Prop, State, Element, Method} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {createAppLoadedListener} from '../../common/interface/store';
import {Button} from '../../common/stencil-button';
import {dispatchTabLoaded} from '../../common/tabs/tab-common';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-ipx-tab',
  styleUrl: './atomic-ipx-tab.pcss',
  shadow: true,
})
export class AtomicIPXTab implements InitializableComponent {
  private tab!: Tab;

  @Element() host!: HTMLElement;

  @InitializeBindings() public bindings!: Bindings;

  @State() public error!: Error;
  @State() private isAppLoaded = false;

  @BindStateToController('tab')
  @State()
  private tabState!: TabState;

  /**
   * The label that will be shown to the user.
   */
  @Prop({reflect: true}) public label = 'no-label';

  /**
   * Whether this tab is active upon rendering.
   * If multiple tabs are set to active on render, the last one to be rendered will override the others.
   */
  @Prop({reflect: true, mutable: true}) public active = false;

  /**
   * The expression that will be passed to the search as a `cq` parameter upon being selected.
   */
  @Prop() public expression!: string;

  private unsubscribe: Unsubscribe = () => {};

  /**
   * Activates the tab.
   */
  @Method()
  public async select() {
    this.tab.select();
  }

  public initialize() {
    this.tab = buildTab(this.bindings.engine, {
      options: {expression: this.expression, id: this.label},
      initialState: {isActive: this.active},
    });
    this.unsubscribe = this.tab.subscribe(
      () => (this.active = this.tab.state.isActive)
    );
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  public componentDidRender() {
    dispatchTabLoaded(this.host);
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  public render() {
    if (!this.isAppLoaded) {
      return;
    }

    const buttonClasses = ['relative', 'pb-3', 'mt-1', 'mr-6', 'font-semibold'];
    if (this.tabState.isActive) {
      buttonClasses.push('active');
    }

    return (
      <Button
        style="text-transparent"
        part="tab"
        class={buttonClasses.join(' ')}
        ariaLabel={this.bindings.i18n.t('tab-search', {label: this.label})}
        title={this.label}
        ariaPressed={`${this.tabState.isActive}`}
        onClick={() => this.tab.select()}
      >
        {this.label}
      </Button>
    );
  }
}
