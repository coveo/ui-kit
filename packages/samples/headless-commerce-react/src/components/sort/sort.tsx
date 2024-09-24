import {
  Sort as HeadlessSort,
  SortBy,
  SortCriterion,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface ISortProps {
  controller: HeadlessSort;
}

export default function Sort(props: ISortProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  if (state.availableSorts.length === 0) {
    return null;
  }

  const getSortLabel = (criterion: SortCriterion) => {
    switch (criterion.by) {
      case SortBy.Relevance:
        return 'Relevance';
      case SortBy.Fields:
        return criterion.fields.map((field) => field.displayName).join(', ');
    }
  };

  return (
    <div className="Sort">
      <label>
        Sort by:{' '}
        <select
          name="sorts"
          id="sorts-select"
          value={JSON.stringify(state.appliedSort)}
          onChange={(e) => controller.sortBy(JSON.parse(e.target.value))}
        >
          {state.availableSorts.map((sort, index) => (
            <option
              key={index}
              value={JSON.stringify(sort)}
              onSelect={() => controller.sortBy(sort)}
            >
              {getSortLabel(sort)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
