import {
  Pagination,
  PaginationState,
  buildSearch,
  buildProductListing,
  SearchSummaryState,
  ProductListingSummaryState,
  Summary,
} from '@coveo/headless/commerce';
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
import type {CommerceBindings as Bindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-products-per-page` component determines how many products to display per page.
 *
 * @part label - The "Products per page" label.
 * @part buttons - The list of buttons.
 * @part button - The product per page button.
 * @part active-button - The active product per page button.
 *
 * @alpha
 */
@Component({
  tag: 'atomic-commerce-products-per-page',
  styleUrl: 'atomic-commerce-products-per-page.pcss',
  shadow: true,
})
export class AtomicResultsPerPage implements InitializableComponent<Bindings> {
  @InitializeBindings() public bindings!: Bindings;

  public pagination!: Pagination;
  @BindStateToController('pagination')
  @State()
  private paginationState!: PaginationState;

  public summary!: Summary;
  @BindStateToController('summary')
  @State()
  private summaryState!: SearchSummaryState | ProductListingSummaryState;

  @State() public error!: Error;
  private choices!: number[];
  private readonly radioGroupName = randomID(
    'atomic-commerce-products-per-page-'
  );

  /**
   * A list of choices for the number of products to display per page, separated by commas.
   */
  @Prop({reflect: true}) choicesDisplayed = '10,25,50,100';
  /**
   * The initial selection for the number of product per page. This should be part of the `choicesDisplayed` option. By default, this is set to the first value in `choicesDisplayed`.
   * @type {number}
   */
  @Prop({mutable: true, reflect: true}) initialChoice?: number;

  @Event({
    eventName: 'atomic/scrollToTop',
  })
  private scrollToTopEvent!: EventEmitter;

  public initialize() {
    this.choices = this.validateChoicesDisplayed();
    this.validateInitialChoice();

    const controller =
      this.bindings.interfaceElement.type === 'search'
        ? buildSearch(this.bindings.engine)
        : buildProductListing(this.bindings.engine);

    this.summary = controller.summary();
    this.pagination = controller.pagination();
    this.pagination.setPageSize(this.initialChoice!);
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
    const isSelected = this.paginationState.pageSize === choice;
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
          this.pagination.setPageSize(choice);
        }}
        class="btn-page focus-visible:bg-neutral-light"
        part={parts.join(' ')}
        text={text}
      ></RadioButton>
    );
  }

  private focusOnProperResultDependingOnChoice(choice: number) {
    if (choice < this.paginationState.pageSize) {
      this.bindings.store.state.resultList
        ?.focusOnFirstResultAfterNextSearch()
        .then(() => this.scrollToTopEvent.emit());
    } else if (choice > this.paginationState.pageSize) {
      this.bindings.store.state.resultList?.focusOnNextNewResult();
    }
  }

  private get label() {
    return this.bindings.i18n.t('products-per-page');
  }

  public render() {
    return (
      <PagerGuard
        hasError={this.summaryState.hasError}
        hasItems={this.summaryState.hasProducts}
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
