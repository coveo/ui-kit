import {
  buildResultsPerPage,
  ResultsPerPage,
  ResultsPerPageState,
} from '@coveo/headless';
import {Component, h, Host, State} from '@stencil/core';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

/**
 * The `atomic-result-list-placeholder` component provides an intermediate visual state that is rendered before the first results are available.
 *
 * @part result - The placeholder for a single result.
 */
@Component({
  tag: 'atomic-result-list-placeholder',
  styleUrl: 'atomic-result-list-placeholder.pcss',
  shadow: true,
})
export class AtomicResultListPlaceholder implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public resultPerPage!: ResultsPerPage;

  @BindStateToController('resultPerPage')
  @State()
  private resultPerPageState!: ResultsPerPageState;

  @State() public error!: Error;

  public initialize() {
    this.resultPerPage = buildResultsPerPage(this.bindings.engine);
  }

  public render() {
    const placeholders = [];
    for (let i = 0; i < this.resultPerPageState.numberOfResults; i++) {
      placeholders.push(
        <div part="result" class="flex pl-5 pt-5 mb-5 animate-pulse">
          <div class="w-16 h-16 bg-divider mr-10"></div>
          <div class="flex-grow">
            <div>
              <div class="flex justify-between mb-5">
                <div class="h-4 bg-divider w-1/2"></div>
                <div class="h-3 bg-divider w-1/6"></div>
              </div>
              <div class="h-3 bg-divider w-4/6 mb-3"></div>
              <div class="h-3 bg-divider w-5/6 mb-3"></div>
              <div class="h-3 bg-divider w-5/12"></div>
            </div>
          </div>
        </div>
      );
    }
    return <Host aria-hidden="true">{placeholders}</Host>;
  }
}
