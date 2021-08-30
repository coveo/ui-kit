import {
  CategoryFacetSearch as HeadlessCategoryFacetSearch,
  CategoryFacetSearchState,
} from '@coveo/headless';
import {FunctionComponent} from 'react';

export interface CategoryFacetSearchProps {
  controller: HeadlessCategoryFacetSearch;
  searchState: CategoryFacetSearchState;
}

export const CategoryFacetSearch: FunctionComponent<CategoryFacetSearchProps> =
  (props) => {
    const onInput = (text: string) => {
      props.controller.updateText(text);
      props.controller.search();
    };

    return (
      <div>
        <input onInput={(e) => onInput(e.currentTarget.value)} />
        <ul>
          {props.searchState.values.map((value) => (
            <li key={[...value.path, value.rawValue].join('>')}>
              <button onClick={() => props.controller.select(value)}>
                {value.displayValue} ({value.count} results)
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };
