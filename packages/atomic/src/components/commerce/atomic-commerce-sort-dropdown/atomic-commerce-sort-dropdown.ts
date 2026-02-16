import {
  buildProductListing,
  buildSearch,
  type ProductListing,
  type ProductListingState,
  type Search,
  type SearchState,
  type Sort,
  type SortState,
} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {guard} from 'lit/directives/guard.js';
import {map} from 'lit/directives/map.js';
import {bindings} from '@/src/decorators/bindings';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {bindStateToController} from '../../../decorators/bind-state';
import {bindingGuard} from '../../../decorators/binding-guard';
import {errorGuard} from '../../../decorators/error-guard';
import type {InitializableComponent} from '../../../decorators/types';
import {randomID} from '../../../utils/utils';
import {renderSortLabel} from '../../common/sort/label';
import {renderSortSelect} from '../../common/sort/select';
import {sortGuard} from '../../common/sort/sort-guard';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {getSortByLabel, renderCommerceSortOption} from '../sort/option';

/**
 * The `atomic-commerce-sort-dropdown` component renders a dropdown that the end user can interact with to select the criteria to use when sorting products.
 *
 * @part label - The "Sort by" label of the `<select>` element.
 * @part select-parent - The `<select>` element parent.
 * @part select - The `<select>` element of the dropdown list.
 * @part select-separator - The element separating the select from the icon.
 * @part placeholder - The dropdown placeholder for while the interface is initializing.
 */
@customElement('atomic-commerce-sort-dropdown')
@bindings()
@withTailwindStyles
export class AtomicCommerceSortDropdown
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state() bindings!: CommerceBindings;

  private readonly dropdownId = randomID('atomic-commerce-sort-dropdown-');

  public sort!: Sort;
  @bindStateToController('sort')
  @state()
  sortState!: SortState;

  public searchOrListing!: Search | ProductListing;
  @bindStateToController('searchOrListing')
  @state()
  searchOrListingState?: SearchState | ProductListingState;

  @state() error!: Error;

  public initialize() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.searchOrListing = buildProductListing(this.bindings.engine);
    } else {
      this.searchOrListing = buildSearch(this.bindings.engine);
    }
    this.sort = this.searchOrListing.sort();
  }

  private select(e: Event) {
    const select = e.composedPath()[0] as HTMLSelectElement;
    this.sort.sortBy(
      getSortByLabel(select.value, this.sortState.availableSorts)
    );
  }

  private sortLabelTemplate() {
    return renderSortLabel({
      props: {
        id: this.dropdownId,
        i18n: this.bindings.i18n,
      },
    });
  }

  private sortSelectTemplate() {
    const {
      bindings: {i18n},
      dropdownId: id,
    } = this;

    return renderSortSelect({
      props: {
        i18n,
        id,
        onSelect: (evt: Event) => this.select(evt),
      },
    })(
      html`${guard([this.sortState], () =>
        map(this.sortState.availableSorts, (sort) =>
          renderCommerceSortOption({
            props: {
              i18n,
              selected: this.sort.isSortedBy(sort),
              sort,
            },
          })
        )
      )}`
    );
  }

  @errorGuard()
  @bindingGuard()
  render() {
    const {responseId, error, products, isLoading} = this.searchOrListingState!;
    return html`${sortGuard(
      {
        isLoading,
        firstSearchExecuted: responseId !== '',
        hasResults:
          products.length > 0 && this.sortState.availableSorts.length > 1,
        hasError: error !== null,
      },
      () =>
        html`<div class="text-on-background flex flex-wrap items-center">
          ${this.sortLabelTemplate()} ${this.sortSelectTemplate()}
        </div>`
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-sort-dropdown': AtomicCommerceSortDropdown;
  }
}
