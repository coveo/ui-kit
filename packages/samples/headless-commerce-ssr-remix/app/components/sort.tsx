import {useSort} from '@/lib/commerce-engine';
import {SortBy, SortCriterion} from '@coveo/headless-react/ssr-commerce';

export default function Sort() {
  const {state, methods} = useSort();

  if (state.availableSorts.length < 2) {
    return null;
  }

  state.availableSorts[0];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!methods) {
      return;
    }

    methods?.sortBy(JSON.parse(e.target.value));
  };

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
        return criterion.fields.map(formatSortFieldLabel).join(', ');
    }
  };

  return (
    <div>
      <label htmlFor="sort">
        <b>Sort by: </b>
      </label>
      <select
        id="sort"
        name="sort"
        disabled={!methods}
        value={JSON.stringify(state.appliedSort)}
        onChange={handleChange}
      >
        {state.availableSorts.map((sort) => {
          const label = getSortLabel(sort);
          return (
            <option
              key={label}
              value={JSON.stringify(sort)}
              onSelect={() => methods?.sortBy(sort)}
            >
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
}
