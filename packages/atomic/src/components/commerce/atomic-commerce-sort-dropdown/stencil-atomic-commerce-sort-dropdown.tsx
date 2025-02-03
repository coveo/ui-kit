import {
  Sort,
  SortState,
  Search,
  ProductListing,
  buildProductListing,
  buildSearch,
  SearchState,
  ProductListingState,
} from '@coveo/headless/commerce';
import {Component, h, State, Element} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {SortContainer} from '../../common/sort/stencil-container';
import {SortGuard} from '../../common/sort/stencil-guard';
import {SortLabel} from '../../common/sort/stencil-label';
import {SortSelect} from '../../common/sort/stencil-select';
import {CommerceBindings} from '../atomic-commerce-interface/lit-stencil-common-types';
import {CommerceSortOption, getSortByLabel} from '../sort/stencil-option';

/**
 * The `atomic-commerce-sort-dropdown` component renders a dropdown that the end user can interact with to select the criteria to use when sorting products.
 *
 * @part label - The "Sort by" label of the `<select>` element.
 * @part select-parent - The `<select>` element parent.
 * @part select - The `<select>` element of the dropdown list.
 * @part select-separator - The element separating the select from the icon.
 * @part placeholder - The dropdown placeholder for while the interface is initializing.
 *
 * @alpha
 */
@Component({
  tag: 'stencil-atomic-commerce-sort-dropdown',
  styleUrl: 'atomic-commerce-sort-dropdown.pcss',
  shadow: true,
})
export class AtomicCommerceSortDropdown
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;

  private id = randomID('atomic-commerce-sort-dropdown-');

  @Element() host!: HTMLElement;

  public sort!: Sort;
  @BindStateToController('sort')
  @State()
  public sortState!: SortState;

  public searchOrListing!: Search | ProductListing;
  @BindStateToController('searchOrListing')
  @State()
  private searchOrListingState!: SearchState | ProductListingState;

  @State() public error!: Error;

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

  public render() {
    console.log('STENCIL render dropdown');
    const {error, responseId, products} = this.searchOrListingState;
    const {
      bindings: {i18n},
      id,
    } = this;
    return (
      <SortGuard
        firstSearchExecuted={responseId !== ''}
        hasError={error !== null}
        hasResults={
          products.length > 0 && this.sortState.availableSorts.length > 1
        }
      >
        <SortContainer>
          <SortLabel i18n={i18n} id={id} />
          <SortSelect i18n={i18n} id={id} onSelect={(evt) => this.select(evt)}>
            {this.sortState.availableSorts.map((sort) => (
              <CommerceSortOption
                i18n={i18n}
                selected={this.sort.isSortedBy(sort)}
                sort={sort}
              />
            ))}
          </SortSelect>
        </SortContainer>
      </SortGuard>
    );
  }
}
