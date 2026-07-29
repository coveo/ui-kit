export type SortDirection = 'ascending' | 'descending';

export type SortByRelevance = {by: 'relevance'};
export type SortByDate = {by: 'date'; direction: SortDirection};
export type SortByField = {
  by: 'field';
  field: string;
  direction: SortDirection;
  displayName?: string;
};
export type SortByQRE = {by: 'qre'};
export type SortByNoSort = {by: 'nosort'};

export type SearchSortCriterion =
  | SortByRelevance
  | SortByDate
  | SortByField
  | SortByQRE
  | SortByNoSort;

export type CommerceSortCriterion = SortByRelevance | SortByField;

export type SortCriterionFor<_T> = SearchSortCriterion | CommerceSortCriterion;
