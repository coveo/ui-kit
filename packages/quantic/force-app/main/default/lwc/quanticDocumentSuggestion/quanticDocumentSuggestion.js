import {LightningElement, api, track} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import loading from '@salesforce/label/c.quantic_Loading';
import noSuggestions from '@salesforce/label/c.quantic_NoSuggestions';

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
    noSuggestions,
  };

  /**
   * The ID of the case assist engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The ID of the search engine instance the component registers to, this is used to instantiate the search interface to be able to show the quick view.
   * @api
   * @type {string}
   * @defaultValue `'search-engine'`
   */
  @api searchEngineId = 'search-engine';
  /**
   * Whether or not we want to disply the quick view for the document suggestions.
   * @api
   * @type {boolean}
   */
  @api showQuickview = false;
  /**
   * @api
   * @type {boolean}
   * Whether or not we want to fetch suggestions when initializing this component.
   */
  @api fetchOnInit = false;

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
  /** @type {number} */
  _maxDocuments = 5;
  /** @type {number} */
  _numberOfAutoOpenedDocuments = 1;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.template.addEventListener('rating', this.onRating);
    this.template.addEventListener('quickview_opened', this.onQvOpened);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
    this.injectIdToSlots();
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

    if (this.fetchOnInit) {
      engine.dispatch(this.actions.fetchDocumentSuggestions());
    }
  };

  disconnectedCallback() {
    this.unsubscribeDocumentSuggestion?.();
    this.template.removeEventListener('rating', this.onRating);
    this.template.removeEventListener('quickview_opened', this.onQvOpened);
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
        .slice(0, this._maxDocuments) ?? [];
    this.openFirstDocuments();
    this.loading = this.documentSuggestion.state.loading;
  }

  onRating = (evt) => {
    this.engine.dispatch(
      this.actions.logDocumentSuggestionRating(evt.detail.id, evt.detail.score)
    );
  };

  onQvOpened = (evt) => {
    this.engine.dispatch(
      this.actions.logDocumentSuggestionClick(evt.detail.id, true)
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
        .slice(0, this._numberOfAutoOpenedDocuments)
        .map((suggestion) => {
          return suggestion.title;
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

  /**
   * Set the number of automatically opened document suggestions when fetching suggestions.
   * @param {number} value - the value to be set.
   * @returns {void}
   */
  @api set numberOfAutoOpenedDocuments(value) {
    if (isNaN(Number(value)) || Number(value) < 0) {
      console.warn(
        'Please enter a valid number of automatically opened documents.'
      );
    }
    this._numberOfAutoOpenedDocuments = Math.max(0, Number(value) || 0);
  }
  get numberOfAutoOpenedDocuments() {
    return this._numberOfAutoOpenedDocuments;
  }

  /**
   * Set the maximum number of document suggesions to display.
   * @param {number} value - the value to be set.
   * @returns {void}
   */
  @api set maxDocuments(value) {
    if (isNaN(Number(value)) || Number(value) < 1) {
      console.warn(
        'Please enter a valid maximum number of document suggesions.'
      );
    }
    this._maxDocuments = Math.max(1, Number(value) || 1);
  }

  get maxDocuments() {
    return this._maxDocuments;
  }
}
