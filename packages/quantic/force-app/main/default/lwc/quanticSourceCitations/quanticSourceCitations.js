import citations from '@salesforce/label/c.quantic_Citations';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").GeneratedAnswerCitation} GeneratedAnswerCitation */

/**
 * The `QuanticSourceCitations` component renders the citations used to generate the answer in the quantic generated answer component.
 * @category Internal
 * @example
 * <c-quantic-source-citations engine-id={engineId} citations={citations} citation-hover-handler={citationHoverHandler}></c-quantic-source-citations>
 */
export default class QuanticSourceCitations extends LightningElement {
  labels = {
    citations,
  };

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The citations used in the generated answer.
   * @api
   * @type {GeneratedAnswerCitation[]}
   */
  @api citations;
  /**
   * The function to be executed when a citation is hovered.
   * @api
   * @type {function}
   */
  @api citationHoverHandler;
  /**
   * Whether to disable citation anchoring.
   * @api
   * @type {boolean}
   * @default false
   */
  @api disableCitationAnchoring = false;

  /** @type {AnyHeadless} */
  headless;
  engine;
  isInitialized = false;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);

    // Push citation data to slotted custom components
    if (this.isInitialized) {
      this._pushDataToCustomSlots();
    }
  }

  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.engine = engine;
    this.isInitialized = true;
  };

  /**
   * Pushes citation data to custom slotted components
   * @private
   */
  _pushDataToCustomSlots() {
    const slots = this.template.querySelectorAll('slot[name="citation-component"]');
    if (!slots || slots.length === 0) return;

    slots.forEach((slotEl, index) => {
      // @ts-ignore
      const assigned = slotEl.assignedElements({flatten: true});
      
      // If nothing assigned, fallback is showing - don't push to it
      if (assigned.length === 0) {
        return; // Using fallback content
      }

      // Get the corresponding citation for this slot
      const citationData = this.indexedCitations[index];
      if (!citationData) return;

      // Push data to each assigned element
      assigned.forEach((el) => {
        // Set the public API properties directly
        if ('citation' in el) {
          el.citation = citationData.data;
        }
        if ('interactiveCitation' in el) {
          el.interactiveCitation = citationData.interactiveCitation;
        }
        if ('engineId' in el) {
          el.engineId = this.engineId;
        }
      });
    });
  }

  /**
   * Returns the indexed citations.
   * @returns {Object}
   */
  get indexedCitations() {
    return this.citations.map((citation, index) => ({
      data: {
        ...citation,
        index: index + 1,
      },
      interactiveCitation: this.headless?.buildInteractiveCitation(
        this.engine,
        {
          options: {
            citation,
          },
        }
      ),
      handleCitationHover: (event) => {
        this.citationHoverHandler?.(
          citation.id,
          event.detail.citationHoverTimeMs
        );
      },
    }));
  }

  /**
   * Indicates whether or not to display citations.
   */
  get shouldDisplayCitations() {
    return this.isInitialized && !!this.citations?.length;
  }
}