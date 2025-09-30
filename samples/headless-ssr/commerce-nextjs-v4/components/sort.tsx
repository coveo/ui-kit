'use client';

import {
  SortBy,
  type SortCriterion,
} from '@coveo/headless-react/ssr-commerce-next';
// import {SortBy, SortCriterion} from '@coveo/headless-react/ssr-commerce-next';
import {useSort} from '@/lib/commerce-engine';

export default function Sort() {
  const {state, methods} = useSort();

  if (state.availableSorts.length === 0) {
    return null;
  }

  const formatSortFieldLabel = (field: {
    name: string;
    direction?: string;
    displayName?: string;
  }) => field?.displayName ?? `${field.name} ${field.direction ?? ''}`.trim();

  const getSortLabel = (criterion: SortCriterion) => {
    switch (criterion.by) {
      case SortBy.Relevance:
        return 'Relevance';
      case SortBy.Fields:
        return criterion.fields.map(formatSortFieldLabel);
    }
  };

  const getSortId = (sort: SortCriterion) => {
    switch (sort.by) {
      case SortBy.Relevance:
        return 'relevance';
      case SortBy.Fields:
        return sort.fields
          .map((field) => `${field.name}-${field.direction ?? ''}`)
          .join(',');
      default:
        return '';
    }
  };

  return (
    <div className="Sort">
      <label htmlFor="sport-select">Sort by: </label>
      <select
        name="sorts"
        id="sorts-select"
        value={JSON.stringify(state.appliedSort)}
        onChange={(e) => methods?.sortBy(JSON.parse(e.target.value))}
        disabled={!methods}
      >
        {state.availableSorts.map((sort) => (
          <option
            key={getSortId(sort)}
            value={JSON.stringify(sort)}
            onSelect={() => methods?.sortBy(sort)}
          >
            {getSortLabel(sort)}
          </option>
        ))}
      </select>
    </div>
  );
}
