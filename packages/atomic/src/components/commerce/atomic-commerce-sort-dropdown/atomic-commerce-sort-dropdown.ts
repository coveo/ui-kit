import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
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
import {html, CSSResultGroup, unsafeCSS} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {guard} from 'lit/directives/guard.js';
import {map} from 'lit/directives/map.js';
import {bindStateToController} from '../../../decorators/bind-state';
import {bindingGuard} from '../../../decorators/binding-guard';
import {errorGuard} from '../../../decorators/error-guard';
import {InitializableComponent} from '../../../decorators/types';
import {TailwindLitElement} from '../../../utils/tailwind.element';
import {randomID} from '../../../utils/utils';
import {sortGuard} from '../../common/sort/guard';
import {renderSortLabel} from '../../common/sort/label';
import {renderSortSelect} from '../../common/sort/select';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {getSortByLabel, renderCommerceSortOption} from '../sort/option';
import styles from './atomic-commerce-sort-dropdown.tw.css';

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
@customElement('atomic-commerce-sort-dropdown')
export class AtomicCommerceSortDropdown
  extends InitializeBindingsMixin(TailwindLitElement)
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

  static styles: CSSResultGroup = [
    TailwindLitElement.styles,
    unsafeCSS(styles),
  ];

  public initialize() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.searchOrListing = buildProductListing(this.bindings.engine);
    } else {
      this.searchOrListing = buildSearch(this.bindings.engine);
    }
    this.sort = this.searchOrListing.sort();
    console.log('INIT ---', this.sort);
  }

  private select(e: Event) {
    const select = e.composedPath()[0] as HTMLSelectElement;
    this.sort.sortBy(
      getSortByLabel(select.value, this.sortState.availableSorts)
    );
  }

  private sortLabelTemplate() {
    return renderSortLabel({
      id: this.dropdownId,
      i18n: this.bindings.i18n,
    });
  }

  private sortSelectTemplate() {
    const {
      bindings: {i18n},
      dropdownId: id,
    } = this;

    return renderSortSelect({
      i18n,
      id,
      onSelect: (evt: Event) => this.select(evt),
      children: html`${guard([this.sortState], () => {
        console.log('SORT ---', this.sort);
        return map(this.sortState.availableSorts, (sort) =>
          renderCommerceSortOption({
            i18n,
            selected: this.sort.isSortedBy(sort),
            sort,
          })
        );
      })}`,
    });
  }

  private sortContainer() {
    return html`<div class="text-on-background flex flex-wrap items-center">
      ${this.sortLabelTemplate()} ${this.sortSelectTemplate()}
    </div>`;
  }

  @errorGuard()
  @bindingGuard()
  render() {
    console.log('++++' + this.sort);
    const {responseId, error, products, isLoading} = this.searchOrListingState!;
    return html`${sortGuard(
      {
        isLoading,
        firstSearchExecuted: responseId !== '',
        hasResults:
          products.length > 0 && this.sortState.availableSorts.length > 1,
        hasError: error !== null,
      },
      () => this.sortContainer()
    )}`;
  }
}
