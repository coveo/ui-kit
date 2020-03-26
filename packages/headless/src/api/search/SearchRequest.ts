export interface SearchRequest {
  q: string;
  organizationId: string;
  firstResult?: number;
  numberOfResults?: number;
  fieldsToInclude?: string[];
}
