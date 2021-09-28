import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';
import LOCALE from '@salesforce/i18n/locale';

import clearFilter from '@salesforce/label/c.quantic_ClearFilter';
import clearFilter_plural from '@salesforce/label/c.quantic_ClearFilter_plural';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';

export default class QuanticDateFacet extends LightningElement {
  /** @type {import("coveo").DateFacetState} */
  // @ts-ignore TODO: Check CategoryFacetState typing and integration with LWC/Quantic
  @track state = {
    values: [],
  };

  /** @type {string} */
  @api facetId;
  /** @type {string} */
  @api field;
  /** @type {string} */
  @api label;
  /** @type {string} */
  @api engineId;
  /** @type {number} */
  @api numberOfValues = 8;
  /** @type {(any) => string} */
  @api formattingFunction = (item) => `${new Intl.DateTimeFormat(LOCALE).format(
    new Date(item.start)
  )} - ${new Intl.DateTimeFormat(LOCALE).format(
    new Date(item.end)
  )}`;
  /** @type {boolean} */
  @api get isCollapsed() {
    return this._isCollapsed;
  }
  set isCollapsed(collapsed) {
    this._isCollapsed = collapsed;
  }
    
  /** @type {boolean} */
  _isCollapsed = false;

  /** @type {import("coveo").DateFacet} */
  facet;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

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
   * @param {import("coveo").SearchEngine} engine
   */
  initialize = (engine) => {
    this.facet = CoveoHeadless.buildDateFacet(engine, {
      options: {
        field: this.field,
        numberOfValues: Number(this.numberOfValues),
        generateAutomaticRanges: true,
        facetId: this.facetId ?? this.field,
      },
    });
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = this.facet.state;
  }

  get values() {
    return (
      this.state.values
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
    return this.state.hasActiveValues;
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
   * @param {CustomEvent<import("coveo").DateFacetValue>} evt
   */
  onSelect(evt) {
    this.facet.toggleSelect(evt.detail);
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
