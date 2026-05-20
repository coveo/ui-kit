export interface ResultListState {
  /** Array of search results */
  results: SearchResult[];
}

export interface SearchResult {
  id: string;
  title: string;
  uri: string;
  excerpt: string;
}
