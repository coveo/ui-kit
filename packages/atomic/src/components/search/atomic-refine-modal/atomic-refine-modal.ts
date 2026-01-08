import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildBreadcrumbManager,
  buildFacetManager,
  buildQuerySummary,
  buildSearchStatus,
  buildSort,
  buildTabManager,
  type FacetManager,
  type FacetManagerState,
  type QuerySummary,
  type QuerySummaryState,
  type SearchStatus,
  type Sort,
  type SortState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {findSection} from '@/src/components/common/atomic-layout-section/atomic-layout-section-utils';
import {popoverClass} from '@/src/components/common/facets/popover/popover-type';

import {isRefineModalFacet} from '@/src/components/common/interface/store';
import {renderRefineModalBody} from '@/src/components/common/refine-modal/body';
import {
  renderRefineModalFiltersClearButton,
  renderRefineModalFiltersSection,
} from '@/src/components/common/refine-modal/filters';
import {renderRefineModal} from '@/src/components/common/refine-modal/modal';
import {renderRefineModalSortSection} from '@/src/components/common/refine-modal/sort';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import type {AtomicInterface} from '@/src/utils/initialization-lit-stencil-common-utils';
import {shouldDisplayOnCurrentTab} from '@/src/utils/tab-utils';
import {sortByDocumentPosition} from '@/src/utils/utils';
import {
  type BaseFacetElement,
  collapseFacetsAfter,
  sortFacetVisibility,
  triageFacetsByParents,
} from '../../common/facets/facet-common';
import type {Bindings} from '../atomic-search-interface/atomic-search-interface';
import type {SortDropdownOption} from '../atomic-search-interface/store';

/**
 * The `atomic-refine-modal` component is automatically created as a child of the `atomic-search-interface` when the `atomic-refine-toggle` is initialized.
 *
 * When the modal is opened, the class `atomic-modal-opened` is added to the interface element and the body, allowing further customization.
 *
 * @part title - The title of the modal.
 * @part close-button - The button in the header that closes the modal.
 * @part close-icon - The icon of the close button.
 * @part content - The wrapper around the content inside the body of the modal.
 * @part section-title - The title for each section.
 * @part section-sort-title - The title for the sort section.
 * @part section-filters-title - The title for the filters section.
 * @part select-wrapper - The wrapper around the select element, used to position the icon.
 * @part select - The `<select>` element of the dropdown list.
 * @part select-icon-wrapper - The wrapper around the sort icon that's used to align it.
 * @part select-icon - The select dropdown's sort icon.
 * @part filter-section - The section containing facets and the "filters" title.
 * @part filter-clear-all - The button that resets all actively selected facet values.
 * @part footer-content - The wrapper around the content inside the footer of the modal, containing the button to view results.
 * @part footer-button - The button in the footer that closes the modal.
 * @part footer-button-text - The text inside the button in the footer that closes the modal.
 * @part footer-button-count - The count inside the button in the footer that closes the modal.
 * @part footer-wrapper - The wrapper with a shadow or background color around the footer.
 * @part footer - The footer of the modal.
 * @part header-ruler - The horizontal ruler underneath the header.
 * @part body-wrapper - The wrapper around the body.
 * @part body - The body of the modal, between the header and the footer.
 * @part header-wrapper - The wrapper around the header.
 * @part header - The header of the modal, containing the title.
 * @part container - The modal's outermost container.
 *
 * @cssprop --atomic-refine-modal-facet-margin - The margin between facets in the refine modal. Default is `20px`.
 */
@customElement('atomic-refine-modal')
@bindings()
@withTailwindStyles
export class AtomicRefineModal
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles: CSSResultGroup = [
    css`
    select:hover + div,
    select:focus-visible + div {
      @apply text-primary-light;
    }
    `,
  ];

  @state()
  bindings!: Bindings;

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

  public sort!: Sort;
  @bindStateToController('sort')
  @state()
  public sortState!: SortState;

  public breadcrumbManager!: BreadcrumbManager;
  @bindStateToController('breadcrumbManager')
  @state()
  private breadcrumbManagerState!: BreadcrumbManagerState;

  public querySummary!: QuerySummary;
  @bindStateToController('querySummary')
  @state()
  public querySummaryState!: QuerySummaryState;

  public searchStatus!: SearchStatus;

  public facetManager!: FacetManager;
  @bindStateToController('facetManager')
  @state()
  public facetManagerState!: FacetManagerState;

  public tabManager!: TabManager;
  @bindStateToController('tabManager')
  @state()
  public tabManagerState!: TabManagerState;

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.sort = buildSort(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.facetManager = buildFacetManager(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);
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
   * This method is necessary to ensure that the facets slot is rendered outside of the component's shadow DOM, preserving
   * correct CSS inheritance and slot behavior. If this logic were placed in the render
   * function, the slot would be rendered inside the shadow DOM, which would break
   * expected CSS styling and slot distribution.
   */
  private createFacetSlot(): HTMLDivElement {
    const divSlot = document.createElement('div');
    divSlot.setAttribute('slot', 'facets');
    this.addFacetColumnStyling(divSlot);

    const facets = this.bindings.store.getFacetElements() as BaseFacetElement[];
    const boundInterfaces = this.getBoundInterfaces().sort(
      sortByDocumentPosition
    );
    const facetsSection = [];
    const horizontalFacetsSection = [];
    for (const boundInterface of boundInterfaces) {
      const facetSection = findSection(boundInterface, 'facets');
      if (facetSection) {
        facetsSection.push(facetSection);
      }
      const horizontalFacetSection = findSection(
        boundInterface,
        'horizontal-facets'
      );
      if (horizontalFacetSection) {
        horizontalFacetsSection.push(horizontalFacetSection);
      }
    }
    const triagedFacets = triageFacetsByParents(
      facets,
      ...horizontalFacetsSection,
      ...facetsSection
    );
    for (const triagedFacet of triagedFacets.values()) {
      triagedFacet.sort(sortByDocumentPosition);
    }

    const sortedFacets = [];
    for (let i = 0; i < boundInterfaces.length; i++) {
      sortedFacets.push(...(triagedFacets.get(facetsSection[i]) || []));
      sortedFacets.push(
        ...(triagedFacets.get(horizontalFacetsSection[i]) || [])
      );
    }
    sortedFacets.push(...(triagedFacets.get(null) || []));

    const {visibleFacets, invisibleFacets} = sortFacetVisibility(
      sortedFacets,
      this.bindings.store.getAllFacets()
    );

    const visibleFacetsClone = this.cloneFacets(visibleFacets);
    const invisibleFacetsClone = this.cloneFacets(invisibleFacets);

    collapseFacetsAfter(visibleFacetsClone, this.collapseFacetsAfter);

    divSlot.append(...visibleFacetsClone);
    divSlot.append(...invisibleFacetsClone);

    const generator = this.makeAutomaticFacetGenerator();
    if (generator) {
      generator.updateCollapseFacetsDependingOnFacetsVisibility(
        this.collapseFacetsAfter,
        visibleFacets.length
      );
      divSlot.append(generator);
    }

    return divSlot;
  }

  private getBoundInterfaces(): AtomicInterface[] {
    const mainInterface: AtomicInterface | null =
      this.closest('atomic-search-interface') ??
      this.closest('atomic-external')?.boundInterface ??
      null;
    if (!mainInterface) {
      throw new Error('Cannot find bound interface');
    }
    const boundExternalInterfaces = Array.from(
      document.querySelectorAll('atomic-external')
    ).filter(
      (atomicExternal) => atomicExternal.boundInterface === mainInterface
    );
    return [...boundExternalInterfaces, mainInterface];
  }

  private cloneFacets(facets: BaseFacetElement[]): BaseFacetElement[] {
    return facets.map((facet, i) => {
      facet.classList.remove(popoverClass);
      facet.setAttribute(isRefineModalFacet, '');
      const clone = facet.cloneNode(true) as BaseFacetElement;
      clone.isCollapsed =
        this.collapseFacetsAfter === -1
          ? false
          : i + 1 > this.collapseFacetsAfter;
      return clone;
    });
  }

  private makeAutomaticFacetGenerator() {
    if (!this.bindings.engine.state.automaticFacetSet?.desiredCount) {
      return;
    }
    const generator = document.createElement(
      'atomic-automatic-facet-generator'
    );

    generator.setAttribute(
      'desired-count',
      `${this.bindings.engine.state.automaticFacetSet?.desiredCount}`
    );
    this.addFacetColumnStyling(generator);

    return generator;
  }

  private addFacetColumnStyling(el: HTMLElement) {
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.gap = 'var(--atomic-refine-modal-facet-margin, 20px)';
  }

  private get options(): SortDropdownOption[] {
    return this.bindings.store.state.sortOptions;
  }

  private onSelectSortOption = (e: Event) => {
    const select = e.composedPath()[0] as HTMLSelectElement;
    const option = this.options.find(
      (option) => option.expression === select.value
    );
    option && this.sort.sortBy(option.criteria);
  };

  private renderSortOption({
    expression,
    criteria,
    label,
    tabs,
  }: SortDropdownOption) {
    if (
      !shouldDisplayOnCurrentTab(
        [...tabs.included],
        [...tabs.excluded],
        this.tabManagerState?.activeTab
      )
    ) {
      return nothing;
    }
    return html`
      <option value=${expression} ?selected=${this.sort.isSortedBy(criteria)}>
        ${this.bindings.i18n.t(label)}
      </option>
    `;
  }

  private renderSort() {
    if (!this.options.length) {
      return nothing;
    }

    return renderRefineModalSortSection({
      props: {
        i18n: this.bindings.i18n,
        onSelect: this.onSelectSortOption,
      },
    })(html`${this.options.map((option) => this.renderSortOption(option))}`);
  }

  private renderFilters() {
    const hasFacetElements = this.bindings.store.getFacetElements().length > 0;
    const hasAutomaticFacets =
      this.bindings.engine.state.automaticFacetSet?.set !== undefined;

    if (!hasFacetElements && !hasAutomaticFacets) {
      return nothing;
    }

    const {i18n} = this.bindings;

    return renderRefineModalFiltersSection({
      props: {
        i18n,
        withFacets: hasFacetElements,
        withAutomaticFacets: hasAutomaticFacets,
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
        i18nFooterButtonTextKey: 'view-results',
        host: this,
        isOpen: this.isOpen,
        onClose: () => {
          this.isOpen = false;
        },
        title: this.bindings.i18n.t('sort-and-filter'),
        numberOfItems: this.querySummaryState.total,
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
    'atomic-refine-modal': AtomicRefineModal;
  }
}
