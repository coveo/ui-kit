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
import {createAppLoadedListener} from '../../common/interface/store';
import {Choices} from '../../common/items-per-page/choices';
import {
  ChoiceIsNaNError,
  InitialChoiceNotInChoicesError,
} from '../../common/items-per-page/error';
import {Label} from '../../common/items-per-page/label';
import {
  convertChoicesToNumbers,
  validateInitialChoice,
} from '../../common/items-per-page/validate';
import {PagerGuard} from '../../common/pager/stencil-pager-guard';
import type {CommerceBindings as Bindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-products-per-page` component determines how many products to display per page.
 *
 * @part label - The "Products per page" label.
 * @part buttons - The list of buttons.
 * @part button - The individual products per page buttons.
 * @part active-button - The active products per page button.
 *
 * @alpha
 */
@Component({
  tag: 'atomic-commerce-products-per-page',
  styleUrl: 'atomic-commerce-products-per-page.pcss',
  shadow: true,
})
export class AtomicCommerceProductsPerPage
  implements InitializableComponent<Bindings>
{
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
  @State() private isAppLoaded = false;

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

    const controller =
      this.bindings.interfaceElement.type === 'search'
        ? buildSearch(this.bindings.engine)
        : buildProductListing(this.bindings.engine);

    this.summary = controller.summary();
    this.pagination = controller.pagination(
      this.initialChoice ? {options: {pageSize: this.initialChoice}} : {}
    );
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  private get label() {
    return this.bindings.i18n.t('products-per-page');
  }

  public render() {
    return (
      <PagerGuard
        hasError={this.summaryState.hasError}
        hasItems={this.summaryState.hasProducts}
        isAppLoaded={this.isAppLoaded}
      >
        <div class="flex items-center">
          <Label>{this.label}</Label>
          <FieldsetGroup label={this.label}>
            <Choices
              label={this.label}
              groupName={this.radioGroupName}
              pageSize={this.paginationState.pageSize}
              choices={this.choices}
              lang={this.bindings.i18n.language}
              scrollToTopEvent={this.scrollToTopEvent.emit}
              setItemSize={this.pagination.setPageSize}
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
