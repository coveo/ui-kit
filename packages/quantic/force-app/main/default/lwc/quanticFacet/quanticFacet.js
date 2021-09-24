import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {I18nUtils, regexEncode} from 'c/quanticUtils';

import showMore from '@salesforce/label/c.quantic_ShowMore';
import showLess from '@salesforce/label/c.quantic_ShowLess';
import showMoreFacetValues from '@salesforce/label/c.quantic_ShowMoreFacetValues';
import showLessFacetValues from '@salesforce/label/c.quantic_ShowLessFacetValues';
import clearFilter from '@salesforce/label/c.quantic_ClearFilter';
import clearFilter_plural from '@salesforce/label/c.quantic_ClearFilter_plural';
import search from '@salesforce/label/c.quantic_Search';
import moreMatchesFor from '@salesforce/label/c.quantic_MoreMatchesFor';
import noMatchesFor from '@salesforce/label/c.quantic_NoMatchesFor';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';

const displayOptions = {
  checkbox: 'checkbox',
  link: 'link'
}

export default class QuanticFacet extends LightningElement {
  /** @type {import("coveo").FacetState} */
  // @ts-ignore
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
  /** @type {boolean} */
  @api isCollapsed = false;
  /** @type  {import("coveo").FacetSortCriterion}*/
  @api sortCriteria = 'automatic';
  /** @type {boolean} */
  @api noSearch = false;
  /** @type {string} */
  @api displayValuesAs = displayOptions.checkbox;

  /** @type {import("coveo").Facet}} */
  facet;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;
  /** @type {boolean} */
  isExpanded = true;
  /** @type {HTMLInputElement} */
  input;

  labels = {
    showMore,
    showLess,
    showMoreFacetValues,
    showLessFacetValues,
    clearFilter,
    clearFilter_plural,
    search,
    moreMatchesFor,
    noMatchesFor,
    collapseFacet,
    expandFacet,
  };

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  initialize = (engine) => {
    const options = {
      field: this.field,
      sortCriteria: this.sortCriteria,
      numberOfValues: Number(this.numberOfValues),
      facetSearch: {numberOfValues: Number(this.numberOfValues)},
      facetId: this.facetId ?? this.field,
    };
    this.facet = CoveoHeadless.buildFacet(engine, {options});
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
  }

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
    this.input = this.template.querySelector('.facet__searchbox-input');
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
        .map((v) => ({
          ...v,
          checked: v.state === 'selected',
          highlightedResult: v.value,
        })) || []
    );
  }

  get query() {
    return this.input?.value;
  }

  get canShowMoreSearchResults() {
    return this.facet?.state.facetSearch.moreValuesAvailable;
  }

  get canShowMore() {
    if (!this.facet) {
      return false;
    }
    return this.state.canShowMoreValues;
  }

  get canShowLess() {
    if (!this.facet) {
      return false;
    }
    return this.state.canShowLessValues;
  }

  get hasValues() {
    return this.values.length !== 0;
  }

  get hasActiveValues() {
    return this.state.hasActiveValues;
  }

  get hasSearchResults() {
    return this.getSearchValues().length > 0;
  }

  get facetSearchResults() {
    return this.getSearchValues().map((result) => ({
      value: result.rawValue,
      state: 'idle',
      numberOfResults: result.count,
      checked: false,
      highlightedResult: this.highlightResult(
        result.displayValue,
        this.input?.value
      ),
    }));
  }

  get isSearchComplete() {
    return !this.facet.state.isLoading;
  }

  get showMoreFacetValuesLabel() {
    return I18nUtils.format(this.labels.showMoreFacetValues, this.label);
  }

  get showLessFacetValuesLabel() {
    return I18nUtils.format(this.labels.showLessFacetValues, this.label);
  }

  get moreMatchesForLabel() {
    return I18nUtils.format(this.labels.moreMatchesFor, this.query);
  }

  get noMatchesForLabel() {
    return I18nUtils.format(this.labels.noMatchesFor, this.query);
  }

  get actionButtonIcon() {
    return this.isExpanded ? 'utility:dash' : 'utility:add';
  }

  get actionButtonLabel() {
    const label = this.isExpanded ? this.labels.collapseFacet : this.labels.expandFacet;
    return I18nUtils.format(label, this.label);
  }

  get isFacetSearchActive() {
    return this.input?.value !== '';
  }

  get isDisplayAsLink() {
    return this.displayValuesAs === displayOptions.link
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

  onSelectClickHandler(value) {
    if (this.isDisplayAsLink) {
      this.facet.toggleSingleSelect(value);
    } else {
      this.facet.toggleSelect(value);
    }
  }

  getSearchValues() {
    return this.facet?.state?.facetSearch?.values ?? [];
  }

  /**
   * @param {CustomEvent<import("coveo").FacetValue>} evt
   */
  onSelect(evt) {
    const specificSearchResult = {
      displayValue: evt.detail.value,
      rawValue: evt.detail.value,
      count: evt.detail.numberOfResults,
    };
    if (this.isFacetSearchActive) {
      this.facet.facetSearch.select(specificSearchResult);
    } else {
      this.onSelectClickHandler(evt.detail);
    }
    this.clearInput();
  }

  showMore() {
    this.facet.showMoreValues();
  }

  showLess() {
    this.facet.showLessValues();
  }

  clearSelections() {
    this.facet.deselectAll();
    this.clearInput();
  }

  toggleFacetVisibility() {
    if (this.isExpanded) {
      this.clearInput();
    }
    this.isExpanded = !this.isExpanded;
  }

  preventDefault(evt) {
    evt.preventDefault();
  }

  handleKeyUp() {
    if (this.isSearchComplete) {
      this.facet.facetSearch.updateText(this.input?.value);
      this.facet.facetSearch.search();
    }
  }

  clearInput() {
    if(this.input) {
      this.input.value = '';
    }
    this.facet.facetSearch.updateText('');
  }

  highlightResult(result, query) {
    if (!query || query.trim() === '') {
      return result;
    }
    const regex = new RegExp(`(${regexEncode(query)})`, 'i');
    return result.replace(regex, '<b class="facet__search-result_highlight">$1</b>');
  }
}
