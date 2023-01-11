import {
  Result,
  buildQuickview,
  Quickview,
  QuickviewState,
} from '@coveo/headless';
import {Component, h, State} from '@stencil/core';
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

  private quickviewModalRef?: HTMLAtomicQuickviewModalElement;

  public initialize() {
    this.quickview = buildQuickview(this.bindings.engine, {
      options: {result: this.result},
    });
    this.handleQuickviewNavigation();
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
