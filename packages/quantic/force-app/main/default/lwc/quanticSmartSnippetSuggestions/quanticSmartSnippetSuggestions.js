import peopleAlsoAsk from '@salesforce/label/c.quantic_PeopleAlsoAsk';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {getBueno} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").SmartSnippetQuestionsList} SmartSnippetSuggestions */
/** @typedef {import("coveo").SmartSnippetQuestionsListState} SmartSnippetSuggestionsState */

/**
 * @typedef {Object} LinkActions
 * @property {function} select
 * @property {function} beginDelayedSelect
 * @property {function} cancelPendingSelect
 */

/**
 * The `QuanticSmartSnippetSuggestions` component displays additional queries for which a Coveo Smart Snippets model can provide relevant excerpts.
 * @category Search
 * @example
 *  <c-quantic-smart-snippet-suggestions engine-id={engineId}></c-quantic-smart-snippet-suggestions>
 */
export default class QuanticSmartSnippetSuggestions extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The number of suggestions to display in the component. Must be a value between 1 and 4.
   * @api
   * @type {number}
   */
  @api maximumNumberOfSuggestions = 4;

  labels = {
    peopleAlsoAsk,
  };

  /** @type {SmartSnippetSuggestions} */
  smartSnippetSuggestions;
  /** @type {SmartSnippetSuggestionsState} */
  state;
  /** @type {Array<string>} */
  previousOpenedSuggestions = [];
  /** @type {string} */
  error;
  /** @type {boolean} */
  validated = false;

  connectedCallback() {
    getBueno(this).then(() => {
      if (!Bueno.isNumber(this.maximumNumberOfSuggestions)) {
        console.error(
          `The "${this.maximumNumberOfSuggestions}" value of the maximumNumberOfSuggestions property is not a valid number.`
        );
        this.setError();
      } else if (
        this.maximumNumberOfSuggestions > 4 ||
        this.maximumNumberOfSuggestions < 1
      ) {
        console.error(
          'The value of the maximumNumberOfSuggestions property must be a value between 1 and 4.'
        );
        this.setError();
      }
      this.validated = true;
    });
    registerComponentForInit(this, this.engineId);
  }

  setError() {
    this.error = `${this.template.host.localName} Error`;
  }

  /**
   * Whether the field value can be displayed.
   * @returns {boolean}
   */
  get isValid() {
    return this.validated && !this.error;
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.engine = engine;
    this.headless = getHeadlessBundle(this.engineId);
    this.smartSnippetSuggestions =
      this.headless.buildSmartSnippetQuestionsList(engine);
    this.unsubscribe = this.smartSnippetSuggestions.subscribe(() =>
      this.updateState()
    );
  };

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  /**
   * Updates state.
   */
  updateState() {
    this.state = this.smartSnippetSuggestions.state;
  }

  /**
   * Generates the source link actions.
   * @param {string} questionAnswerId
   * @returns {LinkActions}
   */
  generateSourceActions(questionAnswerId) {
    const {selectSource, beginDelayedSelectSource, cancelPendingSelectSource} =
      this.smartSnippetSuggestions;
    return {
      select: () => {
        selectSource(questionAnswerId);
      },
      beginDelayedSelect: () => {
        beginDelayedSelectSource(questionAnswerId);
      },
      cancelPendingSelect: () => {
        cancelPendingSelectSource(questionAnswerId);
      },
    };
  }

  /**
   * Generates the inline link actions.
   * @param {string} questionAnswerId
   * @returns {LinkActions}
   */
  generateInlineLinkActions(questionAnswerId) {
    const {
      selectInlineLink,
      beginDelayedSelectInlineLink,
      cancelPendingSelectInlineLink,
    } = this.smartSnippetSuggestions;
    return {
      select: (link) => {
        selectInlineLink(questionAnswerId, link);
      },
      beginDelayedSelect: (link) => {
        beginDelayedSelectInlineLink(questionAnswerId, link);
      },
      cancelPendingSelect: (link) => {
        cancelPendingSelectInlineLink(questionAnswerId, link);
      },
    };
  }

  /**
   * Handles the smart snippet suggestion click.
   */
  handleSuggestionClick(event) {
    const suggestionTitle = event.target.name;
    /** @type {Array<string>} */
    const currentOpenedSuggestions =
      // @ts-ignore
      this.accordionElement.activeSectionName;
    const questionAnswerId = event.target.dataset.id;
    const previousStateIncludesSuggestion =
      this.previousOpenedSuggestions.includes(suggestionTitle);
    const currentStateIncludesSuggestion =
      currentOpenedSuggestions.includes(suggestionTitle);

    if (!previousStateIncludesSuggestion && currentStateIncludesSuggestion) {
      this.smartSnippetSuggestions.expand(questionAnswerId);
    } else if (
      previousStateIncludesSuggestion &&
      !currentStateIncludesSuggestion
    ) {
      this.smartSnippetSuggestions.collapse(questionAnswerId);
    }

    this.previousOpenedSuggestions = currentOpenedSuggestions;
  }

  /**
   * Indicates whether smart snippet suggestions should be displayed.
   * @returns {boolean}
   */
  get displaySmartSnippetSuggestions() {
    return this.isValid && !!this.state?.questions?.length;
  }

  /**
   * Returns the list of smart snippet suggestions.
   */
  get suggestions() {
    const questions = this.state?.questions?.slice(
      0,
      Math.min(4, this.maximumNumberOfSuggestions)
    );
    return questions?.map((suggestion) => {
      const questionAnswerId = suggestion.questionAnswerId;
      return {
        ...suggestion,
        sourceActions: this.generateSourceActions(questionAnswerId),
        inlineLinksActions: this.generateInlineLinkActions(questionAnswerId),
      };
    });
  }

  /**
   * Returns the Lightning Accordion element.
   */
  get accordionElement() {
    return this.template.querySelector('lightning-accordion');
  }
}
