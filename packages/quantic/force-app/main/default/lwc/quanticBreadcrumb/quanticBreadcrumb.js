import {
  LightningElement,
  track,
  api
} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless
} from 'c/quanticHeadlessLoader';

export default class QuanticBreadcrumb extends LightningElement {
  /** @type {import("coveo").BreadcrumbManager} */
  breadcrumbManager;
  /** @type {() => void} */
  unsubscribe;

  /** @type {import("coveo").FacetBreadcrumb[]} */
  @track facetBreadcrumbs;
  /** @type {import("coveo").CategoryFacetBreadcrumb[]} */
  @track  categoryFacetBreadcrumbs;
  /** @type {import("coveo").NumericFacetBreadcrumb[]} */
  @track numericFacetBreadcrumbs;
  /** @type {import("coveo").DateFacetBreadcrumb[]} */
  @track dateFacetBreadcrumbs;
  /** @type {Boolean} */
  @track hasBreadcrumbs;

  /** @type {String} */
  @api engineId;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
  }

  /** @param {import("coveo").SearchEngine} engine */
  @api
  initialize(engine) {
    this.breadcrumbManager = CoveoHeadless.buildBreadcrumbManager(engine);
    this.unsubscribe = this.breadcrumbManager.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    if(this.unsubscribe) {
      this.unsubscribe();
    }
  }

  updateState() {
    console.log(this.breadcrumbManager.state);
    this.facetBreadcrumbs = this.breadcrumbManager.state.facetBreadcrumbs;
    this.categoryFacetBreadcrumbs = this.breadcrumbManager.state.categoryFacetBreadcrumbs;
    this.numericFacetBreadcrumbs = this.breadcrumbManager.state.numericFacetBreadcrumbs;
    this.dateFacetBreadcrumbs = this.breadcrumbManager.state.dateFacetBreadcrumbs;
    this.hasBreadcrumbs = this.breadcrumbManager.state.hasBreadcrumbs;
  }

  @api
  deselectAll() {
    this.breadcrumbManager.deselectAll();
  }

  /** @param {import("coveo").BreadcrumbValue | import("coveo").CategoryFacetBreadcrumb} breadcrumb */
  @api
  deselectBreadcrumb(breadcrumb) {
    this.breadcrumbManager.deselectBreadcrumb(breadcrumb);
  }

  get facetBreadcrumbValues() {
    return this.facetBreadcrumbs || [];
  }
}