import type {SearchBox as SearchBoxController} from '@coveo/headless';
import {useController} from '../use-controller';

interface SearchBoxProps {
  controller: SearchBoxController;
}

export function SearchBox({controller}: SearchBoxProps) {
  const {value, suggestions} = useController(controller);

  return (
    <div className="search-box">
      <input
        type="search"
        value={value}
        placeholder="Search the knowledge base…"
        aria-label="Search"
        onChange={(e) => controller.updateText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            controller.submit();
          }
        }}
      />
      {suggestions.length > 0 && (
        <ul className="search-box__suggestions">
          {suggestions.map((suggestion) => (
            <li key={suggestion.rawValue}>
              <button
                type="button"
                onClick={() => controller.selectSuggestion(suggestion.rawValue)}
              >
                {suggestion.rawValue}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
