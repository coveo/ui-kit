'use client';

// import {SortBy, SortCriterion} from '@coveo/headless-react/ssr-commerce';
import {useSort} from '@/lib/commerce-engine';
import {SortBy, SortCriterion} from '@coveo/headless-react/ssr-commerce';

export default function Sort() {
  const {state, methods} = useSort();

  if (state.availableSorts.length === 0) {
    return null;
  }

  const getSortLabel = (criterion: SortCriterion) => {
    switch (criterion.by) {
      case SortBy.Relevance:
        return 'Relevance';
      case SortBy.Fields:
        return criterion.fields.map((field) =>
          field
            ? (field.displayName ??
              [field.name, field.direction].filter(Boolean).join(' '))
            : ''
        );
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
        {state.availableSorts.map((sort, index) => (
          <option
            key={index}
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
