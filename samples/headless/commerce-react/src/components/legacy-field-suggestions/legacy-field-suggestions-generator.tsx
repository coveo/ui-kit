/**
 * This component relies on a deprecated headless controller. It is included in this sample mainly for testing purposes
 * and will be removed in a future version.
 *
 * If you wish to implement filter suggestions in your project, please contact your Coveo representative.
 */
import type {
  CategoryFacetSearchResult,
  CategoryFieldSuggestions,
  FieldSuggestionsGenerator,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import LegacyFieldSuggestions from './legacy-field-suggestions.js';

interface ILegacyFieldSuggestionsGeneratorProps {
  controller: FieldSuggestionsGenerator;
  onClickLegacyFieldSuggestion: (
    controller: CategoryFieldSuggestions,
    value: CategoryFacetSearchResult
  ) => void;
}

export default function LegacyFieldSuggestionsGenerator(
  props: ILegacyFieldSuggestionsGeneratorProps
) {
  const {controller, onClickLegacyFieldSuggestion} = props;
  const [fieldSuggestionsState, setFieldSuggestionsState] = useState(
    controller.fieldSuggestions
  );

  useEffect(() => {
    controller.subscribe(() => {
      setFieldSuggestionsState(controller.fieldSuggestions);
    });
  }, [controller]);

  if (fieldSuggestionsState.length === 0) {
    return null;
  }

  return (
    <div className="LegacyFieldSuggestionsGenerator">
      {fieldSuggestionsState.map((fieldSuggestionsController) => {
        return (
          <LegacyFieldSuggestions
            key={fieldSuggestionsController.state.facetId}
            controller={fieldSuggestionsController}
            onClickLegacyFieldSuggestion={onClickLegacyFieldSuggestion}
          />
        );
      })}
    </div>
  );
}
