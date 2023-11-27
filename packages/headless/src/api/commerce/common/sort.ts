import {SortBy, SortDirection} from '../../../features/sort/sort';

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
