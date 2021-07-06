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
import {getRandomArbitrary} from '../../utils/utils';

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
      const opacity = `${getRandomArbitrary(0.3, 1)}`;
      placeholders.push(
        <div part="result" class="flex h-40 mb-14 animate-pulse">
          <div
            class="h-full rounded-lg w-40 mr-7 bg-neutral"
            style={{opacity}}
          ></div>
          <div class="flex-grow">
            <div
              class="w-4/6 h-8	rounded bg-neutral mb-6"
              style={{opacity}}
            ></div>
            <div
              class="w-full h-5	rounded bg-neutral mb-2"
              style={{opacity}}
            ></div>
            <div
              class="w-11/12 h-5	rounded bg-neutral mb-6"
              style={{opacity}}
            ></div>
            <div class="h-5 flex">
              <div
                class="bg-neutral w-1/5 mr-2 h-full rounded"
                style={{opacity}}
              ></div>
              <div
                class="bg-neutral w-1/5 mr-2 h-full rounded"
                style={{opacity}}
              ></div>
              <div
                class="bg-neutral w-1/5 mr-2 h-full rounded"
                style={{opacity}}
              ></div>
              <div
                class="bg-neutral w-1/5 mr-2 h-full rounded"
                style={{opacity}}
              ></div>
            </div>
          </div>
        </div>
      );
    }
    return <Host aria-hidden="true">{placeholders}</Host>;
  }
}
