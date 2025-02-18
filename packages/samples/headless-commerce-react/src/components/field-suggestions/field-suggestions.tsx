import {
  CategoryFacetSearchResult,
  CategoryFieldSuggestions as HeadlessCategoryFieldSuggestions,
  FieldSuggestions as HeadlessFieldSuggestions,
  RegularFacetSearchResult,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IFieldSuggestionsProps {
  controller: HeadlessFieldSuggestions | HeadlessCategoryFieldSuggestions;
  hideDropdowns: () => void;
  navigate?: (url: string) => void;
  redirect?: string;
}

export default function FieldSuggestions(props: IFieldSuggestionsProps) {
  const {controller, hideDropdowns, navigate, redirect} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => {
      setState(controller.state);
    });
  }, [controller]);

  if (state.values.length === 0) {
    return null;
  }

  const onClickFieldSuggestion = (value: RegularFacetSearchResult) => {
    if (controller.type !== 'regular') {
      return;
    }
    hideDropdowns();
    if (redirect && navigate) {
      const parameters = controller.getRedirectionParameters(value);
      navigate(`${redirect}#${parameters}`);
    } else {
      controller.select(value);
    }
  };

  const onClickCategoryFieldSuggestion = (value: CategoryFacetSearchResult) => {
    if (controller.type !== 'hierarchical') {
      return;
    }
    hideDropdowns();
    if (redirect && navigate) {
      const parameters = controller.getRedirectionParameters(value);
      navigate(`${redirect}#${parameters}`);
    } else {
      controller.select(value);
    }
  };

  const suggestionButton = (
    value: RegularFacetSearchResult | CategoryFacetSearchResult
  ) => {
    if (controller.type === 'hierarchical') {
      return (
        <button
          onClick={() =>
            onClickCategoryFieldSuggestion(value as CategoryFacetSearchResult)
          }
        >
          Search for <em>{state.query}</em> in <b>{state.displayName}</b>{' '}
          <em>{value.displayValue}</em> ({value.count} products)
        </button>
      );
    } else {
      return (
        <button
          onClick={() =>
            onClickFieldSuggestion(value as RegularFacetSearchResult)
          }
        >
          Search for <em>{state.query}</em> with <b>{state.displayName}</b>{' '}
          <em>{value.displayValue}</em> ({value.count} products)
        </button>
      );
    }
  };

  return (
    <div className="FieldSuggestions">
      <p>
        <b>{state.displayName}</b> suggestions
      </p>
      <ul>
        {state.values.map((value, index) => (
          <li key={index}>{suggestionButton(value)}</li>
        ))}
      </ul>
    </div>
  );
}
