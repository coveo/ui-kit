import type {
  FieldSuggestions as FieldSuggestionsController,
  FieldSuggestionsValue,
} from '@coveo/headless';
import {useController} from '../use-controller';

interface FieldSuggestionsProps {
  controller: FieldSuggestionsController;
  title: string;
  onSelect?: () => void;
}

/**
 * Renders field suggestions as a column of the search box dropdown, next to the
 * query suggestions and instant results. The query comes from the search box
 * input: see `search-box.tsx`, which forwards each keystroke to this
 * controller's `updateText`.
 */
export function FieldSuggestions({controller, title, onSelect}: FieldSuggestionsProps) {
  const {values} = useController(controller);

  if (values.length === 0) {
    return null;
  }

  const select = (value: FieldSuggestionsValue) => {
    controller.select(value);
    onSelect?.();
  };

  return (
    <div className="search-box__column">
      <p className="search-box__column-title">{title}</p>
      <ul>
        {values.map((value) => (
          <li key={value.rawValue}>
            <button
              type="button"
              className="search-box__suggestion field-suggestion"
              onClick={() => select(value)}
            >
              <span>{value.displayValue}</span>
              <span className="field-suggestion__count">{value.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
