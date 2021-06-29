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
  @track categoryFacetBreadcrumbs;
  /** @type {import("coveo").NumericFacetBreadcrumb[]} */
  @track numericFacetBreadcrumbs;
  /** @type {import("coveo").DateFacetBreadcrumb[]} */
  @track dateFacetBreadcrumbs;
  /** @type {Boolean} */
  @track hasBreadcrumbs;

  /** @type {String} */
  @api engineId;

  /** @type {String} */
  @api categoryDivider = '/';

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
    if (this.unsubscribe) {
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

  formatRangeBreadcrumbValue(breadcrumb) {
    return {
      ...breadcrumb,
      values: (breadcrumb.values.map(range => ({
        ...range,
        value: `${range.value.start} - ${range.value.end}`
      })))
    };
  }

  formatCategoryBreadcrumbValue(breadcrumb) {
    console.log(JSON.stringify(breadcrumb));
    if (breadcrumb.path.length <= 3) {
      return breadcrumb.path.map((breadcrumbValue) => breadcrumbValue.value);
    }
    const collapsed = '...';
    const firstBreadcrumbValue = breadcrumb.path[0].value;
    const lastTwoBreadcrumbsValues = breadcrumb.path
      .slice(-2)
      .map((breadcrumbValue) => breadcrumbValue.value);
    return [firstBreadcrumbValue, collapsed, ...lastTwoBreadcrumbsValues];
  }

  formatDate(dateValue) {
    const date = new Date(dateValue);
    return date.toLocaleDateString();
  }

  formatDateRangeFacet(breadcrumb) {
    return {
      ...breadcrumb,
      values: breadcrumb.values.map(range => ({
        ...range,
        value: `${this.formatDate(range.value.start)} - ${this.formatDate(range.value.end)}`
      }))
    };
  }

  get facetBreadcrumbValues() {
    return this.facetBreadcrumbs || [];
  }

  get numericFacetBreadcrumbsValues() {
    return this.numericFacetBreadcrumbs.map(this.formatRangeBreadcrumbValue) || [];
  }

  get categoryFacetBreadcrumbsValues() {
    return this.categoryFacetBreadcrumbs.map(breadcrumb => {
      const breadcrumbValues = this.formatCategoryBreadcrumbValue(breadcrumb);
      return {
        facetId: breadcrumb.facetId,
        field: breadcrumb.field,
        deselect: breadcrumb.deselect,
        value:  breadcrumbValues.join(` ${this.categoryDivider} `)
      };
    }) || [];
  }

  get dateFacetBreadcrumbsValues() {
    return this.dateFacetBreadcrumbs.map(breadcrumb => this.formatDateRangeFacet(breadcrumb)) || [];
  }
}