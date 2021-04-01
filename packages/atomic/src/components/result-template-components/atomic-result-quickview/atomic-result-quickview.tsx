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
  shadow: false,
})
export class AtomicResultQuickview implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  private quickview!: Quickview;

  @BindStateToController('quickview')
  @State()
  private quickviewState!: QuickviewState;

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

  public render() {
    if (!this.quickviewState.resultHasPreview) {
      return this.removeComponent();
    }

    if (!this.quickviewState.content) {
      return (
        <button onClick={() => this.quickview.fetchResultContent()}>
          Open Quickview
        </button>
      );
    }

    return <iframe srcDoc={this.quickviewState.content}></iframe>;
  }
}
