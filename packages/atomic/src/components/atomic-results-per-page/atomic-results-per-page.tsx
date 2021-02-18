import {Component, h, Prop, State} from '@stencil/core';
import {
  ResultsPerPage,
  buildResultsPerPage,
  ResultsPerPageState,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
  BindStateToI18n,
} from '../../utils/initialization-utils';

/**
 * The ResultsPerPage component allows the end user to choose how many results to display per page.
 *
 * @part label - The "Results per page" label
 * @part buttons - The list of buttons
 * @part page-button - The page button
 * @part active-page-button - The active page button
 */
@Component({
  tag: 'atomic-results-per-page',
  styleUrl: 'atomic-results-per-page.pcss',
  shadow: true,
})
export class AtomicResultsPerPage implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private resultPerPage!: ResultsPerPage;
  public searchStatus!: SearchStatus;
  private choices!: number[];

  @State()
  @BindStateToController('resultPerPage')
  public resultPerPageState!: ResultsPerPageState;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @BindStateToI18n()
  @State()
  private strings = {
    resultsPerPage: () => this.bindings.i18n.t('resultsPerPage'),
    displayResultsPerPage: (results: number) =>
      this.bindings.i18n.t('displayResultsPerPage', {results}),
  };
  @State() public error!: Error;

  /**
   * List of possible results per page choices, separated by commas.
   */
  @Prop() choicesDisplayed = '10,25,50,100';
  /**
   * Initial choice for the number of result per page. Should be part of the `choicesDisplayed` option.
   */
  @Prop() initialChoice = 10;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.resultPerPage = buildResultsPerPage(this.bindings.engine, {
      initialState: {numberOfResults: this.initialChoice},
    });

    this.choices = this.validateChoicesDisplayed();
    this.validateInitialChoice();
  }

  private validateChoicesDisplayed() {
    return this.choicesDisplayed.split(',').map((choice) => {
      const parsedChoice = parseInt(choice);
      if (isNaN(parsedChoice)) {
        const errorMsg = `The choice value "${choice}" from the "choicesDisplayed" option is not a number.`;
        this.bindings.engine.logger.error(errorMsg, this);
        throw new Error(errorMsg);
      }

      return parsedChoice;
    });
  }

  private validateInitialChoice() {
    if (!this.choices.includes(this.initialChoice)) {
      const errorMsg = `The "initialChoice" option value "${this.initialChoice}" is not included in the "choicesDisplayed" option "${this.choicesDisplayed}".`;
      this.bindings.engine.logger.error(errorMsg, this);
      throw new Error(errorMsg);
    }
  }

  private buildChoice(choice: number) {
    const isSelected = this.resultPerPage.isSetTo(choice);
    const classes = isSelected
      ? 'text-on-primary bg-primary hover:bg-primary-variant'
      : 'text-on-background';

    return (
      <button
        role="radio"
        aria-label={this.strings.displayResultsPerPage(choice)}
        aria-checked={`${isSelected}`}
        class={`hover:underline ${classes}`}
        part={`page-button ${isSelected && 'active-page-button'}`}
        onClick={() => this.resultPerPage.set(choice)}
      >
        {choice}
      </button>
    );
  }

  public render() {
    if (!this.searchStatusState.hasResults) {
      return;
    }

    return (
      <div class="flex justify-between items-center">
        <span part="label" class="text-on-background pr-4 text-sm">
          {this.strings.resultsPerPage()}
        </span>
        <div
          part="buttons"
          role="radiogroup"
          aria-label={this.strings.resultsPerPage()}
          class="flex justify-between flex-grow	space-x-2"
        >
          {this.choices.map((choice) => this.buildChoice(choice))}
        </div>
      </div>
    );
  }
}
