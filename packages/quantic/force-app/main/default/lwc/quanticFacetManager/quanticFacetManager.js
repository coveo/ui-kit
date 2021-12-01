import {
  initializeWithHeadless,
  registerComponentForInit,
} from 'c/quanticHeadlessLoader';
import {api, LightningElement} from 'lwc';

/** @typedef {import("coveo").FacetManager} FacetManager */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticFacetManager` component acts as a container component allowing facets to be reordered dynamically as search queries are performed.
 * 
 * An item template element can be assigned to the `itemTemplate` slot allowing to customize the element that wraps each facet.
 * @category Search
 * @example
 * <c-quantic-facet-manager engine-id={engineId}>
 *   <c-quantic-facet engine-id={engineId} field="type"></c-quantic-facet>
 *   <c-quantic-facet engine-id={engineId} field="author"></c-quantic-facet>
 *
 *   <div slot="itemTemplate" class="slds-var-m-bottom_large"></div>
 * </c-quantic-facet-manager>
 */
export default class QuanticFacetManager extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  /** @type {boolean} */
  initialSearchExecuted = false;
  /** @type {boolean} */
  isSearchLoading = false;

  /** @type {FacetManager} */
  facetManager;
  /** @type {Function} */
  unsubscribeFacetManager;
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {Function} */
  unsubscribeSearchStatus;

  itemTemplate;

  hostReadyClass = 'facet-manager__host_ready';

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  disconnectedCallback() {
    this.unsubscribeFacetManager?.();
    this.unsubscribeSearchStatus?.();
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.resolveItemTemplate();
    this.moveFacetsToHost();

    this.facetManager = CoveoHeadless.buildFacetManager(engine);
    this.unsubscribeFacetManager = this.facetManager.subscribe(() =>
      this.updateFacetManagerState()
    );
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateSearchStatusState()
    );
  };

  updateFacetManagerState() {
    this.host.classList.remove(this.hostReadyClass);
    this.reorderFacets();
  }

  updateSearchStatusState() {
    this.initialSearchExecuted = !!this.searchStatus.state?.firstSearchExecuted;

    const isSearchAlreadyLoading = this.isSearchLoading;
    this.isSearchLoading = !!this.searchStatus.state?.isLoading;

    const initiatedSearch = !isSearchAlreadyLoading && this.isSearchLoading;
    if (initiatedSearch) {
      this.host.classList.remove(this.hostReadyClass);
    }

    const completedSearch = isSearchAlreadyLoading && !this.isSearchLoading;
    if (completedSearch) {
      this.reorderFacets();
    }
  }

  getFacetsFromSlot() {
    const isFacetManager = (tagName) => /-quantic-facet-manager$/i.test(tagName);
    return Array.from(this.querySelectorAll('*'))
      .filter((element) => isFacetManager(element.parentElement.tagName));
  }

  moveFacetsToHost() {
    const facets = this.getFacetsFromSlot();
    facets.forEach((facet) => {
      const wrapper = this.itemTemplate.cloneNode(false);
      // @ts-ignore
      wrapper.setAttribute('data-facet-id', facet.facetId ?? facet.field);
      wrapper.classList.add('facet-manager__item');

      wrapper.appendChild(facet);
      this.host.appendChild(wrapper);
    });
  }

  resolveItemTemplate() {
    this.itemTemplate = document.createElement('div');
    this.itemTemplate.classList.add('slds-var-m-bottom_large');

    const slotElement = this.querySelector('*[slot="itemTemplate"]');
    if (slotElement) {
      this.itemTemplate = slotElement.cloneNode(false);
      this.itemTemplate.removeAttribute('slot');

      slotElement.remove();
    }
  }

  reorderFacets() {
    if (!this.initialSearchExecuted) {
      return;
    }

    // @ts-ignore
    const payload = this.facets.map((f) => ({facetId: f.dataset.facetId, payload: f}));
    const sortedFacets = this.facetManager.sort(payload).map((f) => f.payload);

    sortedFacets.forEach((sortedFacet) => {
      this.host.appendChild(sortedFacet);
    });

    this.host.classList.add(this.hostReadyClass);
  }

  get host() {
    return this.template.querySelector('.facet-manager__host');
  }

  get facets() {
    return Array.from(this.host.children).filter(this.isPseudoFacet);
  }

  isPseudoFacet(el) {
    return 'facetId' in el.dataset;
  }
}
