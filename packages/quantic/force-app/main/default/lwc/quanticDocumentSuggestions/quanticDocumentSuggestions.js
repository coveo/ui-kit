import {LightningElement, api, track} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';

/** @typedef {import("coveo").CaseAssistEngine} CaseAssistEngine */
/** @typedef {import("coveo").DocumentSuggestion} DocumentSuggestion */

/**
 * The `QuanticDocumentSuggestions` component is a .
 *
 * @category Case Assist
 * @example
 * <c-quantic-document-suggestions></c-quantic-document-suggestions>
 */
export default class QuanticDocumentSuggestions extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

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
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {CaseAssistEngine} engine
   */
  initialize = (engine) => {
    this.engine = engine;
    this.documentSuggestion = CoveoHeadlessCaseAssist.buildDocumentSuggestion(engine);
    this.unsubscribeDocumentSuggestion = this.documentSuggestion.subscribe(() => this.updateDocumentSuggestionState());

    this.actions = {
      ...CoveoHeadlessCaseAssist.loadCaseAssistAnalyticsActions(engine),
      ...CoveoHeadlessCaseAssist.loadDocumentSuggestionActions(engine),
    };

    engine.dispatch(this.actions.fetchDocumentSuggestions)
  };

  disconnectedCallback() {
    this.unsubscribeDocumentSuggestion?.();
  }

  updateDocumentSuggestionState() {
    this.suggestions = this.documentSuggestion.state.documents ?? [];
    this.loading = this.documentSuggestion.state.loading;
  }
}
