import learnMore from '@salesforce/label/c.quantic_LearnMore';
import { LightningElement, api } from 'lwc';


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

  // /**
  //  * The citations used in the generated answer.
  //  * @api
  //  * @type {GeneratedAnswerCitation[]}
  //  */
  // @api citations;
  /**
   * The function to be executed when a citation is clicked.
   * @api
   * @type {function}
   */
  @api citationClickHandler;

  citations = [
    {
      id: '1',
      title: 'Example title 1',
      uri: 'https://example.com/',
      clickUri: 'https://example.com/',
      permanentid: '1',
    },
    {
      id: '2',
      title: 'Example title 2',
      uri: 'https://example.com/',
      clickUri: 'https://example.com/',
      permanentid: '2',
    },
    {
      id: '3',
      title: 'Example title 2',
      uri: 'https://example.com/',
      clickUri: 'https://example.com/',
      permanentid: '3',
    },
    {
      id: '4',
      title: 'Example title 2',
      uri: 'https://example.com/',
      clickUri: 'https://example.com/',
      permanentid: '4',
    },
    {
      id: '5',
      title: 'Example title 2',
      uri: 'https://example.com/',
      clickUri: 'https://example.com/',
      permanentid: '5',
    },
    {
      id: '24',
      title: 'Example title 2',
      uri: 'https://example.com/',
      clickUri: 'https://example.com/',
      permanentid: '25',
    },
    {
      id: '23',
      title: 'Example title 2',
      uri: 'https://example.com/',
      clickUri: 'https://example.com/',
      permanentid: '23',
    },
    {
      id: '21',
      title: 'Example title 2',
      uri: 'https://example.com/',
      clickUri: 'https://example.com/',
      permanentid: '21',
    },
  ];
  /**
   * Returns the indexed citations.
   * @returns {Object}
   */
  get indexedCitations() {
    return this.citations.map((citation, index) => ({
      ...citation,
      index: index + 1,
      handleCitationClick: () => {
        this.citationClickHandler(citation.id);
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