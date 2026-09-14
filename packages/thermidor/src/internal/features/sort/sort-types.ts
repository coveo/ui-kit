import type {CommerceInterface, SearchInterface} from '@/src/internal/utils/index.js';

type SortDirection = 'ascending' | 'descending';

type SortByRelevance = {by: 'relevance'};
type SortByDate = {by: 'date'; direction: SortDirection};
export type SortByField = {
  by: 'field';
  field: string;
  direction: SortDirection;
  displayName?: string;
};
type SortByQRE = {by: 'qre'};
type SortByNoSort = {by: 'nosort'};

export type SearchSortCriterion =
  | SortByRelevance
  | SortByDate
  | SortByField
  | SortByQRE
  | SortByNoSort;

export type CommerceSortCriterion = SortByRelevance | SortByField;

export type SortCriterionFor<T> = T extends CommerceInterface
  ? CommerceSortCriterion
  : T extends SearchInterface
    ? SearchSortCriterion
    : SearchSortCriterion | CommerceSortCriterion;
