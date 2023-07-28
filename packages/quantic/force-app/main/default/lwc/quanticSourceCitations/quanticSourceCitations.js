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

  /** @type {boolean} */
  isInitialRender = true;

  citations = [
    {
      id: '4c904bae6da41bf62ecb8e204a572b7f020b7bc0b277a77fc30b1a0f54c4-5961c9b4-ae43-405f-a750-a4cc4e7437f0',
      title:
        'How To Resolve Netflix Connection With Tivo on XB Family Smart TVs',
      uri: 'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Connection With Tivo on XB Family Smart TVs',
      clickUri:
        'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/2359302/How+To+Resolve+Netflix+Connection+With+Tivo+on+XB+Family+Smart+TVs',
      permanentid:
        '4c904bae6da41bf62ecb8e204a572b7f020b7bc0b277a77fc30b1a0f54c4',
    },
    {
      id: '8c3c7080cf1c225f74b3e5a2f9d8603272bbc97d756b5a3992c6bda33ba4-2396ec3c-41db-43f2-9d04-734765e2166d',
      title: 'How-to articles',
      uri: 'https://coveodemo.atlassian.net/wiki/TV/How-to-articles',
      clickUri:
        'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/1933326/How-to+articles',
      permanentid:
        '8c3c7080cf1c225f74b3e5a2f9d8603272bbc97d756b5a3992c6bda33ba4',
    },
    {
      id: '681eb97870fc99957bbd47e4c96d35bd88be7a6938f0797ee75991e4ab2a-e704d723-0a4d-470f-be62-5381912ef783',
      title:
        'How To Resolve Netflix Android Connection Error on XB, XBR, and XBR6 Smart TV',
      uri: 'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Android Connection Error on XB, XBR, and XBR6 Smart TV',
      clickUri:
        'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/2359300/How+To+Resolve+Netflix+Android+Connection+Error+on+XB%2C+XBR%2C+and+XBR6+Smart+TV',
      permanentid:
        '681eb97870fc99957bbd47e4c96d35bd88be7a6938f0797ee75991e4ab2a',
    },
    {
      id: '302ede92620f05146aa97d10eb07a9eba7a7baec23434214bd7c8887617a-e024eeb5-4bdc-46d6-9d22-36cf9676871a',
      title: 'How To Resolve Netflix Playback Errors on Besttech XB Smart TVs',
      uri: 'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Playback Errors on Besttech XB Smart TVs',
      clickUri:
        'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/2359298/How+To+Resolve+Netflix+Playback+Errors+on+Besttech+XB+Smart+TVs',
      permanentid:
        '302ede92620f05146aa97d10eb07a9eba7a7baec23434214bd7c8887617a',
    },
    {
      id: '302ede92620f05146aa97d10eb07a9eba7a7baec23434214bd7c8887617a-952c4fec-d9a1-47ba-aa4c-1ea3d132c841',
      title: 'How To Resolve Netflix Playback Errors on Besttech XB Smart TVs',
      uri: 'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Playback Errors on Besttech XB Smart TVs',
      clickUri:
        'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/2359298/How+To+Resolve+Netflix+Playback+Errors+on+Besttech+XB+Smart+TVs',
      permanentid:
        '302ede92620f05146aa97d10eb07a9eba7a7baec23434214bd7c8887617a',
    },
  ];

  renderedCallback() {
    if (this.isInitialRender) {
      this.isInitialRender = false;
    }
  }

  /**
   * Returns the indexed citations.
   * @returns {Object}
   */
  get indexedCitations() {
    return this.citations.map((citation, index) => ({
      ...citation,
      index: index + 1,
    }));
  }

  /**
   * Whether or not to display citations.
   */
  get shouldDisplayCitations() {
    return !!this.citations?.length;
  }

  handleCitationClick(event) {
    const citationId = event.currentTarget.dataset.key;
    this.citationClickHandler(citationId);
  }
}
