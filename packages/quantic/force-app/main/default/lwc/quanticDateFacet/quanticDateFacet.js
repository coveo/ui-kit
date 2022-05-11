import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  registerToStore,
} from 'c/quanticHeadlessLoader';
import {I18nUtils, fromSearchApiDate, Store} from 'c/quanticUtils';
import LOCALE from '@salesforce/i18n/locale';

import clearFilter from '@salesforce/label/c.quantic_ClearFilter';
import clearFilter_plural from '@salesforce/label/c.quantic_ClearFilter_plural';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';

/** @typedef {import("coveo").DateFacetState} DateFacetState */
/** @typedef {import("coveo").DateFacet} DateFacet */
/** @typedef {import("coveo").DateFacetValue} DateFacetValue */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticDateFacet` component displays facet values as date ranges.
 * @category Search
 * @example
 * <c-quantic-date-facet engine-id={engineId} facet-id="myfacet" field="date" label="Date" number-of-values="5" formatting-function={formattingFunction} is-collapsed></c-quantic-date-facet>
 */
export default class QuanticDateFacet extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /** 
   * A unique identifier for the facet.
   * @api
   * @type {string}
   * @defaultValue Defaults to the `field` value.
   */
  @api facetId;
  /**
   * The index field whose values the facet should use.
   * @api
   * @type {string}
   */
  @api field;
  /**
   * The non-localized label for the facet. This label is displayed in the facet header.
   * @api
   * @type {string}
   */
  @api label = 'no-label';
  /**
   * The number of values to request for this facet, when there are no manual ranges.
   * @api
   * @type {number}
   * @defaultValue `8`
   */
  @api numberOfValues = 8;
  /**
   * The function used to format the date facet value label.
   * The default result format is the following: `[start] - [end]`
   * @api
   * @type {Function}
   * @param {DateFacetValue} item
   * @returns {string}
   */
  @api formattingFunction = (item) => `${new Intl.DateTimeFormat(LOCALE).format(
    new Date(fromSearchApiDate(item.start))
  )} - ${new Intl.DateTimeFormat(LOCALE).format(
    new Date(fromSearchApiDate(item.end))
  )}`;
  /** 
   * Whether the facet is collapsed.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api get isCollapsed() {
    return this._isCollapsed;
  }
  set isCollapsed(collapsed) {
    this._isCollapsed = collapsed;
  }
  /** @type {boolean} */
  _isCollapsed = false;

  static attributes = [
    'facetId',
    'field',
    'label',
    'numberOfValues',
    'formattingFunction',
  ]

  /** @type {DateFacetState} */
  @track state;

  /** @type {DateFacet} */
  facet;
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {boolean} */
  showPlaceholder = true;
  /** @type {Function} */
  unsubscribe;
  /** @type {Function} */
  unsubscribeSearchStatus;

  labels = {
    clearFilter,
    clearFilter_plural,
    collapseFacet,
    expandFacet,
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
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );

    this.facet = CoveoHeadless.buildDateFacet(engine, {
      options: {
        field: this.field,
        numberOfValues: Number(this.numberOfValues),
        generateAutomaticRanges: true,
        facetId: this.facetId ?? this.field,
      },
    });
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
    registerToStore(this.engineId, Store.facetTypes.DATEFACETS, {
      label: this.label,
      facetId: this.facet.state.facetId,
      format: this.formattingFunction,
      element: this.template.host,
    });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this.state = this.facet?.state;
    this.showPlaceholder = this.searchStatus?.state?.isLoading && !this.searchStatus?.state?.hasError && !this.searchStatus?.state?.firstSearchExecuted;
  }

  get values() {
    return (
      this.state?.values
        .filter((value) => value.numberOfResults || value.state === 'selected')
        .map((value) => {
          return {
            ...value,
            checked: value.state === 'selected',
          };
        }) || []
    );
  }

  get hasValues() {
    return this.values.length !== 0;
  }

  get hasActiveValues() {
    return this.state?.hasActiveValues;
  }

  get actionButtonIcon() {
    return this.isCollapsed ? 'utility:add' : 'utility:dash';
  }

  get actionButtonCssClasses() {
    return this.isCollapsed ? 'facet__expand' : 'facet__collapse';
  }

  get actionButtonLabel() {
    const label = this.isCollapsed ? this.labels.expandFacet : this.labels.collapseFacet;
    return I18nUtils.format(label, this.label);
  }

  get numberOfSelectedValues() {
    return this.state.values.filter(({state}) => state === 'selected').length;
  }

  get clearFilterLabel() {
    if (this.hasActiveValues) {
      const labelName = I18nUtils.getLabelNameWithCount('clearFilter', this.numberOfSelectedValues);
      return `${I18nUtils.format(this.labels[labelName], this.numberOfSelectedValues)}`;
    }
    return '';
  }

  /** 
   * @param {CustomEvent<{value: string}>} evt
   */
   onSelectValue(evt) {
    const item = this.values.find((value) => this.formattingFunction(value) === evt.detail.value);
    this.facet.toggleSelect(item);
  }

  clearSelections() {
    this.facet.deselectAll();
  }

  toggleFacetVisibility() {
    this._isCollapsed = !this.isCollapsed;
  }

  preventDefault(evt) {
    evt.preventDefault();
  }
}
