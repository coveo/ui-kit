/**
 * Defines document suggestion result.
 */
export interface Result {
  clickUri: string;
  excerpt: string;
  fields: Record<string, unknown>;
  hasHtmlVersion: boolean;
  title: string;
  uniqueId: string;
}

/**
 * Defines the content of a successful response from the `/documents/suggest` API call.
 *
 * See https://platform.cloud.coveo.com/docs?urls.primaryName=Customer%20Service#/Suggestions/getSuggestDocument
 */
export interface SuggestDocumentsSuccessContent {
  documents: Result[];
  totalCount: number;
  responseId: string;
}
