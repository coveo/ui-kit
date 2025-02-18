import {GeneratedFieldSuggestionsControllers} from '@coveo/headless/commerce';
import FieldSuggestions from './field-suggestions.js';

interface IFieldSuggestionsGeneratorProps {
  controllers: GeneratedFieldSuggestionsControllers;
  hideDropdowns: () => void;
  navigate?: (url: string) => void;
  redirect?: string;
}

export default function FieldSuggestionsGenerator(
  props: IFieldSuggestionsGeneratorProps
) {
  const {controllers, hideDropdowns, navigate, redirect} = props;

  if (controllers.length === 0) {
    return null;
  }

  return (
    <div className="FieldSuggestionsGenerator">
      {controllers.map((fieldSuggestions, index) => {
        return (
          <FieldSuggestions
            key={index}
            controller={fieldSuggestions}
            hideDropdowns={hideDropdowns}
            navigate={navigate}
            redirect={redirect}
          />
        );
      })}
    </div>
  );
}
