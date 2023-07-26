import learnMore from '@salesforce/label/c.quantic_LearnMore';
import { LightningElement } from 'lwc';

export default class QuanticSourceCitations extends LightningElement {
  labels = {
    learnMore,
  };

  // /**
  //  * The citations.
  //  * @api
  //  * @type {GeneratedAnswerCitation[]}
  //  */
  // @api citations;
  // /**
  //  * The function to be executed when a citation is clicked.
  //  * @api
  //  * @type {function}
  //  */
  // @api onCitationClick;

  /** @type {boolean} */
  isInitialRender = true;

  citations = [
  {
    id: '1',
    title: 'foo',
    uri: 'www.foo.com',
  },
  {
    id: '2',
    title: 'bar',
    uri: 'www.bar.com',
  },
];

  renderedCallback() {
    if (this.isInitialRender) {
      this.isInitialRender = false;
      // this.bindAnalyticsToSourceCitations();????
    }
  }

  disconnectedCallback() {
    // this.removebindings?
  }

  /**
   * Returns the indexed citations
   * @returns {Object} ==> not sure!
   */
  get indexedCitations() {
    return this.citations.map((citation, index) => ({
      ...citation,
      index: index + 1,
    }));
  }

  // todo
  handleCitationClick() {
    console.log('citations clicked!');
    //onCitationClick
  }
}