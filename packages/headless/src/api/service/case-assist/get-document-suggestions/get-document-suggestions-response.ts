/**
 * Defines document suggestion result.
 */
export interface DocumentSuggestionResponse {
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

/**
 * Defines the content of a successful response from the `/documents/suggest` API call.
 *
 * See https://platform.cloud.coveo.com/docs?urls.primaryName=Customer%20Service#/Suggestions/getSuggestDocument
 */
export interface GetDocumentSuggestionsResponse {
  documents: DocumentSuggestionResponse[];
  totalCount: number;
  responseId: string;
}
