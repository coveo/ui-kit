export interface DocumentSuggestion {
  clickUri: string;
  excerpt: string;
  fields: {
    permanentid: string;
    source: string;
    uri: string;
    urihash: string;
  } & Record<string, string | number | boolean | string[]>;
  hasHtmlVersion: boolean;
  title: string;
  uniqueId: string;
}

export interface DocumentsSuggestResponse {
  documents: DocumentSuggestion[];
  totalCount: number;
  responseId: string;
}

const getNthDocument = (n: number): DocumentSuggestion => ({
  clickUri: `https://example.com/case-assist/${n}`,
  excerpt: `This is the excerpt of sample document suggestion ${n}.`,
  fields: {
    permanentid: `case-assist-permanent-id-${n}`,
    source: 'Sample Source',
    uri: `https://example.com/case-assist/${n}`,
    urihash: `caseAssistUriHash${n}`,
  },
  hasHtmlVersion: true,
  title: `Sample Document Suggestion ${n}`,
  uniqueId: `case-assist-document-${n}`,
});

const documents = Array.from({length: 6}, (_, index) => getNthDocument(index + 1));

export const baseResponse: DocumentsSuggestResponse = {
  documents,
  totalCount: documents.length,
  responseId: 'case-assist-documents-suggest-response-id',
};
