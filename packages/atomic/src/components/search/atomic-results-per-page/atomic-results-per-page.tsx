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
import {Choices} from '../../common/items-per-page/choices';
import {Label} from '../../common/items-per-page/label';
import {
  validateChoicesDisplayed,
  validateInitialChoice,
} from '../../common/items-per-page/validate';
import {PagerGuard} from '../../common/pager/pager-guard';
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
    this.choices = validateChoicesDisplayed(this);
    validateInitialChoice(this, this.choices);

    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.resultPerPage = buildResultsPerPage(this.bindings.engine, {
      initialState: {numberOfResults: this.initialChoice},
    });
  }

  private get label() {
    return this.bindings.i18n.t('results-per-page');
  }

  public render() {
    return (
      <PagerGuard
        hasError={this.searchStatusState.hasError}
        hasItems={this.searchStatusState.hasResults}
        isAppLoaded={this.bindings.store.isAppLoaded()}
      >
        <div class="flex items-center">
          <Label>{this.label}</Label>
          <FieldsetGroup label={this.label}>
            <Choices
              label={this.label}
              groupName={this.radioGroupName}
              pageSize={this.resultPerPageState.numberOfResults}
              choices={this.choices}
              lang={this.bindings.i18n.language}
              scrollToTopEvent={this.scrollToTopEvent.emit}
              setItemSize={this.resultPerPage.set}
              focusOnFirstResultAfterNextSearch={() =>
                this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch()
              }
              focusOnNextNewResult={() =>
                this.bindings.store.state.resultList?.focusOnNextNewResult()
              }
            ></Choices>
          </FieldsetGroup>
        </div>
      </PagerGuard>
    );
  }
}
