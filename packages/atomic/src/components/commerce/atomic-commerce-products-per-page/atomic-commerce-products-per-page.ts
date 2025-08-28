import {
  buildProductListing,
  buildSearch,
  type Pagination,
  type PaginationState,
  type ProductListingSummaryState,
  type SearchSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import type {CommerceBindings} from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface.js';
import {renderFieldsetGroup} from '@/src/components/common/fieldset-group.js';
import {createAppLoadedListener} from '@/src/components/common/interface/store.js';
import {renderChoices} from '@/src/components/common/items-per-page/choices.js';
import {renderLabel} from '@/src/components/common/items-per-page/label.js';
import {
  convertChoicesToNumbers,
  validateInitialChoice,
} from '@/src/components/common/items-per-page/validate.js';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {randomID} from '@/src/utils/utils.js';

/**
 * The `atomic-commerce-products-per-page` component lets the end user select how many products to display per page.
 *
 * @part label - The "Products per page" label.
 * @part buttons - The list of buttons.
 * @part button - The individual products per page buttons.
 * @part active-button - The active products per page button.
 */
@customElement('atomic-commerce-products-per-page')
@bindings()
@withTailwindStyles
export class AtomicCommerceProductsPerPage
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  bindings!: CommerceBindings;

  public pagination!: Pagination;
  @bindStateToController('pagination')
  @state()
  private paginationState!: PaginationState;

  public summary!: Summary;
  @bindStateToController('summary')
  @state()
  private summaryState!: SearchSummaryState | ProductListingSummaryState;

  @state() public error!: Error;
  @state() private isAppLoaded = false;

  private choices!: number[];
  private readonly radioGroupName = randomID(
    'atomic-commerce-products-per-page-'
  );

  /**
   * A list of choices for the number of products to display per page, separated by commas.
   */
  @property({reflect: true, attribute: 'choices-displayed'}) choicesDisplayed =
    '10,25,50,100';
  /**
   * The initial selection for the number of product per page. This should be part of the `choicesDisplayed` option. By default, this is set to the first value in `choicesDisplayed`.
   * @type {number}
   */
  @property({type: Number, reflect: true, attribute: 'initial-choice'})
  initialChoice?: number;

  public initialize() {
    this.choices = convertChoicesToNumbers(this.choicesDisplayed);
    this.initialChoice = this.initialChoice ?? this.choices[0];
    validateInitialChoice(this.initialChoice, this.choices);

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

  private scrollToTopEvent() {
    this.dispatchEvent(
      new CustomEvent('atomic/scrollToTop', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private get label() {
    return this.bindings.i18n.t('products-per-page');
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`
      ${when(
        !this.summaryState.hasError &&
          this.summaryState.hasProducts &&
          this.isAppLoaded,
        () => html`
          <div class="flex items-center">
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
                  pageSize: this.paginationState.pageSize,
                  choices: this.choices,
                  lang: this.bindings.i18n.language,
                  scrollToTopEvent: () => this.scrollToTopEvent(),
                  setItemSize: (size: number) =>
                    this.pagination.setPageSize(size),
                  focusOnFirstResultAfterNextSearch: () =>
                    this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch(),
                  focusOnNextNewResult: () =>
                    this.bindings.store.state.resultList?.focusOnNextNewResult(),
                },
              })
            )}
          </div>
        `
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-products-per-page': AtomicCommerceProductsPerPage;
  }
}
