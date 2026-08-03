import type {SearchSortCriterion, CommerceSortCriterion} from './sort-types.js';

export interface CommerceApiSortField {
  field: string;
  direction?: 'asc' | 'desc';
  displayName?: string;
}

export interface CommerceApiSortPayload {
  sortCriteria: 'relevance' | 'fields';
  fields?: CommerceApiSortField[];
}

export function toSearchApiSort(criterion: SearchSortCriterion): string {
  switch (criterion.by) {
    case 'relevance':
      return 'relevancy';
    case 'date':
      return `date ${criterion.direction}`;
    case 'field':
      return `@${criterion.field} ${criterion.direction}`;
    case 'qre':
      return 'qre';
    case 'nosort':
      return 'nosort';
  }
}

export function toSearchApiCompoundSort(criteria: SearchSortCriterion[]): string {
  return criteria.map(toSearchApiSort).join(',');
}

export function toCommerceApiSort(criterion: CommerceSortCriterion): CommerceApiSortPayload {
  switch (criterion.by) {
    case 'relevance':
      return {sortCriteria: 'relevance'};
    case 'field':
      return {
        sortCriteria: 'fields',
        fields: [
          {
            field: criterion.field,
            direction: criterion.direction === 'ascending' ? 'asc' : 'desc',
            ...(criterion.displayName ? {displayName: criterion.displayName} : {}),
          },
        ],
      };
  }
}

export function fromCommerceApiSort(raw: CommerceApiSortPayload): CommerceSortCriterion {
  if (raw.sortCriteria === 'relevance') {
    return {by: 'relevance'};
  }

  if (Array.isArray(raw.fields) && raw.fields.length > 0) {
    const first = raw.fields[0];
    return {
      by: 'field',
      field: first.field,
      direction: first.direction === 'desc' ? 'descending' : 'ascending',
      displayName: first.displayName,
    };
  }

  return {by: 'relevance'};
}
