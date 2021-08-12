export interface RecentQueriesState {
  queries: string[];
  maxQueries: number;
}

export function getRecentQueriesInitialState(): RecentQueriesState {
  return {
    queries: [],
    maxQueries: 10,
  };
}
