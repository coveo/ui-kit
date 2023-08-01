import learnMore from '@salesforce/label/c.quantic_LearnMore';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").GeneratedAnswerCitation} GeneratedAnswerCitation */

/**
 * The `QuanticSourceCitations` component renders the citations used to generate the answer in the quantic generated answer component.
 * @category Internal
 * @example
 * <c-quantic-source-citations citations={citations} citation-click-handler={citationClickHandler}></c-quantic-source-citations>
 */
export default class QuanticSourceCitations extends LightningElement {
  labels = {
    learnMore,
  };

  /**
   * The citations used in the generated answer.
   * @api
   * @type {GeneratedAnswerCitation[]}
   */
  @api citations;
  /**
   * The function to be executed when a citation is clicked.
   * @api
   * @type {function}
   */
  @api citationClickHandler;

  /**
   * Returns the indexed citations.
   * @returns {Object}
   */
  get indexedCitations() {
    return this.citations.map((citation, index) => ({
      ...citation,
      index: index + 1,
      handleCitationClick: () => {
        this.citationClickHandler?.(citation.id);
      },
    }));
  }

  /**
   * Indicates whether or not to display citations.
   */
  get shouldDisplayCitations() {
    return !!this.citations?.length;
  }
}
