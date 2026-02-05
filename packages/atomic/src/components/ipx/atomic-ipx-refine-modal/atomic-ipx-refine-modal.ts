import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildBreadcrumbManager,
  buildQuerySummary,
  type QuerySummary,
  type QuerySummaryState,
} from '@coveo/headless';
import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {renderRefineModalBody} from '@/src/components/common/refine-modal/body';
import {
  renderRefineModalFiltersClearButton,
  renderRefineModalFiltersSection,
} from '@/src/components/common/refine-modal/filters';
import {renderRefineModal} from '@/src/components/common/refine-modal/modal';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {
  type BaseFacetElement,
  collapseFacetsAfter,
} from '../../common/facets/facet-common';
import {popoverClass} from '../../common/facets/popover/popover-type';
import {isRefineModalFacet} from '../../common/interface/store';
import type {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-ipx-refine-modal` component is automatically created as a child of the `atomic-search-interface` when the `atomic-ipx-refine-toggle` is initialized.
 *
 * When the modal is opened, the class `atomic-modal-opened` is added to the interface element and the body, allowing further customization.
 *
 * @slot facets - Slot for facet elements to be displayed in the modal.
 *
 * @part title - The title of the modal.
 * @part close-button - The button in the header that closes the modal.
 * @part close-icon - The icon of the close button.
 * @part content - The wrapper around the content inside the body of the modal.
 * @part section-title - The title for each section.
 * @part section-filters-title - The title for the filters section.
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
@customElement('atomic-ipx-refine-modal')
@bindings()
@withTailwindStyles
export class AtomicIpxRefineModal
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles: CSSResultGroup = [
    css`
      @reference '../../../utils/tailwind.global.tw.css';

      :host::part(container) {
        border-radius: 0.25rem;
        max-height: calc(100vh - 4.25rem);
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

  public breadcrumbManager!: BreadcrumbManager;
  @bindStateToController('breadcrumbManager')
  @state()
  private breadcrumbManagerState!: BreadcrumbManagerState;

  public querySummary!: QuerySummary;
  @bindStateToController('querySummary')
  @state()
  public querySummaryState!: QuerySummaryState;

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
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
    const clonedFacets = this.cloneFacets(facets);

    collapseFacetsAfter(clonedFacets, this.collapseFacetsAfter);
    divSlot.append(...clonedFacets);

    return divSlot;
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

  private addFacetColumnStyling(el: HTMLElement) {
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.gap = 'var(--atomic-refine-modal-facet-margin, 20px)';
  }

  private renderFilters() {
    const hasFacetElements = this.bindings.store.getFacetElements().length > 0;

    if (!hasFacetElements) {
      return nothing;
    }

    const {i18n} = this.bindings;

    return renderRefineModalFiltersSection({
      props: {
        i18n,
        withFacets: hasFacetElements,
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
        i18nFooterButtonTextKey: 'view-results',
        host: this,
        isOpen: this.isOpen,
        onClose: () => {
          this.isOpen = false;
        },
        title: this.bindings.i18n.t('filters'),
        numberOfItems: this.querySummaryState.total,
        openButton: this.openButton,
        boundary: 'element',
        scope: this.bindings.interfaceElement,
      },
    })(
      renderRefineModalBody(this.bindings.i18n)(html`${this.renderFilters()}`)
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-refine-modal': AtomicIpxRefineModal;
  }
}
