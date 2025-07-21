import type {SortBy, SortDirection} from '../../../features/sort/sort.js';

export type SortOption = {sortCriteria: SortBy} & {
  fields?: {
    field: string;
    direction?: SortDirection;
    displayName?: string;
  }[];
};

export type Sort = {
  appliedSort: SortOption;
  availableSorts: SortOption[];
};
