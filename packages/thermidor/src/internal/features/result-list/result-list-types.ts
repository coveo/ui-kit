export interface ResultListState {
  /** Array of search results */
  results: SearchResult[];
}

export interface SearchResult {
  uniqueId: string;
  title: string;
  uri: string;
  excerpt?: string;
  printableUri: string;
  clickUri: string;
  raw: Record<string, unknown>;
  score: number;
}
