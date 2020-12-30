import {Component, h, Prop, State} from '@stencil/core';
import {
  ResultsPerPage,
  ResultsPerPageState,
  Unsubscribe,
  buildResultsPerPage,
  Engine,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

/**
 * @part list - The list of buttons
 * @part page-button - The page button
 * @part active-page-button - The active page button
 * @part label - The "Results per page" label
 */
@Component({
  tag: 'atomic-results-per-page',
  styleUrl: 'atomic-results-per-page.scss',
  shadow: true,
})
export class AtomicResultsPerPage {
  @Prop({mutable: true}) engine!: Engine;
  @State() state!: ResultsPerPageState;

  private resultsPerPage!: ResultsPerPage;
  private unsubscribe: Unsubscribe = () => {};

  // TODO: validate props
  /**
   * List of possible results per page options, separated by commas
   */
  @Prop() options = '10,25,50,100';
  /**
   * Initial value of the result per page option
   */
  @Prop() initialOption = 10;

  @Initialization()
  public initialize() {
    this.resultsPerPage = buildResultsPerPage(this.engine, {
      initialState: {numberOfResults: this.initialOption},
    });
    this.unsubscribe = this.resultsPerPage.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.resultsPerPage.state;
  }

  private get optionsList() {
    return this.options.split(',').map((value) => {
      const num = parseInt(value);
      const isSelected = this.resultsPerPage.isSetTo(num);
      const className = isSelected ? 'active' : '';
      return (
        <li class={`page-item ${className}`}>
          <button
            part={`page-button ${isSelected && 'active-page-button'}`}
            class="page-link"
            onClick={() => this.resultsPerPage.set(num)}
          >
            {num}
          </button>
        </li>
      );
    });
  }

  public render() {
    return (
      <nav aria-label="Results per page" class="d-flex align-items-center">
        <span class="mr-3" part="label">
          Results per page
        </span>
        <ul class="pagination mb-0" part="list">
          {this.optionsList}
        </ul>
      </nav>
    );
  }
}
