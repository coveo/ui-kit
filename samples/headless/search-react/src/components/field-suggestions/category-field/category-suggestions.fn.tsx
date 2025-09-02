import type {CategoryFieldSuggestions as HeadlessCategoryFieldSuggestions} from '@coveo/headless';
import {type FunctionComponent, useEffect, useState} from 'react';

interface CategoryFieldSuggestionsProps {
  controller: HeadlessCategoryFieldSuggestions;
}

export const CategoryFieldSuggestions: FunctionComponent<
  CategoryFieldSuggestionsProps
> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const onInput = (text: string) => {
    if (text === '') {
      controller.clear();
      return;
    }
    controller.updateText(text);
  };

  return (
    <div>
      <input onInput={(e) => onInput(e.currentTarget.value)} />
      <ul>
        {state.values.map((facetSearchValue) => (
          <li
            key={[...facetSearchValue.path, facetSearchValue.rawValue].join(
              '>'
            )}
            onClick={() => controller.select(facetSearchValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                controller.select(facetSearchValue);
              }
            }}
          >
            {[...facetSearchValue.path, facetSearchValue.displayValue].join(
              ' > '
            )}{' '}
            ({facetSearchValue.count} results)
          </li>
        ))}
      </ul>
    </div>
  );
};

// usage

/**
 * ```tsx
 * const facetOptions: CategoryFacetOptions = {field: 'geographicalhierarchy'}
 * const options: CategoryFieldSuggestionsOptions = {facet: facetOptions};
 * const controller = buildCategoryFieldSuggestions(engine, {options});
 *
 * <CategoryFieldSuggestions controller={controller} />;
 * ```
 */
