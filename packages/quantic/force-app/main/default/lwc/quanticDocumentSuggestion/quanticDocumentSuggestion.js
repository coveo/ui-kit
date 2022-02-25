import {LightningElement, api, track} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import loading from '@salesforce/label/c.quantic_Loading';
import noSuggestions from '@salesforce/label/c.quantic_NoSuggestions';
import readMore from '@salesforce/label/c.quantic_ReadMore';

/** @typedef {import("coveo").CaseAssistEngine} CaseAssistEngine */
/** @typedef {import("coveo").DocumentSuggestion} DocumentSuggestion */

/**
 * The `QuanticDocumentSuggestion` component displays an accordion containing the document suggestions returned by Coveo Case Assist based on the values that the user has previously entred in the different fields.
 *
 * @category Case Assist
 * @example
 * <c-quantic-document-suggestion engine-id={engineId} max-documents="5"></c-quantic-document-suggestion>
 */
export default class QuanticDocumentSuggestion extends LightningElement {
  labels = {
    loading,
    noSuggestions,
    readMore,
  };

  /**
   * The ID of the case assist engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * Whether or not we want to display the quick view for the document suggestions.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api showQuickview = false;
  /**
   * Whether or not we want to fetch suggestions when initializing this component.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api fetchOnInit = false;
  /**
   * The maximum number of document suggestions to display.
   * @api
   * @type {number}
   * @defaultValue `3`
   */
  @api maxDocuments = 3;
  /**
   * The number of automatically opened document suggestions when fetching suggestions..
   * @api
   * @type {number}
   * @defaultValue `1`
   */
  @api numberOfAutoOpenedDocuments = 1;

  /** @type {Array<object>} */
  @track suggestions = [];
  /** @type {boolean} */
  loading = false;
  /** @type {CaseAssistEngine} */
  engine;
  /** @type {DocumentSuggestion} */
  documentSuggestion;
  /** @type {Function} */
  unsubscribeDocumentSuggestion;
  /** @type {Array<string>} */
  openedDocuments = [];
  /** @type {string} */
  renderingError = '';

  connectedCallback() {
    this.validateProps();
    if (!this.renderingError) {
      registerComponentForInit(this, this.engineId);
      this.template.addEventListener('rating', this.onRating);
    }
  }

  renderedCallback() {
    if (!this.renderingError) {
      initializeWithHeadless(this, this.engineId, this.initialize);
      this.injectIdToSlots();
    }
  }

  /**
   * @param {CaseAssistEngine} engine
   */
  initialize = (engine) => {
    this.engine = engine;
    this.documentSuggestion =
      CoveoHeadlessCaseAssist.buildDocumentSuggestionList(engine);
    this.unsubscribeDocumentSuggestion = this.documentSuggestion.subscribe(() =>
      this.updateDocumentSuggestionState()
    );

    this.actions = {
      ...CoveoHeadlessCaseAssist.loadCaseAssistAnalyticsActions(engine),
      ...CoveoHeadlessCaseAssist.loadDocumentSuggestionActions(engine),
    };

    if (this.fetchOnInit) {
      engine.dispatch(this.actions.fetchDocumentSuggestions());
    }
  };

  disconnectedCallback() {
    this.unsubscribeDocumentSuggestion?.();
    this.template.removeEventListener('rating', this.onRating);
  }

  validateProps() {
    if (!(Number(this.maxDocuments) > 0)) {
      this.renderingError = `"${this.maxDocuments}" is an invalid maximum number of document suggestions. A integer greater than 0 was expected.`;
    }
    if (!(Number(this.numberOfAutoOpenedDocuments) >= 0)) {
      this.renderingError = `"${this.numberOfAutoOpenedDocuments}" is an invalid maximum number of automatically opened document suggestions. A positive integer was expected.`;
    }
  }

  updateDocumentSuggestionState() {
    this.suggestions =
      this.documentSuggestion.state.documents
        .map((suggestion) => {
          return {
            ...suggestion,
            raw: suggestion.fields,
            uri: suggestion.fields.uri,
          };
        })
        .slice(0, this.maxDocuments) ?? [];
    this.openFirstDocuments();
    this.loading = this.documentSuggestion.state.loading;
  }

  onRating = (evt) => {
    this.engine.dispatch(
      this.actions.logDocumentSuggestionRating(evt.detail.id, evt.detail.score)
    );
  };

  handleSectionClick(evt) {
    const accordion = this.template.querySelector('lightning-accordion');
    if (
      JSON.stringify(this.openedDocuments) !==
      // @ts-ignore
      JSON.stringify(accordion.activeSectionName)
    ) {
      if (!this.openedDocuments.includes(evt.target.name)) {
        this.engine.dispatch(
          this.actions.logDocumentSuggestionClick(evt.target.dataset.id)
        );
      }
      // @ts-ignore
      this.openedDocuments = accordion.activeSectionName;
    }
  }

  openFirstDocuments() {
    if (this.suggestions.length) {
      this.openedDocuments = this.suggestions
        .slice(0, this.numberOfAutoOpenedDocuments)
        .map((suggestion) => {
          return suggestion.uniqueId;
        });
    }
  }

  stopPropagation(evt) {
    evt.stopPropagation();
  }

  injectIdToSlots() {
    const slots = this.template.querySelectorAll('slot');
    slots.forEach((slot) => {
      let slotContent = slot;
      while (slotContent?.tagName === 'SLOT') {
        // @ts-ignore
        slotContent = slotContent.assignedNodes()[0];
      }
      if (slotContent) {
        slotContent.dataset.id = slot.dataset.docId;
      }
    });
  }

  get hasSuggestions() {
    return !!this.suggestions.length;
  }
}
