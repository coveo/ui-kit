import {
  Sort,
  SortState,
  Search,
  ProductListing,
  buildProductListing,
  buildSearch,
  SearchState,
  ProductListingState,
  SortCriterion,
} from '@coveo/headless/commerce';
import {Component, h, State, Element} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {SortContainer} from '../../common/sort/container';
import {SortGuard} from '../../common/sort/guard';
import {SortLabel} from '../../common/sort/label';
import {SortOption} from '../../common/sort/option';
import {SortSelect} from '../../common/sort/select';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-sort-dropdown` component renders a dropdown that the end user can interact with to select the criteria to use when sorting products.
 *
 * @part label - The "Sort by" label of the `<select>` element.
 * @part select-parent - The `<select>` element parent.
 * @part select - The `<select>` element of the dropdown list.
 * @part select-separator - The element separating the select from the icon.
 * @part placeholder - The dropdown placeholder for while the interface is initializing.
 *
 * @internal
 */
@Component({
  tag: 'atomic-commerce-sort-dropdown',
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
    this.sort.sortBy(this.getSortByLabel(select.value));
  }

  private getLabel(sort: SortCriterion) {
    if (sort.by === 'relevance') {
      return 'relevance';
    } else {
      return sort.fields
        .map((sortByField) => {
          return sortByField.displayName || sortByField.name;
        })
        .join(' ');
    }
  }

  public render() {
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
            {this.sortState.availableSorts.map((availableSort) => {
              const label = this.getLabel(availableSort);
              return (
                <SortOption
                  i18n={i18n}
                  label={this.getLabel(availableSort)}
                  selected={this.sort.isSortedBy(availableSort)}
                  value={label}
                />
              );
            })}
          </SortSelect>
        </SortContainer>
      </SortGuard>
    );
  }

  private getSortByLabel(label: string) {
    const sortByLabel: Record<string, SortCriterion> = {};
    this.sortState.availableSorts.forEach((availableSort) => {
      sortByLabel[this.getLabel(availableSort)] = availableSort;
    });

    return sortByLabel[label];
  }
}
