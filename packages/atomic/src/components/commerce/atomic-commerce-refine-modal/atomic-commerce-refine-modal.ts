import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildProductListing,
  buildSearch,
  type FacetGenerator,
  type FacetGeneratorState,
  type ProductListingSummaryState,
  type SearchSummaryState,
  type Sort,
  type SortCriterion,
  type SortState,
  type Summary,
} from '@coveo/headless/commerce';
import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {renderRefineModalBody} from '../../common/refine-modal/body';
import {
  renderRefineModalFiltersClearButton,
  renderRefineModalFiltersSection,
} from '../../common/refine-modal/filters';
import {renderRefineModal} from '../../common/refine-modal/modal';
import {renderRefineModalSortSection} from '../../common/refine-modal/sort';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {getSortByLabel, renderCommerceSortOption} from '../sort/option';

/**
 * The `atomic-commerce-refine-modal` is automatically created as a child of the `atomic-commerce-search-interface` when the `atomic-commerce-refine-toggle` is initialized.
 *
 * When the modal is opened, the class `atomic-modal-opened` is added to the interface element and the body, allowing further customization.
 *
 * @part title - The title of the modal.
 * @part close-button - The button in the header that closes the modal.
 * @part close-icon - The icon of the close button.
 * @part footer-content - The wrapper around the content inside the footer of the modal, containing the button to view the products.
 * @part footer-button - The button in the footer that closes the modal.
 * @part footer-button-text - The text inside the button in the footer that closes the modal.
 * @part footer-button-count - The count inside the button in the footer that closes the modal.
 * @part content - The wrapper around the content inside the body of the modal.
 * @part select - The `<select>` element of the dropdown list.
 * @part section-sort-title - The title for the sort section.
 * @part select-wrapper - The wrapper around the select element, used to position the icon.
 * @part select-icon-wrapper - The wrapper around the sort icon that's used to align it.
 * @part select-icon - The select dropdown's sort icon.
 * @part filter-section - The section containing facets and the "filters" title.
 * @part section-filters-title - The title for the filters section.
 * @part filter-clear-all - The button that resets all actively selected facet values.
 * @part section-title - The title for each section.
 */
@customElement('atomic-commerce-refine-modal')
@bindings()
@withTailwindStyles
export class AtomicCommerceRefineModal
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = [
    css`
      :host {
        position: absolute;
      }
    `,
  ];

  @state()
  bindings!: CommerceBindings;

  @state()
  error!: Error;

  /**
   * The element that opens the modal when clicked.
   */
  @property({attribute: 'open-button', type: Object})
  openButton?: HTMLElement;

  /**
   * Whether the modal is open.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    reflect: true,
    attribute: 'is-open',
  })
  isOpen = false;

  /**
   * The number of expanded facets inside the refine modal.
   * Remaining facets are automatically collapsed.
   *
   * Using the value `0` collapses all facets.
   */
  @property({type: Number, reflect: true, attribute: 'collapse-facets-after'})
  collapseFacetsAfter = 0;

  public summary!: Summary;
  @bindStateToController('summary')
  @state()
  public summaryState!: SearchSummaryState | ProductListingSummaryState;

  public sort!: Sort;
  @bindStateToController('sort')
  @state()
  public sortState!: SortState;

  public facetGenerator!: FacetGenerator;
  @bindStateToController('facetGenerator')
  @state()
  public facetGeneratorState!: FacetGeneratorState;

  public breadcrumbManager!: BreadcrumbManager;
  @bindStateToController('breadcrumbManager')
  @state()
  public breadcrumbManagerState!: BreadcrumbManagerState;

  public initialize() {
    const searchOrListing =
      this.bindings.interfaceElement.type === 'search'
        ? buildSearch(this.bindings.engine)
        : buildProductListing(this.bindings.engine);
    this.summary = searchOrListing.summary();
    this.sort = searchOrListing.sort();
    this.facetGenerator = searchOrListing.facetGenerator();
    this.breadcrumbManager = searchOrListing.breadcrumbManager();
    this.watchEnabled();
  }

  @watch('isOpen')
  watchEnabled() {
    if (this.isOpen) {
      if (this.querySelector('div[slot="facets"]')) {
        return;
      }

      this.appendChild(this.createFacetSlot());
    }
  }

  /**
   * This method is necessary to ensure
   * that the facets slot is rendered outside of the component's shadow DOM, preserving
   * correct CSS inheritance and slot behavior. If this logic were placed in the render
   * function, the slot would be rendered inside the shadow DOM, which would break
   * expected CSS styling and slot distribution.
   */
  private createFacetSlot(): HTMLDivElement {
    const divSlot = document.createElement('div');
    divSlot.setAttribute('slot', 'facets');

    const facets = document.createElement('atomic-commerce-facets');
    facets.style.display = 'flex';
    facets.style.flexDirection = 'column';
    facets.style.gap = 'var(--atomic-refine-modal-facet-margin, 20px)';
    facets.collapseFacetsAfter = this.collapseFacetsAfter;
    divSlot.append(facets);
    return divSlot;
  }

  private onSelectSortOption = (e: Event) => {
    const select = e.composedPath()[0] as HTMLSelectElement;
    this.sort.sortBy(
      getSortByLabel(select.value, this.sortState.availableSorts)
    );
  };

  private renderSort() {
    return renderRefineModalSortSection({
      props: {
        i18n: this.bindings.i18n,
        onSelect: this.onSelectSortOption,
      },
    })(
      html`${this.sortState.availableSorts.map((sort: SortCriterion) =>
        renderCommerceSortOption({
          props: {
            i18n: this.bindings.i18n,
            selected: this.sort.isSortedBy(sort),
            sort,
          },
        })
      )}`
    );
  }

  private renderFilters() {
    if (this.facetGeneratorState.length === 0) {
      return;
    }

    const {i18n} = this.bindings;

    return renderRefineModalFiltersSection({
      props: {
        i18n,
        withFacets: true,
        withAutomaticFacets: false,
      },
    })(
      this.breadcrumbManagerState.hasBreadcrumbs
        ? renderRefineModalFiltersClearButton({
            props: {
              i18n,
              onClick: () => this.breadcrumbManager.deselectAll(),
            },
          })
        : nothing
    );
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${renderRefineModal({
      props: {
        i18n: this.bindings.i18n,
        i18nFooterButtonTextKey: 'view-products',
        host: this,
        isOpen: this.isOpen,
        onClose: () => {
          this.isOpen = false;
        },
        title: this.bindings.i18n.t('sort-and-filter'),
        numberOfItems: this.summaryState.totalNumberOfProducts,
        openButton: this.openButton,
      },
    })(
      renderRefineModalBody(this.bindings.i18n)(html`
        ${this.renderSort()} ${this.renderFilters()}
      `)
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-refine-modal': AtomicCommerceRefineModal;
  }
}
