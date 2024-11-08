'use client';

// import {SortBy, SortCriterion} from '@coveo/headless-react/ssr-commerce';
import {useSort} from '../_lib/commerce-engine';

export default function Sort() {
  const {state, methods} = useSort();

  if (state.availableSorts.length === 0) {
    return null;
  }

  // TODO: uncomment when KIT-3700: is fixed
  // const getSortLabel = (criterion: SortCriterion) => {
  //   switch (criterion.by) {
  //     case SortBy.Relevancy:
  //       return 'Relevance';
  //     case SortBy.Field:
  //       return criterion.field;
  //   }
  // };

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
            {/* TODO:KIT-3700: there is a type mismatch with the sort criterion FIXME:!!*/}
            {/* {getSortLabel(sort)} */}
          </option>
        ))}
      </select>
    </div>
  );
}
