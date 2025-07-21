import {
  type Sort as HeadlessSort,
  SortBy,
  type SortCriterion,
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    controller.sortBy(JSON.parse(e.target.value));
  };

  const getValues = () => {
    return state.availableSorts.map((sort) => {
      return JSON.stringify(sort);
    });
  };

  return (
    <div className="Sort">
      <label htmlFor="sport-select">Sort by: </label>
      <select
        name="sorts"
        id="sorts-select"
        onChange={handleChange}
        value={
          JSON.stringify(state.appliedSort) ??
          JSON.stringify({by: SortBy.Relevance})
        }
      >
        {getValues().map((sort) => (
          <option id="0" key={sort} value={sort}>
            {getSortLabel(JSON.parse(sort))}
          </option>
        ))}
      </select>
    </div>
  );
}
