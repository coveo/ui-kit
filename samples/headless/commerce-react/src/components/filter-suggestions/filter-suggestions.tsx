/**
 * This component relies on a headless controller and Commerce API feature that are not yet generally available.
 *
 * If you wish to implement filter suggestions in your project, please contact your Coveo representative.
 */
import type {
  CategoryFacetSearchResult,
  CategoryFilterSuggestions,
  FilterSuggestions as HeadlessFilterSuggestions,
  RegularFacetSearchResult,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IFilterSuggestionsProps {
  controller: HeadlessFilterSuggestions | CategoryFilterSuggestions;
  onClickFilterSuggestion: (
    controller: HeadlessFilterSuggestions | CategoryFilterSuggestions,
    value: RegularFacetSearchResult | CategoryFacetSearchResult
  ) => void;
}

export default function FilterSuggestions(props: IFilterSuggestionsProps) {
  const {controller, onClickFilterSuggestion} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => {
      setState(controller.state);
    });
  }, [controller]);

  if (state.values.length === 0) {
    return null;
  }

  const renderFilterSuggestionButton = (
    value: RegularFacetSearchResult | CategoryFacetSearchResult
  ) => {
    return (
      <button
        type="button"
        onClick={() => onClickFilterSuggestion(controller, value)}
      >
        Search for <em>{state.query}</em>{' '}
        {controller.type === 'hierarchical' ? 'in' : 'with'}{' '}
        <b>{state.displayName}</b> <em>{value.displayValue}</em> ({value.count}{' '}
        products)
      </button>
    );
  };

  return (
    <div className="FilterSuggestions">
      <p>
        <b>{state.displayName}</b> suggestions
      </p>
      <ul>
        {state.values.map((value) => (
          <li
            key={
              'path' in value
                ? [...value.path, value.rawValue].join(';')
                : value.rawValue
            }
          >
            {renderFilterSuggestionButton(value)}
          </li>
        ))}
      </ul>
    </div>
  );
}
