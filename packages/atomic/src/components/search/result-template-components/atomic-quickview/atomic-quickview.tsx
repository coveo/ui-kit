import {Schema, StringValue} from '@coveo/bueno';
import {
  Result,
  buildQuickview,
  Quickview,
  QuickviewState,
} from '@coveo/headless';
import {Component, h, Prop, State} from '@stencil/core';
import QuickviewIcon from '../../../../images/quickview.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Button} from '../../../common/button';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '../result-template-decorators';

/**
 * TODO
 *
 * @internal
 */
@Component({
  tag: 'atomic-quickview',
  styleUrl: 'atomic-quickview.pcss',
  shadow: true,
})
export class AtomicQuickview implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;

  @State() public error!: Error;

  public quickview!: Quickview;

  @BindStateToController('quickview')
  @State()
  public quickviewState!: QuickviewState;

  /**
   * The `sandbox` attribute to apply to the quickview iframe.
   *
   * The quickview is loaded inside an iframe with a [`sandbox`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox) attribute for security reasons.
   *
   * This attribute exists primarily to protect against potential XSS attacks that could originate from the document being displayed.
   *
   * By default, the sandbox attributes are: `allow-popups allow-top-navigation allow-same-origin`.
   *
   * `allow-same-origin` is not optional, and must always be included in the list of allowed capabilities for the component to function properly.
   */
  @Prop() public sandbox =
    'allow-popups allow-top-navigation allow-same-origin';

  private quickviewModalRef?: HTMLAtomicQuickviewModalElement;

  public initialize() {
    this.quickview = buildQuickview(this.bindings.engine, {
      options: {result: this.result},
    });
    this.handleQuickviewNavigation();
    new Schema({
      sandbox: new StringValue({
        required: true,
        regex: /allow-same-origin/,
      }),
    }).validate({sandbox: this.sandbox});
  }

  public disconnectedCallback(): void {
    this.quickviewModalRef?.reset();
  }

  private handleQuickviewNavigation() {
    this.bindings.store.onChange('currentQuickviewPosition', (quickviewPos) => {
      const quickviewsInfoFromResultList =
        this.bindings.store.get('resultList')?.quickviews;

      if (!quickviewsInfoFromResultList) {
        return;
      }

      const isCurrentQuickview =
        quickviewsInfoFromResultList.position[quickviewPos] ===
        this.resultIndex;

      if (isCurrentQuickview) {
        this.quickview.fetchResultContent();
      }
    });
  }

  private addQuickviewModalIfNeeded() {
    if (this.quickviewModalRef) {
      return;
    }

    const quickviewModal = this.bindings.interfaceElement.querySelector(
      'atomic-quickview-modal'
    );
    if (quickviewModal) {
      this.quickviewModalRef = quickviewModal;
      return;
    }

    this.quickviewModalRef = document.createElement('atomic-quickview-modal');
    this.quickviewModalRef.setAttribute('sandbox', this.sandbox);
    this.bindings.interfaceElement.appendChild(this.quickviewModalRef);
  }

  private updateModalContent() {
    if (this.quickviewModalRef && this.quickview.state.content) {
      this.quickviewModalRef.content = this.quickview.state.content;
      this.quickviewModalRef.result = this.result;
    }
  }

  private get resultIndex() {
    return this.bindings.engine.state.search.results.findIndex(
      (r) => r.uniqueId === this.result.uniqueId
    );
  }

  private onClick() {
    this.quickview.fetchResultContent();

    const quickviewsInfoFromResultList =
      this.bindings.store.get('resultList')?.quickviews;

    if (!quickviewsInfoFromResultList) {
      return;
    }
    this.bindings.store.set(
      'currentQuickviewPosition',
      quickviewsInfoFromResultList.position.indexOf(this.resultIndex)
    );
  }

  public render() {
    this.addQuickviewModalIfNeeded();
    this.updateModalContent();
    if (this.quickviewState.resultHasPreview) {
      return (
        <Button
          title={this.bindings.i18n.t('quickview')}
          style="outline-primary"
          class="p-2"
          onClick={() => this.onClick()}
        >
          <atomic-icon class="w-5" icon={QuickviewIcon}></atomic-icon>
        </Button>
      );
    }
  }
}
