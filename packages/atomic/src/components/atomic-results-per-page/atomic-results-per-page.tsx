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
 * The `atomic-results-per-page` component determines how many results to display per page.
 *
 * @part label - The "Results per page" label.
 * @part buttons - The list of buttons.
 * @part page-button - The page button.
 * @part active-page-button - The active page button.
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
   * A list of choices for the number of results to display per page, separated by commas.
   */
  @Prop() choicesDisplayed = '10,25,50,100';
  /**
   * The initial selection for the number of result per page. This should be part of the `choicesDisplayed` option. By default, this is set to the first value in `choicesDisplayed`.
   */
  @Prop({mutable: true}) initialChoice?: number;

  public initialize() {
    this.choices = this.validateChoicesDisplayed();
    this.validateInitialChoice();

    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.resultPerPage = buildResultsPerPage(this.bindings.engine, {
      initialState: {numberOfResults: this.initialChoice},
    });
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
    if (!this.initialChoice) {
      this.initialChoice = this.choices[0];
      return;
    }
    if (!this.choices.includes(this.initialChoice)) {
      const errorMsg = `The "initialChoice" option value "${this.initialChoice}" is not included in the "choicesDisplayed" option "${this.choicesDisplayed}".`;
      this.bindings.engine.logger.error(errorMsg, this);
      throw new Error(errorMsg);
    }
  }

  private buildChoice(choice: number) {
    const isSelected = this.resultPerPage.isSetTo(choice);
    const classes = isSelected
      ? 'text-on-primary bg-primary hover:bg-primary-light'
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
        {choice.toLocaleString(this.bindings.i18n.language)}
      </button>
    );
  }

  public render() {
    if (!this.searchStatusState.hasResults) {
      return;
    }

    return (
      <div class="flex items-center">
        <span part="label" class="text-on-background pr-4">
          {this.strings.resultsPerPage()}
        </span>
        <div
          part="buttons"
          role="radiogroup"
          aria-label={this.strings.resultsPerPage()}
          class="flex flex-wrap flex-grow	mr-2"
        >
          {this.choices.map((choice) => this.buildChoice(choice))}
        </div>
      </div>
    );
  }
}
