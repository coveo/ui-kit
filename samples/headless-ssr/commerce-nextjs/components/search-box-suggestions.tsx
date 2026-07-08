import InstantProducts from './instant-product';

interface Suggestion {
  rawValue: string;
  highlightedValue: string;
}

interface SearchBoxSuggestionsProps {
  /** Prefix used to build stable, unique ids for the ARIA listbox/options. */
  idPrefix: string;
  suggestions: Suggestion[];
  /** Index of the keyboard-highlighted suggestion, or -1 when none. */
  activeIndex: number;
  showInstantProducts: boolean;
  onHighlightSuggestion: (index: number) => void;
  onSelectSuggestion: (rawValue: string) => void;
}

export const suggestionsListId = (idPrefix: string) =>
  `${idPrefix}-suggestions`;
export const suggestionOptionId = (idPrefix: string, index: number) =>
  `${idPrefix}-suggestion-${index}`;

/**
 * The search box dropdown, shared by SearchBox and StandaloneSearchBox.
 * It lays out query suggestions (and recent queries) on the left and a preview
 * of instant products on the right.
 */
export default function SearchBoxSuggestions({
  idPrefix,
  suggestions,
  activeIndex,
  showInstantProducts,
  onHighlightSuggestion,
  onSelectSuggestion,
}: SearchBoxSuggestionsProps) {
  const hasSuggestions = suggestions.length > 0;
  const showMainColumn = hasSuggestions;

  return (
    <div className="SearchBoxDropdown">
      <div className="SearchBoxDropdownColumns">
        {showMainColumn && (
          <div className="SearchBoxDropdownMain">
            {hasSuggestions && (
              <>
                <h4>Query suggestions</h4>
                <ul
                  className="Suggestions"
                  id={suggestionsListId(idPrefix)}
                  role="listbox"
                >
                  {suggestions.map((suggestion, index) => (
                    <li key={suggestion.rawValue} role="presentation">
                      <button
                        type="button"
                        id={suggestionOptionId(idPrefix, index)}
                        role="option"
                        aria-selected={index === activeIndex}
                        data-suggestion-index={index}
                        className={index === activeIndex ? 'active' : undefined}
                        onMouseEnter={() => onHighlightSuggestion(index)}
                        onClick={() => onSelectSuggestion(suggestion.rawValue)}
                        dangerouslySetInnerHTML={{
                          __html: suggestion.highlightedValue,
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        {showInstantProducts && (
          <div className="SearchBoxDropdownAside">
            <h4>Instant products</h4>
            <InstantProducts />
          </div>
        )}
      </div>
    </div>
  );
}
