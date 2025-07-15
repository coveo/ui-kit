import type {DocumentSuggestionResponse} from '../api/service/case-assist/get-document-suggestions/get-document-suggestions-response.js';

export const buildMockDocumentSuggestion = (
  partialDocSuggestion?: Partial<DocumentSuggestionResponse>
): DocumentSuggestionResponse => ({
  clickUri: 'www.clickuri.com',
  title: 'Mock Document',
  excerpt: 'This is a dang good mock document.',
  fields: {
    permanentid: 'example permanent Id',
    type: 'mock',
    source: 'example source',
    uri: 'example uri',
    urihash: 'example urihash',
  },
  hasHtmlVersion: true,
  uniqueId: '123ID',
  ...partialDocSuggestion,
});
