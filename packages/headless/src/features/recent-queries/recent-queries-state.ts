export interface RecentQueriesState {
  queries: string[];
  maxLength: number;
}

export function getRecentQueriesInitialState(): RecentQueriesState {
  return {
    queries: [],
    maxLength: 10,
  };
}
