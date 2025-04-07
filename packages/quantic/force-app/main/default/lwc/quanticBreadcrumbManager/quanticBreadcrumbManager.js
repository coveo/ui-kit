import clearAllFilters from '@salesforce/label/c.quantic_ClearAllFilters';
import clearFilter from '@salesforce/label/c.quantic_ClearFilter';
import colon from '@salesforce/label/c.quantic_Colon';
import nMore from '@salesforce/label/c.quantic_NMore';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getFromStore,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {I18nUtils, RelativeDateFormatter, Store} from 'c/quanticUtils';
import {LightningElement, track, api} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").BreadcrumbManager} BreadcrumbManager */
/** @typedef {import("coveo").FacetBreadcrumb} FacetBreadcrumb */
/** @typedef {import("coveo").CategoryFacetBreadcrumb} CategoryFacetBreadcrumb */
/** @typedef {import("coveo").NumericFacetBreadcrumb} NumericFacetBreadcrumb */
/** @typedef {import("coveo").DateFacetBreadcrumb} DateFacetBreadcrumb */
/** @typedef {import("coveo").BreadcrumbValue} BreadcrumbValue */
/** @typedef {import("coveo").DateFacetValue} DateFacetValue */

/**
 * The `QuanticBreadcrumbManager` component creates breadcrumbs that display a summary of the currently active facet values.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-breadcrumb-manager engine-id={engineId} category-divider=";" collapse-threshold="4"></c-quantic-breadcrumb-manager>
 */
export default class QuanticBreadcrumbManager extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * A character that divides each path segment in a category facet breadcrumb.
   * @api
   * @type {string}
   * @defaultValue `'/'`
   */
  @api categoryDivider = '/';
  /**
   * Maximum number of displayed breadcrumb values. When more values are selected, additional values appear under the "More" button.
   * @api
   * @type {Number}
   * @defaultValue `5`
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
  /** @type {boolean} */
  hasInitializationError = false;

  labels = {
    nMore,
    clearFilter,
    clearAllFilters,
    colon,
  };

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.breadcrumbManager = getHeadlessBundle(
      this.engineId
    ).buildBreadcrumbManager(engine);
    this.unsubscribe = this.breadcrumbManager.subscribe(() =>
      this.updateState()
    );
  };

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.facetBreadcrumbs = this.breadcrumbManager.state.facetBreadcrumbs;
    this.categoryFacetBreadcrumbs =
      this.breadcrumbManager.state.categoryFacetBreadcrumbs;
    this.numericFacetBreadcrumbs =
      this.breadcrumbManager.state.numericFacetBreadcrumbs;
    this.dateFacetBreadcrumbs =
      this.breadcrumbManager.state.dateFacetBreadcrumbs;
    this.hasBreadcrumbs = this.breadcrumbManager.state.hasBreadcrumbs;
  }

  deselectAll() {
    this.breadcrumbManager.deselectAll();
    this.expandedBreadcrumbFieldsState = [];
  }

  formatRangeBreadcrumbValue(breadcrumb) {
    const data = getFromStore(this.engineId, Store.facetTypes.NUMERICFACETS);
    const facetId = breadcrumb.facetId.replace('_input', '');
    return {
      ...breadcrumb,
      label: data ? data[facetId]?.label : breadcrumb.field,
      values: breadcrumb.values.map((range) => ({
        ...range,
        value: `${range.value.start} - ${range.value.end}`,
        formattedValue: data[facetId]?.format(range.value),
      })),
    };
  }

  formatCategoryBreadcrumbValue(breadcrumb) {
    const data = getFromStore(this.engineId, Store.facetTypes.CATEGORYFACETS);
    const format = data[breadcrumb.facetId]?.format ?? ((item) => item.value);

    if (breadcrumb.path.length <= 3) {
      return breadcrumb.path.map((breadcrumbValue) => format(breadcrumbValue));
    }
    const collapsed = '...';
    const firstBreadcrumbValue = format(breadcrumb.path[0]);
    const lastTwoBreadcrumbsValues = breadcrumb.path
      .slice(-2)
      .map((breadcrumbValue) => format(breadcrumbValue));
    return [firstBreadcrumbValue, collapsed, ...lastTwoBreadcrumbsValues];
  }

  /**
   *
   * @param {DateFacetValue} dateRange
   */
  formatDateRange(dateRange) {
    try {
      const startDate = getHeadlessBundle(
        this.engineId
      ).deserializeRelativeDate(dateRange.start);
      const endDate = getHeadlessBundle(this.engineId).deserializeRelativeDate(
        dateRange.end
      );

      return new RelativeDateFormatter().formatRange(startDate, endDate);
    } catch (err) {
      // handle it as a fixed date range
      return `${this.formatDate(dateRange.start)} - ${this.formatDate(
        dateRange.end
      )}`;
    }
  }

  formatDate(dateValue) {
    const date = new Date(dateValue);
    return date.toLocaleDateString();
  }

  formatDateRangeBreadcrumbValue(breadcrumb) {
    const data = getFromStore(this.engineId, Store.facetTypes.DATEFACETS);
    const facetId = breadcrumb.facetId.replace('_input', '');
    return {
      ...breadcrumb,
      label: data ? data[facetId]?.label : breadcrumb.field,
      values: breadcrumb.values.map((range) => ({
        ...range,
        value: data[facetId]?.format(range.value),
      })),
    };
  }

  formatFacetBreadcrumbValue(breadcrumb) {
    const data = getFromStore(this.engineId, Store.facetTypes.FACETS);
    return {
      ...breadcrumb,
      label: data ? data[breadcrumb.facetId]?.label : breadcrumb.field,
      values: breadcrumb.values.map((item) => ({
        ...item,
        formattedValue: data[breadcrumb.facetId]?.format(item.value),
      })),
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
    return {
      ...breadcrumb,
      values: breadcrumb.values.slice(0, this.collapseThreshold),
      showMoreButton: true,
      showMoreButtonText: I18nUtils.format(
        this.labels.nMore,
        breadcrumb.values.length - this.collapseThreshold
      ),
      expandButtonClick: () => {
        this.expandedBreadcrumbFieldsState = [
          ...this.expandedBreadcrumbFieldsState,
          breadcrumb.field,
        ];
      },
    };
  }

  getShouldCollapseBreadcrumbValues(breadcrumb) {
    this.resetExpandedBreadcrumbFieldState(breadcrumb);
    return (
      breadcrumb.values.length > this.collapseThreshold &&
      !this.expandedBreadcrumbFieldsState.includes(breadcrumb.field)
    );
  }

  getBreadcrumbValues(breadcrumb) {
    return this.getShouldCollapseBreadcrumbValues(breadcrumb)
      ? this.getBreadcrumbValuesCollapsed(breadcrumb)
      : breadcrumb;
  }

  get facetBreadcrumbValues() {
    const facetBreadcrumbsToDisplay =
      this.facetBreadcrumbs?.map((breadcrumb) =>
        this.formatFacetBreadcrumbValue(breadcrumb)
      ) || [];
    return facetBreadcrumbsToDisplay.map((breadcrumb) =>
      this.getBreadcrumbValues(breadcrumb)
    );
  }

  get numericFacetBreadcrumbsValues() {
    const numericFacetBreadcrumbsToDisplay =
      this.numericFacetBreadcrumbs.map((breadcrumb) =>
        this.formatRangeBreadcrumbValue(breadcrumb)
      ) || [];
    return numericFacetBreadcrumbsToDisplay.map((breadcrumb) =>
      this.getBreadcrumbValues(breadcrumb)
    );
  }

  get categoryFacetBreadcrumbsValues() {
    const data = getFromStore(this.engineId, Store.facetTypes.CATEGORYFACETS);
    return (
      this.categoryFacetBreadcrumbs.map((breadcrumb) => {
        const breadcrumbValues = this.formatCategoryBreadcrumbValue(breadcrumb);
        return {
          facetId: breadcrumb.facetId,
          field: breadcrumb.field,
          label: data ? data[breadcrumb.facetId]?.label : breadcrumb.field,
          deselect: breadcrumb.deselect,
          value: breadcrumbValues.join(` ${this.categoryDivider} `),
        };
      }) || []
    );
  }

  get dateFacetBreadcrumbsValues() {
    const dateFacetBreadcrumbsToDisplay =
      this.dateFacetBreadcrumbs.map((breadcrumb) =>
        this.formatDateRangeBreadcrumbValue(breadcrumb)
      ) || [];
    return dateFacetBreadcrumbsToDisplay.map((breadcrumb) =>
      this.getBreadcrumbValues(breadcrumb)
    );
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
