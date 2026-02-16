import type {FieldSuggestions as HeadlessFieldSuggestions} from '@coveo/headless';
import {type FunctionComponent, useEffect, useState} from 'react';

interface FieldSuggestionsProps {
  controller: HeadlessFieldSuggestions;
}

export const FieldSuggestions: FunctionComponent<FieldSuggestionsProps> = (
  props
) => {
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
            key={facetSearchValue.rawValue}
            onClick={() => controller.select(facetSearchValue)}
            onKeyUp={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                controller.select(facetSearchValue);
              }
            }}
          >
            {facetSearchValue.displayValue} ({facetSearchValue.count} results)
          </li>
        ))}
      </ul>
    </div>
  );
};

// usage

/**
 * ```tsx
 * const facetOptions: FacetOptions = {field: 'author'};
 * const options: FieldSuggestionsOptions = {facet: facetOptions};
 * const controller = buildFieldSuggestions(engine, {options});
 *
 * <FieldSuggestions controller={controller} />;
 * ```
 */
