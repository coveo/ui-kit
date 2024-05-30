import {LightningElement, api, track} from 'lwc';

/**
 * @typedef Suggestion
 * @property {number} key
 * @property {string} value
 * @property {string} rawValue
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
   * The query suggestions to display.
   * @api
   * @type {String[]}
   */
  @api recentQueries;
  @api query;

  /**
   * Move highlighted selection up.
   */
  @api
  selectionUp() {
    this.selectionIndex--;
    if (this.selectionIndex < 0) {
      this.selectionIndex = this.suggestionsToRender.length - 1;
    }
  }

  /**
   * Move highlighted selection down.
   */
  @api
  selectionDown() {
    this.selectionIndex++;
    if (this.selectionIndex >= this.suggestionsToRender.length) {
      this.selectionIndex = 0;
    }
  }

  /**
   * Return the currently selected suggestion.
   * @returns {Suggestion}
   */
  @api
  getCurrentSelectedValue() {
    if (this.selectionIndex > -1) {
      return this.suggestions[this.selectionIndex];
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

  formatValue(value) {
    const highlightedValue = CoveoHeadless.HighlightUtils.highlightString({
      content: value,
      openingDelimiter: '<b class="font-bold">',
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

  get suggestionsToRender() {
    if (this.shouldDisplayRecentQueries) {
      const options = [
        ...this.filteredRecentQueries,
        ...this.filteredSuggestions,
      ]?.map((option, index) => ({
        ...option,
        key: index + 1,
        isSelected: this.selectionIndex === index + 1,
        containerCSSClass: `slds-media slds-listbox__option slds-listbox__option_plain slds-media_small ${this.selectionIndex === index + 1 ? 'slds-has-focus' : ''} slds-grid suggestion-option`,
      }));
      return [
        {
          key: 0,
          isSelected: this.selectionIndex === 0,
          isClearRecentQueryButton: true,
        },
        ...options,
      ];
    }
    return this.filteredSuggestions.map((option, index) => ({
      ...option,
      key: index,
      isSelected: this.selectionIndex === index,
      containerCSSClass: `slds-media slds-listbox__option slds-listbox__option_plain slds-media_small ${this.selectionIndex === index ? 'slds-has-focus' : ''} slds-grid suggestion-option`,
    }));
  }

  get filteredSuggestions() {
    return (
      this.suggestions?.filter((suggestion) =>
        this.filteredRecentQueries.some(
          (recentQuery) => recentQuery.rawValue !== suggestion.rawValue
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
          value: this.formatValue(recentQuery),
          rawValue: recentQuery,
          isRecentQuery: true,
        })) || []
    );
  }

  emitSuggestionHighlighted() {
    if (!(this.shouldDisplayRecentQueries && this.selectionIndex === 0)) {
      const highlightChangeEvent = new CustomEvent('highlightchange', {
        detail: this.suggestionsToRender[this.selectionIndex],
      });
      this.dispatchEvent(highlightChangeEvent);
    }
  }

  get shouldDisplayRecentQueries() {
    return !!this.filteredRecentQueries?.length;
  }

  clearRecentQueries() {
    this.dispatchEvent(
      new CustomEvent('quantic__clearqueries', {
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

  get clearCSS() {
    return `slds-media slds-listbox__option slds-listbox__option_plain slds-media_small ${this.selectionIndex === 0 ? 'slds-has-focus' : ''} slds-grid recent-searches__label`;
  }

  get listboxCssClass() {
    return `slds-dropdown slds-dropdown_length-7 slds-dropdown_fluid quantic-suggestions-list ${
      this.suggestions?.length ? '' : 'slds-hidden'
    }`;
  }
}
