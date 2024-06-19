import {
  ResultsPerPage,
  buildResultsPerPage,
  ResultsPerPageState,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, Event, EventEmitter, h, Prop, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {FieldsetGroup} from '../../common/fieldset-group';
import {PagerGuard} from '../../common/pager/pager-guard';
import {RadioButton} from '../../common/radio-button';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-results-per-page` component determines how many results to display per page.
 *
 * @part label - The "Results per page" label.
 * @part buttons - The list of buttons.
 * @part button - The result per page button.
 * @part active-button - The active result per page button.
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
  private readonly radioGroupName = randomID('atomic-results-per-page-');

  @State()
  @BindStateToController('resultPerPage')
  public resultPerPageState!: ResultsPerPageState;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @State() public error!: Error;

  /**
   * A list of choices for the number of results to display per page, separated by commas.
   */
  @Prop({reflect: true}) choicesDisplayed = '10,25,50,100';
  /**
   * The initial selection for the number of result per page. This should be part of the `choicesDisplayed` option. By default, this is set to the first value in `choicesDisplayed`.
   */
  @Prop({mutable: true, reflect: true}) initialChoice?: number;

  @Event({
    eventName: 'atomic/scrollToTop',
  })
  private scrollToTopEvent!: EventEmitter;

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
    const parts = ['button'];
    if (isSelected) {
      parts.push('active-button');
    }
    const text = choice.toLocaleString(this.bindings.i18n.language);

    return (
      <RadioButton
        key={choice}
        groupName={this.radioGroupName}
        style="outline-neutral"
        checked={isSelected}
        ariaLabel={text}
        onChecked={() => {
          this.focusOnProperResultDependingOnChoice(choice);
          this.resultPerPage.set(choice);
        }}
        class="btn-page focus-visible:bg-neutral-light"
        part={parts.join(' ')}
        text={text}
      ></RadioButton>
    );
  }

  private focusOnProperResultDependingOnChoice(choice: number) {
    if (choice < this.resultPerPageState.numberOfResults) {
      this.bindings.store.state.resultList
        ?.focusOnFirstResultAfterNextSearch()
        .then(() => this.scrollToTopEvent.emit());
    } else if (choice > this.resultPerPageState.numberOfResults) {
      this.bindings.store.state.resultList?.focusOnNextNewResult();
    }
  }

  private get label() {
    return this.bindings.i18n.t('results-per-page');
  }

  public render() {
    return (
      <PagerGuard
        {...this.searchStatusState}
        isAppLoaded={this.bindings.store.isAppLoaded()}
      >
        <div class="flex items-center">
          <span
            part="label"
            class="self-start text-on-background text-lg mr-3 leading-10"
            aria-hidden="true"
          >
            {this.label}
          </span>
          <FieldsetGroup label={this.label}>
            <div
              part="buttons"
              role="radiogroup"
              aria-label={this.label}
              class="flex flex-wrap gap-2"
            >
              {this.choices.map((choice) => this.buildChoice(choice))}
            </div>
          </FieldsetGroup>
        </div>
      </PagerGuard>
    );
  }
}
