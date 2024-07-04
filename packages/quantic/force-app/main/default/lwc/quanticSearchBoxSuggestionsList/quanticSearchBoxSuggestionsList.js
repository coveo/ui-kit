import clear from '@salesforce/label/c.quantic_Clear';
import querySuggestionAriaLabel from '@salesforce/label/c.quantic_QuerySuggestionAriaLabel';
import recentQueries from '@salesforce/label/c.quantic_RecentQueries';
import recentQueryAriaLabel from '@salesforce/label/c.quantic_RecentQueryAriaLabel';
import suggestionFound from '@salesforce/label/c.quantic_SuggestionFound';
import suggestionFound_plural from '@salesforce/label/c.quantic_SuggestionFound_Plural';
import suggestionsNotFound from '@salesforce/label/c.quantic_SuggestionNotFound';
import {AriaLiveRegion, I18nUtils, RecentQueryUtils} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

const optionCSSClass =
  'slds-media slds-listbox__option slds-listbox__option_plain slds-media_small slds-grid option';

/**
 * @typedef Suggestion
 * @property {number} key
 * @property {string} value
 * @property {string} rawValue
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
  @api recentQueries = [];
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
    suggestionFound,
    suggestionFound_plural,
    suggestionsNotFound,
    recentQueryAriaLabel,
    querySuggestionAriaLabel,
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
    return this.allOptionsHTMLElements[this.selectionIndex].getAttribute('id');
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
    return this.allOptionsHTMLElements[this.selectionIndex].getAttribute('id');
  }

  /**
   * Return the currently selected suggestion.
   * @returns {Object}
   */
  @api
  getCurrentSelectedValue() {
    if (this.allOptions?.[this.selectionIndex]) {
      const {rawValue, isClearRecentQueryButton, isRecentQuery} =
        this.allOptions[this.selectionIndex];
      return {
        value: rawValue,
        isClearRecentQueryButton,
        isRecentQuery,
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
    this.announceNewSuggestionsWithAriaLive();
    if (this.previousQuery !== this.query) {
      this.previousQuery = this.query;
      this.selectionIndex = -1;
    }
  }

  announceNewSuggestionsWithAriaLive() {
    if (this.allOptions?.length) {
      const suggestionsCount = this.shouldDisplayRecentQueries
        ? this.allOptions.length - 1
        : this.allOptions.length;

      const labelName = I18nUtils.getLabelNameWithCount(
        'suggestionFound',
        suggestionsCount
      );

      this.suggestionsAriaLiveMessage.dispatchMessage(
        I18nUtils.format(this.labels[labelName], suggestionsCount)
      );
    } else {
      this.suggestionsAriaLiveMessage.dispatchMessage(
        this.labels.suggestionsNotFound
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
   * Returns all the options to be displayed inside the suggestion list, recent queries and query suggestions.
   * @returns {Array<Object>}
   */
  get allOptions() {
    const options = [
      ...this.recentQueriesThatStartWithCurrentQuery,
      ...this.querySuggestionsNotInRecentQueries,
    ]
      ?.map(this.buildSuggestionListOption)
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

  get allOptionsHTMLElements() {
    return this.template.querySelectorAll('.slds-listbox__item');
  }

  /**
   * Augments a suggestion with the necessary information needed to display the suggestion as an option in the suggestion list
   */
  buildSuggestionListOption = (suggestion, index) => {
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
        ? this.labels.recentQueryAriaLabel
        : this.labels.querySuggestionAriaLabel,
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
    const {rawValue, isClearRecentQueryButton, isRecentQuery} =
      this.allOptions[index];
    const selection = {
      value: rawValue,
      isClearRecentQueryButton: isClearRecentQueryButton,
      isRecentQuery: isRecentQuery,
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
          value: RecentQueryUtils.formatRecentQuery(recentQuery, this.query),
          rawValue: recentQuery,
          isRecentQuery: true,
        })) || []
    );
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
