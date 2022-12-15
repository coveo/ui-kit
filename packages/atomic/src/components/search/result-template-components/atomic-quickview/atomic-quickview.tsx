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

  public render() {
    this.addQuickviewModalIfNeeded();
    this.updateModalContent();
    if (this.result.hasHtmlVersion) {
      return (
        <Button
          title={this.bindings.i18n.t('quickview')}
          style="outline-primary"
          class="p-2"
          onClick={() => {
            this.quickview.fetchResultContent();
          }}
        >
          <atomic-icon class="w-5" icon={QuickviewIcon}></atomic-icon>
        </Button>
      );
    }
  }
}
