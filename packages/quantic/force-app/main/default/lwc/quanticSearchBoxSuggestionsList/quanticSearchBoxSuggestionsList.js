import clear from '@salesforce/label/c.quantic_Clear';
import recentQueries from '@salesforce/label/c.quantic_RecentQueries';
import {AriaLiveRegion} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

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
  @api maxNumberOfSuggestions = 7;

  labels = {
    clear,
    recentQueries,
  };

  /** @type {import('c/quanticUtils').AriaLiveUtils} */
  suggestionsAriaLiveMessage;

  /**
   * Move highlighted selection up.
   */
  @api
  selectionUp() {
    this.selectionIndex--;
    if (this.selectionIndex < 0) {
      this.selectionIndex = this.allOptions.length - 1;
    }
    return this.template
      .querySelectorAll('.slds-listbox__item')
      [this.selectionIndex].getAttribute('id');
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
    return this.template
      .querySelectorAll('.slds-listbox__item')
      [this.selectionIndex].getAttribute('id');
  }

  /**
   * Return the currently selected suggestion.
   * @returns {Object}
   */
  @api
  getCurrentSelectedValue() {
    if (this.allOptions?.[this.selectionIndex]) {
      return {
        value: this.allOptions[this.selectionIndex].rawValue,
        isClearRecentQueryButton:
          this.allOptions[this.selectionIndex].isClearRecentQueryButton,
        isRecentQuery: this.allOptions[this.selectionIndex].isRecentQuery,
      };
    }
    return null;
  }

  /** @type {number} */
  selectionIndex = -1;
  /** @type {boolean} */
  initialRender = true;
  /** @type {string} */
  previousQuery = '';

  renderedCallback() {
    if (this.initialRender) {
      this.suggestionsAriaLiveMessage = AriaLiveRegion(
        'suggestions',
        this,
        true
      );
      this.sendSuggestionListIdToInput();
      this.initialRender = false;
    }
    this.announceNewSuggestionsToScreenReader();
    if (this.previousQuery !== this.query) {
      this.previousQuery = this.query;
      this.selectionIndex = -1;
    }
  }

  announceNewSuggestionsToScreenReader() {
    if (this.allOptions?.length) {
      const suggestionsCount = this.shouldDisplayRecentQueries
        ? this.allOptions.length - 1
        : this.allOptions.length;

      this.suggestionsAriaLiveMessage.dispatchMessage(
        `${suggestionsCount} suggestions found, to navigate use up and down arrows.`
      );
    } else {
      this.suggestionsAriaLiveMessage.dispatchMessage(
        'There are no search suggestions.'
      );
    }
  }

  sendSuggestionListIdToInput() {
    const listboxId = this.template.querySelector('ul').getAttribute('id');
    const suggestionListEvent = new CustomEvent('suggestionlistrender', {
      detail: listboxId,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(suggestionListEvent);
  }

  /**
   * Returns all the options to be displayed inside the suggestion list.
   * @returns {Array<Object>}
   */
  get allOptions() {
    /** @type {Array} */
    const options = [
      ...this.recentQueriesThatStartWithCurrentQuery,
      ...this.querySuggestionsNotInRecentQueries,
    ]
      ?.map(this.buildOption)
      .slice(0, this.maxNumberOfSuggestions);

    if (this.shouldDisplayRecentQueries) {
      const clearRecentQueriesOption = {
        key: 0,
        id: 'selection-0',
        isSelected: this.selectionIndex === 0,
        isClearRecentQueryButton: true,
        onClick: (event) => {
          this.handleSelection(event, 0);
        },
      };
      options.unshift(clearRecentQueriesOption);
    }
    return options;
  }

  /**
   * Augments a suggestion with the necessary information needed to display the suggestion as an option in the suggestion list
   */
  buildOption = (suggestion, index) => {
    const optionIndex = this.shouldDisplayRecentQueries ? index + 1 : index;
    const optionIsSelected = this.selectionIndex === optionIndex;

    return {
      ...suggestion,
      id: `selection-${optionIndex}`,
      key: optionIndex,
      isSelected: optionIsSelected,
      containerCSSClass: `${optionCSSClass} ${
        optionIsSelected ? 'slds-has-focus' : ''
      }`,
      icon: suggestion.isRecentQuery ? 'utility:clock' : 'utility:search',
      iconTitle: suggestion.isRecentQuery
        ? 'recent query,'
        : 'suggested query,',
      onClick: (event) => {
        this.handleSelection(event, optionIndex);
      },
    };
  };

  /**
   * Returns the query suggestions that are not already in the recent queries list.
   */
  get querySuggestionsNotInRecentQueries() {
    return (
      this.suggestions?.filter(
        (suggestion) =>
          !this.recentQueriesThatStartWithCurrentQuery.some(
            (recentQuery) => recentQuery.rawValue === suggestion.rawValue
          )
      ) || []
    );
  }

  handleSelection = (event, index) => {
    event.preventDefault();
    const selection = {
      value: this.allOptions[index].rawValue,
      isClearRecentQueryButton: this.allOptions[index].isClearRecentQueryButton,
      isRecentQuery: this.allOptions[index].isRecentQuery,
    };
    const suggestionSelectedEvent = new CustomEvent('selection', {
      detail: {selection},
    });
    this.dispatchEvent(suggestionSelectedEvent);
  };

  /**
   * Returns the recent queries that start with the query currently typed by the end user.
   */
  get recentQueriesThatStartWithCurrentQuery() {
    return (
      this.recentQueries
        ?.filter(
          (recentQuery) =>
            recentQuery !== this.query &&
            recentQuery.toLowerCase().startsWith(this.query?.toLowerCase())
        )
        .map((recentQuery) => ({
          value: this.formatRecentQuery(recentQuery),
          rawValue: recentQuery,
          isRecentQuery: true,
        })) || []
    );
  }

  /**
   * Highlights a recent query based on the letters that match the current query.
   * @param {String} value
   * @returns {String}
   */
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

  get shouldDisplayRecentQueries() {
    return !!this.recentQueriesThatStartWithCurrentQuery?.length;
  }

  get clearRecentQueriesOptionCSSClass() {
    return `${optionCSSClass} ${
      this.selectionIndex === 0 ? 'slds-has-focus' : ''
    } recent-searches__label`;
  }

  get listboxCssClass() {
    return `slds-dropdown slds-dropdown_length-10 slds-dropdown_fluid quantic-suggestions-list ${
      this.allOptions?.length ? '' : 'slds-hidden'
    }`;
  }
}
