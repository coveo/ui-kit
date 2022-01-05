import {LightningElement, api, track} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';

/** @typedef {import("coveo").CaseAssistEngine} CaseAssistEngine */
/** @typedef {import("coveo").DocumentSuggestion} DocumentSuggestion */

/**
 * The `QuanticDocumentSuggestion` component displays an accordion containing the document suggestions returned by Coveo Case Assist based on the values that the user has previously entred in the different fields.
 *
 * @category Case Assist
 * @example
 * <c-quantic-document-suggestion></c-quantic-document-suggestion>
 */
export default class QuanticDocumentSuggestion extends LightningElement {
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
   */
  @api searchEngineId;

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
      this.documentSuggestion.state.documents.map((suggestion) => {
        return {
          ...suggestion,
          raw: suggestion.fields,
          uri: suggestion.fields.uri,
        };
      }) ?? [];
    this.loading = this.documentSuggestion.state.loading;
  }

  onRating = (evt) => {
    this.engine.dispatch(
      this.actions.logDocumentSuggestionRating(evt.detail.id, evt.detail.score)
    );
  };
}
