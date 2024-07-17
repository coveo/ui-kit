import {
  Pagination,
  PaginationState,
  buildSearch,
  buildProductListing,
  SearchSummaryState,
  ProductListingSummaryState,
  Summary,
  loadPaginationActions,
} from '@coveo/headless/commerce';
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
   */
  @Prop({mutable: true, reflect: true}) initialChoice?: number;

  @Event({
    eventName: 'atomic/scrollToTop',
  })
  private scrollToTopEvent!: EventEmitter;

  public initialize() {
    this.choices = validateChoicesDisplayed(this);
    validateInitialChoice(this, this.choices);

    const controller =
      this.bindings.interfaceElement.type === 'search'
        ? buildSearch(this.bindings.engine)
        : buildProductListing(this.bindings.engine);

    this.summary = controller.summary();
    this.pagination = controller.pagination();
    const {setPageSize} = loadPaginationActions(this.bindings.engine);
    this.bindings.engine.dispatch(setPageSize({pageSize: this.initialChoice!}));
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
