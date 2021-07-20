import {
  LightningElement,
  track,
  api
} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless
} from 'c/quanticHeadlessLoader';
import {I18nService} from 'c/quanticUtils';

import nMore from '@salesforce/label/c.quantic_NMore';
import clearAllFilters from '@salesforce/label/c.quantic_ClearAllFilters';

export default class QuanticBreadcrumbManager extends LightningElement {
  /** @type {import("coveo").BreadcrumbManager} */
  breadcrumbManager;
  /** @type {() => void} */
  unsubscribe;
  /** @type {String[]} */
  expandedBreadcrumbFieldsState = [];

  /** @type {import("coveo").FacetBreadcrumb[]} */
  @track facetBreadcrumbs = [];
  /** @type {import("coveo").CategoryFacetBreadcrumb[]} */
  @track categoryFacetBreadcrumbs = [];
  /** @type {import("coveo").NumericFacetBreadcrumb[]} */
  @track numericFacetBreadcrumbs = [];
  /** @type {import("coveo").DateFacetBreadcrumb[]} */
  @track dateFacetBreadcrumbs = [];
  /** @type {Boolean} */
  @track hasBreadcrumbs;
  

  /** @type {String} */
  @api engineId;
  /** @type {String} */
  @api categoryDivider = '/';
  /** @type {Number} */
  @api collapseThreshold = 5;

  labels = {
    nMore,
    clearAllFilters
  }

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
    this.facetBreadcrumbs = this.breadcrumbManager.state.facetBreadcrumbs;
    this.categoryFacetBreadcrumbs = this.breadcrumbManager.state.categoryFacetBreadcrumbs;
    this.numericFacetBreadcrumbs = this.breadcrumbManager.state.numericFacetBreadcrumbs;
    this.dateFacetBreadcrumbs = this.breadcrumbManager.state.dateFacetBreadcrumbs;
    this.hasBreadcrumbs = this.breadcrumbManager.state.hasBreadcrumbs;
  }

  @api
  deselectAll() {
    this.breadcrumbManager.deselectAll();
    this.expandedBreadcrumbFieldsState = [];
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

  formatDateRangeBreadcrumbValue(breadcrumb) {
    return {
      ...breadcrumb,
      values: breadcrumb.values.map(range => ({
        ...range,
        value: `${this.formatDate(range.value.start)} - ${this.formatDate(range.value.end)}`
      }))
    };
  }

  resetExpandedBreadcrumbFieldState(breadcrumb) {
    if (breadcrumb.values.length <= this.collapseThreshold) {
      const newState = [...this.expandedBreadcrumbFieldsState];
      newState.splice(
        this.expandedBreadcrumbFieldsState.indexOf(breadcrumb.field),
        1
      );
      this.expandedBreadcrumbFieldsState = newState;
    }
  }

  getBreadcrumbValuesCollapsed(breadcrumb) {
    return ({
      ...breadcrumb,
      values: breadcrumb.values.slice(0, this.collapseThreshold),
      showMoreButton: true,
      showMoreButtonText: I18nService.format(this.labels.nMore, breadcrumb.values.length - this.collapseThreshold),
      expandButtonClick: () => {
        this.expandedBreadcrumbFieldsState = [...this.expandedBreadcrumbFieldsState, breadcrumb.field];
      }
    });
  }

  getShouldCollapseBreadcrumbValues(breadcrumb) {
    this.resetExpandedBreadcrumbFieldState(breadcrumb);
    return breadcrumb.values.length > this.collapseThreshold && !this.expandedBreadcrumbFieldsState.includes(breadcrumb.field);
  }

  getBreadcrumbValues(breadcrumb) {
    return (this.getShouldCollapseBreadcrumbValues(breadcrumb) ?
      this.getBreadcrumbValuesCollapsed(breadcrumb) :
      breadcrumb);
  }

  get facetBreadcrumbValues() {
    const facetBreadcrumbsToDisplay = this.facetBreadcrumbs || [];
    return facetBreadcrumbsToDisplay.map(breadcrumb => this.getBreadcrumbValues(breadcrumb));
  }

  get numericFacetBreadcrumbsValues() {
    const numericFacetBreadcrumbsToDisplay = this.numericFacetBreadcrumbs.map(this.formatRangeBreadcrumbValue) || [];
    return numericFacetBreadcrumbsToDisplay.map(breadcrumb => this.getBreadcrumbValues(breadcrumb));
  }

  get categoryFacetBreadcrumbsValues() {
    return this.categoryFacetBreadcrumbs.map(breadcrumb => {
      const breadcrumbValues = this.formatCategoryBreadcrumbValue(breadcrumb);
      return {
        facetId: breadcrumb.facetId,
        field: breadcrumb.field,
        deselect: breadcrumb.deselect,
        value: breadcrumbValues.join(` ${this.categoryDivider} `)
      };
    }) || [];
  }

  get dateFacetBreadcrumbsValues() {
    const dateFacetBreadcrumbsToDisplay = this.dateFacetBreadcrumbs.map(breadcrumb => this.formatDateRangeBreadcrumbValue(breadcrumb)) || [];
    return dateFacetBreadcrumbsToDisplay.map(breadcrumb => this.getBreadcrumbValues(breadcrumb));
  }
}