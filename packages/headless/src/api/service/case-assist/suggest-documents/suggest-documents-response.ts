/**
 * Defines document suggestion result.
 */
export interface DocumentSuggestion {
  clickUri: string;
  excerpt: string;
  fields: Record<string, string | number | boolean | string[]>;
  hasHtmlVersion: boolean;
  title: string;
  uniqueId: string;
}

/**
 * Defines the content of a successful response from the `/documents/suggest` API call.
 *
 * See https://platform.cloud.coveo.com/docs?urls.primaryName=Customer%20Service#/Suggestions/getSuggestDocument
 */
export interface SuggestDocumentsResponse {
  documents: DocumentSuggestion[];
  totalCount: number;
  responseId: string;
}
