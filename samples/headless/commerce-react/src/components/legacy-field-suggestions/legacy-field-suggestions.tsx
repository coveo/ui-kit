/**
 * This component relies on a deprecated Coveo Headless controller. It is included in this sample mainly for testing
 * purposes and will be removed in a future version.
 *
 * If you wish to implement filter suggestions in your project, please contact your Coveo representative.
 */
import type {
  CategoryFacetSearchResult,
  CategoryFieldSuggestions,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface ILegacyFieldSuggestionsProps {
  controller: CategoryFieldSuggestions;
  onClickLegacyFieldSuggestion: (
    controller: CategoryFieldSuggestions,
    value: CategoryFacetSearchResult
  ) => void;
}

export default function LegacyFieldSuggestions(
  props: ILegacyFieldSuggestionsProps
) {
  const {controller, onClickLegacyFieldSuggestion} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => {
      setState(controller.state);
    });
  }, [controller]);

  if (state.values.length === 0) {
    return null;
  }

  const renderLegacyFieldSuggestionButton = (
    value: CategoryFacetSearchResult
  ) => {
    return (
      <button
        type="button"
        onClick={() => onClickLegacyFieldSuggestion(controller, value)}
      >
        Select the <em>{[...value.path, value.displayValue].join('/')}</em>{' '}
        value in the <b>{state.displayName}</b> facet ({value.count} products)
      </button>
    );
  };

  return (
    <div className="LegacyFieldSuggestions">
      <p>
        <b>{state.displayName}</b> field value suggestions
      </p>
      <ul>
        {state.values.map((value) => (
          <li key={[...value.path, value.rawValue].join(';')}>
            {renderLegacyFieldSuggestionButton(value)}
          </li>
        ))}
      </ul>
    </div>
  );
}
