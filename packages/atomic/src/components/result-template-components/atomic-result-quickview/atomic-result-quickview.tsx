import {Component, State, h, Element} from '@stencil/core';
import {
  Result,
  buildQuickview,
  QuickviewState,
  Quickview,
} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';

/**
 * The ResultQuickview component renders a preview of the result.
 */
@Component({
  tag: 'atomic-result-quickview',
  styleUrl: 'atomic-result-quickview.pcss',
  shadow: false,
})
export class AtomicResultQuickview implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  private quickview!: Quickview;

  @BindStateToController('quickview')
  @State()
  private quickviewState!: QuickviewState;

  @State() private isModalOpen = false;

  @ResultContext() private result!: Result;

  @Element() private host!: HTMLElement;

  public initialize() {
    const engine = this.bindings.engine;
    const result = this.result;

    this.quickview = buildQuickview(engine, {
      options: {result},
    });
  }

  private removeComponent() {
    this.host.remove();
  }

  private openModal() {
    this.quickview.fetchResultContent();
    this.isModalOpen = true;
  }

  private closeModal() {
    this.isModalOpen = false;
  }

  private get modal() {
    return (
      <atomic-modal handleClose={() => this.closeModal()}>
        <iframe
          class="w-full h-full"
          srcDoc={this.quickviewState.content}
        ></iframe>
        ;
      </atomic-modal>
    );
  }

  public render() {
    if (!this.quickviewState.resultHasPreview) {
      return this.removeComponent();
    }

    const button = <button onClick={() => this.openModal()}>view</button>;

    if (this.isModalOpen && this.quickviewState.content) {
      return [button, this.modal];
    }

    return button;
  }
}
