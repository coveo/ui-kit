import {Component, h, Prop, State} from '@stencil/core';
import {
  ResultsPerPage,
  buildResultsPerPage,
  ResultsPerPageState,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

/**
 * @part list - The list of buttons
 * @part page-button - The page button
 * @part active-page-button - The active page button
 * @part label - The "Results per page" label
 */
@Component({
  tag: 'atomic-results-per-page',
  styleUrl: 'atomic-results-per-page.pcss',
  shadow: true,
})
export class AtomicResultsPerPage implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private resultPerPage!: ResultsPerPage;

  @State()
  @BindStateToController('resultPerPage')
  public resultPerPageState!: ResultsPerPageState;
  @State() public error!: Error;

  // TODO: validate props
  /**
   * List of possible results per page options, separated by commas
   */
  @Prop() options = '10,25,50,100';
  /**
   * Initial value of the result per page option
   */
  @Prop() initialOption = 10;

  public initialize() {
    this.resultPerPage = buildResultsPerPage(this.bindings.engine, {
      initialState: {numberOfResults: this.initialOption},
    });
  }

  private get optionsList() {
    return this.options.split(',').map((value) => {
      const num = parseInt(value);
      const isSelected = this.resultPerPage.isSetTo(num);
      const className = isSelected ? 'active' : '';
      return (
        <li class={className}>
          <button
            part={`page-button ${isSelected && 'active-page-button'}`}
            onClick={() => this.resultPerPage.set(num)}
          >
            {num}
          </button>
        </li>
      );
    });
  }

  public render() {
    return (
      <nav aria-label="Results per page">
        <span part="label">Results per page</span>
        <ul part="list">{this.optionsList}</ul>
      </nav>
    );
  }
}
