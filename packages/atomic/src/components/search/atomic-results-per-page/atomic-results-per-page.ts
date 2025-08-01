import {
  ResultsPerPage,
  buildResultsPerPage,
  ResultsPerPageState,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface.js';
import {renderFieldsetGroup} from '@/src/components/common/fieldset-group.js';
import {createAppLoadedListener} from '@/src/components/common/interface/store.js';
import {renderChoices} from '@/src/components/common/items-per-page/choices.js';
import {renderLabel} from '@/src/components/common/items-per-page/label.js';
import {
  convertChoicesToNumbers,
  validateInitialChoice,
} from '@/src/components/common/items-per-page/validate.js';
import {renderPagerGuard} from '@/src/components/common/pager/pager-guard.js';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {randomID} from '@/src/utils/utils.js';
import {
  ChoiceIsNaNError,
  InitialChoiceNotInChoicesError,
} from '@/src/components/common/items-per-page/error.js';

/**
 * The `atomic-results-per-page` component determines how many results to display per page.
 *
 * @part label - The "Results per page" label.
 * @part buttons - The list of buttons.
 * @part button - The result per page button.
 * @part active-button - The active result per page button.
 */
@customElement('atomic-results-per-page')
@withTailwindStyles
export class AtomicResultsPerPage
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  @state() public bindings!: Bindings;
  @state() public error!: Error;
  public resultPerPage!: ResultsPerPage;
  public searchStatus!: SearchStatus;
  private choices!: number[];
  private readonly radioGroupName = randomID('atomic-results-per-page-');

  @state()
  @bindStateToController('resultPerPage')
  public resultPerPageState!: ResultsPerPageState;
  @bindStateToController('searchStatus')
  @state()
  private searchStatusState!: SearchStatusState;
  @state() public isAppLoaded = false;

  /**
   * A list of choices for the number of results to display per page, separated by commas.
   */
  @property({reflect: true, attribute: 'choices-displayed'}) choicesDisplayed =
    '10,25,50,100';
  /**
   * The initial selection for the number of result per page. This should be part of the `choicesDisplayed` option. By default, this is set to the first value in `choicesDisplayed`.
   * @type {number}
   */
  @property({type: Number, reflect: true, attribute: 'initial-choice'})
  initialChoice?: number;

  public initialize() {
    try {
      this.choices = convertChoicesToNumbers(this.choicesDisplayed);
      this.initialChoice = this.initialChoice ?? this.choices[0];
      validateInitialChoice(this.initialChoice, this.choices);
    } catch (error) {
      if (
        error instanceof ChoiceIsNaNError ||
        error instanceof InitialChoiceNotInChoicesError
      ) {
        this.bindings.engine.logger.error(error.message, this);
        throw error;
      }
    }

    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.resultPerPage = buildResultsPerPage(this.bindings.engine, {
      initialState: {numberOfResults: this.initialChoice},
    });
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  private scrollToTopEvent() {
    this.dispatchEvent(
      new CustomEvent('atomic/scrollToTop', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private get label() {
    return this.bindings.i18n.t('results-per-page');
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`
      ${renderPagerGuard({
        props: {
          hasError: this.searchStatusState.hasError,
          hasItems: this.searchStatusState.hasResults,
          isAppLoaded: this.isAppLoaded,
        },
      })(html`
        <div class="flex items-center" role="toolbar" aria-label=${this.label}>
          ${renderLabel()(html`${this.label}`)}
          ${renderFieldsetGroup({
            props: {
              label: this.label,
            },
          })(
            renderChoices({
              props: {
                label: this.label,
                groupName: this.radioGroupName,
                pageSize: this.resultPerPageState.numberOfResults,
                choices: this.choices,
                lang: this.bindings.i18n.language,
                scrollToTopEvent: () => this.scrollToTopEvent(),
                setItemSize: (size: number) => this.resultPerPage.set(size),
                focusOnFirstResultAfterNextSearch: () =>
                  this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch(),
                focusOnNextNewResult: () =>
                  this.bindings.store.state.resultList?.focusOnNextNewResult(),
              },
            })
          )}
        </div>
      `)}
    `;
  }
}
