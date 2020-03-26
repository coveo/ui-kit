export interface SearchResult {
  title: string;
  uri: string;
  printableUri: string;
  clickUri: string;
  uniqueId: string;
  excerpt: string;
  flags: string;
  summary: string;
  queryUid?: string;
  pipeline?: string;
}
