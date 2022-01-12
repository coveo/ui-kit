import {LightningElement, api, track} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import loading from '@salesforce/label/c.quantic_Loading';

/** @typedef {import("coveo").CaseAssistEngine} CaseAssistEngine */
/** @typedef {import("coveo").DocumentSuggestion} DocumentSuggestion */

/**
 * The `QuanticDocumentSuggestion` component displays an accordion containing the document suggestions returned by Coveo Case Assist based on the values that the user has previously entred in the different fields.
 *
 * @category Case Assist
 * @example
 * <c-quantic-document-suggestion engine-id={engineId} search-engine-id={searchEngineId} max-documents="5"></c-quantic-document-suggestion>
 */
export default class QuanticDocumentSuggestion extends LightningElement {
  labels = {
    loading,
  };

  /**
   * The ID of the case assist engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The ID of the search engine instance the component registers to.
   * @api
   * @type {string}
   * @defaultValue `'search-engine'`
   */
  @api searchEngineId = 'search-engine';
  /**
   * The maximum number of document suggesions to display, it's a value between 1 and 5.
   * @api
   * @type {number}
   */
  @api maxDocuments = 5;
  /**
   * Whether we want to disply the quick view or not.
   * @api
   * @type {boolean}
   */
  @api showQuickView = false;

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
  /** @type {string} */
  firstSuggestion;
  /** @type {Array<string>} */
  openedDocuments = [];

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.template.addEventListener('rating', this.onRating);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
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

  /**
   * @param {CaseAssistEngine} engine
   */
  initialize = (engine) => {
    this.engine = engine;
    this.documentSuggestion =
      CoveoHeadlessCaseAssist.buildDocumentSuggestion(engine);
    this.unsubscribeDocumentSuggestion = this.documentSuggestion.subscribe(() =>
      this.updateDocumentSuggestionState()
    );

    this.actions = {
      ...CoveoHeadlessCaseAssist.loadCaseAssistAnalyticsActions(engine),
      ...CoveoHeadlessCaseAssist.loadDocumentSuggestionActions(engine),
    };

    engine.dispatch(this.actions.fetchDocumentSuggestions());
  };

  disconnectedCallback() {
    this.unsubscribeDocumentSuggestion?.();
    this.template.removeEventListener('rating', this.onRating);
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
        .slice(0, Math.max(1, this.maxDocuments)) ?? [];
    if (this.suggestions.length) {
      this.firstSuggestion = this.suggestions?.[0].title;
      this.openedDocuments = [this.suggestions?.[0].title];
    }
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

  stopPropagation(evt) {
    evt.stopPropagation();
  }

  get hasSuggestions() {
    return !!this.suggestions.length;
  }
}
