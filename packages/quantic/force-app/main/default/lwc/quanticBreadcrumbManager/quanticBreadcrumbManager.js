import {
  LightningElement,
  track,
  api
} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless
} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';

import nMore from '@salesforce/label/c.quantic_NMore';
import clearAllFilters from '@salesforce/label/c.quantic_ClearAllFilters';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").BreadcrumbManager} BreadcrumbManager */
/** @typedef {import("coveo").FacetBreadcrumb} FacetBreadcrumb */
/** @typedef {import("coveo").CategoryFacetBreadcrumb} CategoryFacetBreadcrumb */
/** @typedef {import("coveo").NumericFacetBreadcrumb} NumericFacetBreadcrumb */
/** @typedef {import("coveo").DateFacetBreadcrumb} DateFacetBreadcrumb */
/** @typedef {import("coveo").BreadcrumbValue} BreadcrumbValue */

/**
 * The `QuanticBreadcrumbManager component creates breadcrumbs that display a summary of the currently active facet values.
 * @category LWC
 * @example
 * <c-quantic-breadcrumb-manager engine-id={engineId}></c-quantic-breadcrumb-manager>
 */
export default class QuanticBreadcrumbManager extends LightningElement {
  /**
   * The ID of the engine instance with which to register.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * A character that divides each path segment in a category facet breadcrumb.
   * @api
   * @type {string}
   */
  @api categoryDivider = '/';
  /** 
   * Number of breadcrumbs to display when collapsed.
   * @api
   * @type {Number}
   */
  @api collapseThreshold = 5;

  /** @type {FacetBreadcrumb[]} */
  @track facetBreadcrumbs = [];
  /** @type {CategoryFacetBreadcrumb[]} */
  @track categoryFacetBreadcrumbs = [];
  /** @type {NumericFacetBreadcrumb[]} */
  @track numericFacetBreadcrumbs = [];
  /** @type {DateFacetBreadcrumb[]} */
  @track dateFacetBreadcrumbs = [];
  /** @type {Boolean} */
  @track hasBreadcrumbs;

  /** @type {BreadcrumbManager} */
  breadcrumbManager;
  /** @type {Function} */
  unsubscribe;
  /** @type {string[]} */
  expandedBreadcrumbFieldsState = [];

  labels = {
    nMore,
    clearAllFilters
  }

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /** @param {SearchEngine} engine */
  initialize = (engine) => {
    this.breadcrumbManager = CoveoHeadless.buildBreadcrumbManager(engine);
    this.unsubscribe = this.breadcrumbManager.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
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

  /** @param {BreadcrumbValue | CategoryFacetBreadcrumb} breadcrumb */
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
      showMoreButtonText: I18nUtils.format(this.labels.nMore, breadcrumb.values.length - this.collapseThreshold),
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