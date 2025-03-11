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
import {html, CSSResultGroup, unsafeCSS, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
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
// import {sortGuard} from '../../common/sort/guard';
// import {renderSortLabel} from '../../common/sort/label';
// import {renderSortSelect} from '../../common/sort/select';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
// import {renderCommerceSortOption} from '../sort/option';
import {getSortByLabel, renderCommerceSortOption} from '../sort/option';
import styles from './atomic-commerce-sort-dropdown.tw.css';

@customElement('atomic-commerce-sort-dropdown')
export class AtomicCommerceSortDropdown
  extends InitializeBindingsMixin(TailwindLitElement)
  implements InitializableComponent<CommerceBindings>
{
  @state() bindings!: CommerceBindings;

  private readonly dropdownId = randomID('atomic-commerce-sort-dropdown-');

  @property({type: Object}) sort!: Sort; // TODO: check if this should be a prop or a public/private attribute
  @bindStateToController('sort')
  @state()
  sortState!: SortState;

  @property({type: Object}) searchOrListing!: Search | ProductListing; // TODO: check if this should be a prop or a private attribute
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

  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (
      _changedProperties.has('searchOrListingState') &&
      this.searchOrListingState // TODO: find a better way
    ) {
      const {error, products} = this.searchOrListingState;
      const hasResults =
        products.length > 0 && this.sortState.availableSorts.length > 1;
      const hasError = error !== null;
      return hasResults && !hasError;
    }

    return super.shouldUpdate(_changedProperties);
  }

  private sortContainer() {
    return html`<div class="text-on-background flex flex-wrap items-center">
      ${this.sortLabelTemplate()} ${this.sortSelectTemplate()}
    </div>`;
  }

  // TODO: test part bubbling up
  @errorGuard()
  @bindingGuard()
  render() {
    const {responseId} = this.searchOrListingState!; // TODO: find a better way
    const firstSearchExecuted = responseId !== '';

    return html`${sortGuard({firstSearchExecuted}, () => this.sortContainer())}`;
  }
}
