import {should} from '../common-selectors';
import {
  DocumentSuggestionSelector,
  DocumentSuggestionSelectors,
} from './document-suggestion-selectors';

function documentSuggestionExpectations(selector: DocumentSuggestionSelector) {
  return {
    displayAccordion: (display: boolean) => {
      selector
        .accordion()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the accordion`);
    },
  };
}

export const DocumentSuggestionExpectations = {
  ...documentSuggestionExpectations(DocumentSuggestionSelectors),
};
