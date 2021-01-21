import {Component, h, Prop, State} from '@stencil/core';
import {
  ResultsPerPage,
  ResultsPerPageState,
  buildResultsPerPage,
} from '@coveo/headless';
import {
  Initialization,
  Bindings,
  AtomicComponentInterface,
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
export class AtomicResultsPerPage implements AtomicComponentInterface {
  @State() controllerState!: ResultsPerPageState;

  public bindings!: Bindings;
  public controller!: ResultsPerPage;

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
    this.controller = buildResultsPerPage(this.bindings.engine, {
      initialState: {numberOfResults: this.initialOption},
    });
  }

  private get optionsList() {
    return this.options.split(',').map((value) => {
      const num = parseInt(value);
      const isSelected = this.controller.isSetTo(num);
      const className = isSelected ? 'active' : '';
      return (
        <li class={className}>
          <button
            part={`page-button ${isSelected && 'active-page-button'}`}
            onClick={() => this.controller.set(num)}
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
