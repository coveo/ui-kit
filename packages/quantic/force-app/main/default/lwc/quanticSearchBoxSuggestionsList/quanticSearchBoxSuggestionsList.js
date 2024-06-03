import clear from '@salesforce/label/c.quantic_Clear';
import recentQueries from '@salesforce/label/c.quantic_RecentQueries';
import {LightningElement, api, track} from 'lwc';

const optionCSSClass =
  'slds-media slds-listbox__option slds-listbox__option_plain slds-media_small slds-grid option';

/**
 * @typedef Suggestion
 * @property {number} key
 * @property {string} value
 * @property {string} rawValue
 * @property {false} isRecentQuery
 */

/**
 * @typedef RecentQuery
 * @property {number} key
 * @property {string} value
 */

/**
 * The `QuanticSearchBoxSuggestionsList` is used internally by search box components to display the query suggestions in an omnibox.
 * @fires CustomEvent#highlightchange
 * @fires CustomEvent#suggestionselected
 * @fires CustomEvent#quantic__clearrecentqueries
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-search-box-suggestions-list suggestions={suggestions} onhighlightchange={handleHighlightChange} onsuggestionselected={handleSuggestionSelection}></c-quantic-search-box-suggestions-list>
 */
export default class QuanticSearchBoxSuggestionsList extends LightningElement {
  /**
   * The query suggestions to display.
   * @api
   * @type {Suggestion[]}
   */
  @api suggestions = [];
  /**
   * The list containing the recent query suggestions.
   * @api
   * @type {String[]}
   */
  @api recentQueries;
  /**
   * The current search query value.
   * @api
   * @type {string}
   */
  @api query;
  /**
   * The maximum number of suggestions to display.
   * @api
   * @type {number}
   * @defaultValue 7
   */
  @api maxNumberOfSuggestions;

  labels = {
    clear,
    recentQueries,
  };

  /**
   * Move highlighted selection up.
   */
  @api
  selectionUp() {
    this.selectionIndex--;
    if (this.selectionIndex < 0) {
      this.selectionIndex = this.allOptions.length - 1;
    }
  }

  /**
   * Move highlighted selection down.
   */
  @api
  selectionDown() {
    this.selectionIndex++;
    if (this.selectionIndex >= this.allOptions.length) {
      this.selectionIndex = 0;
    }
  }

  /**
   * Return the currently selected suggestion.
   * @returns {Object}
   */
  @api
  getCurrentSelectedValue() {
    if (this.selectionIndex > -1) {
      return this.allOptions[this.selectionIndex];
    }
    return undefined;
  }

  /**
   * Reset the current selection.
   */
  @api
  resetSelection() {
    this.selectionIndex = -1;
  }

  /** @type {number} */
  @track selectionIndex = -1;
  /** @type {boolean} */
  initialRender = true;

  renderedCallback() {
    if (this.selectionIndex > -1) {
      this.emitSuggestionHighlighted();
    }
    if (this.initialRender) {
      const listboxId = this.template.querySelector('div').getAttribute('id');
      const suggestionListEvent = new CustomEvent('suggestionlistrender', {
        detail: listboxId,
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(suggestionListEvent);
      this.initialRender = false;
    }
  }

  get allOptions() {
    if (this.shouldDisplayRecentQueries) {
      const options = [
        ...this.filteredRecentQueries,
        ...this.filteredSuggestions,
      ]?.map((option, index) => ({
        ...option,
        key: index + 1,
        isSelected: this.selectionIndex === index + 1,
        containerCSSClass: `${optionCSSClass} ${this.selectionIndex === index + 1 ? 'slds-has-focus' : ''}`,
        icon: option.isRecentQuery ? 'utility:clock' : 'utility:search',
      }));
      return [
        {
          key: 0,
          isSelected: this.selectionIndex === 0,
          isClearRecentQueryButton: true,
        },
        ...options,
      ].slice(0, this.maxNumberOfSuggestions + 1);
    }
    return this.filteredSuggestions
      .map((option, index) => ({
        ...option,
        key: index,
        isSelected: this.selectionIndex === index,
        containerCSSClass: `${optionCSSClass} ${this.selectionIndex === index ? 'slds-has-focus' : ''}`,
        icon: 'utility:search',
      }))
      .slice(0, this.maxNumberOfSuggestions);
  }

  get filteredSuggestions() {
    return (
      this.suggestions?.filter(
        (suggestion) =>
          !this.filteredRecentQueries.some(
            (recentQuery) => recentQuery.rawValue === suggestion.rawValue
          )
      ) || []
    );
  }

  get filteredRecentQueries() {
    return (
      this.recentQueries
        ?.filter(
          (recentQuery) =>
            recentQuery !== this.query &&
            recentQuery.toLowerCase().startsWith(this.query.toLowerCase())
        )
        .map((recentQuery) => ({
          value: this.formatRecentQuery(recentQuery),
          rawValue: recentQuery,
          isRecentQuery: true,
        })) || []
    );
  }

  formatRecentQuery(value) {
    const highlightedValue = CoveoHeadless.HighlightUtils.highlightString({
      content: value,
      openingDelimiter: '<b>',
      closingDelimiter: '</b>',
      highlights: [
        {
          offset: this.query.length,
          length: value.length - this.query.length,
        },
      ],
    });
    return highlightedValue;
  }

  emitSuggestionHighlighted() {
    if (!(this.shouldDisplayRecentQueries && this.selectionIndex === 0)) {
      const highlightChangeEvent = new CustomEvent('highlightchange', {
        detail: this.allOptions[this.selectionIndex],
      });
      this.dispatchEvent(highlightChangeEvent);
    }
  }

  get shouldDisplayRecentQueries() {
    return !!this.filteredRecentQueries?.length;
  }

  clearRecentQueries() {
    this.dispatchEvent(
      new CustomEvent('quantic__clearrecentqueries', {
        bubbles: true,
        composed: true,
      })
    );
  }

  handleSuggestionSelection(event) {
    const liElement = event.target.closest('li.slds-listbox__item');
    const textValue = liElement.dataset.rawvalue;

    const suggestionSelectedEvent = new CustomEvent('suggestionselected', {
      detail: textValue,
    });
    this.dispatchEvent(suggestionSelectedEvent);
  }

  handleSuggestionHover() {
    this.resetSelection();
  }

  preventDefault(event) {
    event.preventDefault();
  }

  get clearRecentQueriesOptionCSSClass() {
    return `${optionCSSClass} ${this.selectionIndex === 0 ? 'slds-has-focus' : ''} recent-searches__label`;
  }

  get listboxCssClass() {
    return `slds-dropdown slds-dropdown_length-10 slds-dropdown_fluid quantic-suggestions-list ${
      this.allOptions?.length ? '' : 'slds-hidden'
    }`;
  }
}
