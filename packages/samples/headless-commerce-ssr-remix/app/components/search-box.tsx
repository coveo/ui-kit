import {
  useInstantProducts,
  useRecentQueriesList,
  useSearchBox,
} from '@/lib/commerce-engine';
import {Suggestion} from '@coveo/headless-react/ssr-commerce';
import {useRef, useState} from 'react';
import InstantProducts from './instant-product';
import RecentQueries from './recent-queries';

export default function SearchBox() {
  const {state, methods} = useSearchBox();
  const {state: recentQueriesState} = useRecentQueriesList();
  const {state: instantProductsState, methods: instantProductsMethods} =
    useInstantProducts();

  const [inputValue, setInputValue] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const areSuggestionsAvailable = () => {
    return (
      (state.value === '' && recentQueriesState.queries.length > 0) ||
      (state.value !== '' && state.suggestions.length > 0)
    );
  };

  const getActiveSuggestion = (): HTMLButtonElement | null | undefined => {
    return suggestionsRef.current?.querySelector('[aria-selected]');
  };

  const handleSearchBoxFocus = () => {
    if (!methods) {
      return;
    }

    methods.showSuggestions();

    if (areSuggestionsAvailable()) {
      setIsExpanded(true);
    }
  };

  const handleSearchBoxBlur = (e: React.FocusEvent) => {
    const activeSuggestion = getActiveSuggestion();
    if (activeSuggestion && e.relatedTarget === activeSuggestion) {
      activeSuggestion.click();
    }

    setIsExpanded(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!methods || !instantProductsMethods) {
      return;
    }

    setInputValue(event.target.value);

    methods.updateText(event.target.value);

    instantProductsMethods.updateQuery(event.target.value);

    if (areSuggestionsAvailable()) {
      setIsExpanded(true);
    }
  };

  const handleSearchBoxSubmit = () => {
    if (!methods) {
      return;
    }

    setIsExpanded(false);

    methods.updateText(inputValue);
    methods.submit();
  };

  const handleSearchBoxKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        handleSearchBoxSubmit();
        break;
      case 'ArrowDown':
        e.preventDefault();
        inputRef.current?.focus();
        activateNextSuggestion();
        break;
      case 'ArrowUp':
        e.preventDefault();
        inputRef.current?.focus();
        activatePreviousSuggestion();
        break;
      case 'Escape':
        if (state.value === '') {
          setIsExpanded(false);
        }
      case 'Tab':
        if (recentQueriesState.queries.length > 0 && state.value === '') {
          break;
        }
        setIsExpanded(false);
        break;
      default:
        break;
    }
  };

  const onSuggestionMouseOver = (
    event: React.MouseEvent,
    suggestion: Suggestion
  ) => {
    if (!instantProductsMethods) {
      return;
    }

    getActiveSuggestion()?.removeAttribute('aria-selected');
    event.currentTarget.setAttribute('aria-selected', 'true');
    instantProductsMethods.updateQuery(suggestion.rawValue);
  };

  const onSuggestionMouseOut = (event: React.MouseEvent) => {
    event.currentTarget.removeAttribute('aria-selected');
  };

  const onSuggestionClick = (suggestion: Suggestion) => {
    if (!methods) {
      return;
    }

    setInputValue(suggestion.rawValue);
    methods.selectSuggestion(suggestion.rawValue);
  };

  const activateNextSuggestion = () => {
    if (!instantProductsMethods) {
      return;
    }

    const activeSuggestion = getActiveSuggestion();
    let nextSuggestion: HTMLButtonElement | null | undefined;

    const firstSuggestion =
      suggestionsRef.current?.firstElementChild?.querySelector('button');

    if (!activeSuggestion) {
      nextSuggestion = firstSuggestion;
    } else {
      activeSuggestion.removeAttribute('aria-selected');
      nextSuggestion =
        activeSuggestion.parentElement?.nextElementSibling?.querySelector(
          'button'
        );
      if (!nextSuggestion) {
        nextSuggestion = firstSuggestion;
      }
    }

    if (!nextSuggestion) {
      return;
    }

    nextSuggestion.setAttribute('aria-selected', 'true');
    const newInputValue = nextSuggestion.getAttribute('name') ?? '';
    setInputValue(newInputValue);
    instantProductsMethods.updateQuery(newInputValue);
  };

  const activatePreviousSuggestion = () => {
    if (!instantProductsMethods) {
      return;
    }

    const activeSuggestion = getActiveSuggestion();

    if (!activeSuggestion) {
      return;
    }

    activeSuggestion.removeAttribute('aria-selected');

    const previousSuggestion =
      activeSuggestion.parentElement?.previousElementSibling?.querySelector(
        'button'
      );
    previousSuggestion?.setAttribute('aria-selected', 'true');
    const newInputValue = previousSuggestion?.getAttribute('name') ?? '';
    setInputValue(newInputValue);
    instantProductsMethods?.updateQuery(newInputValue);
  };

  return (
    <div className="SearchBox">
      <style>
        {`
          [aria-selected] {
            border-color: rgb(0, 95, 204);
        }
          `}
      </style>
      <div className="SearchBoxInputWrapper" style={{whiteSpace: 'nowrap'}}>
        <input
          {...(getActiveSuggestion() && {
            'aria-activedescendant': `${getActiveSuggestion()!.id}`,
          })}
          aria-autocomplete="list"
          aria-controls="search-box-suggestions"
          {...(isExpanded && {'aria-expanded': true})}
          autoFocus
          className="SearchBoxInput"
          disabled={!methods}
          onBlur={handleSearchBoxBlur}
          onChange={handleInputChange}
          onClick={handleSearchBoxFocus}
          onFocus={handleSearchBoxFocus}
          onKeyDown={handleSearchBoxKeyDown}
          placeholder="Search"
          ref={inputRef}
          role="combobox"
          type="search"
          value={inputValue}
        />

        <button
          aria-controls="search-box-suggestions"
          {...(isExpanded && {'aria-expanded': true})}
          aria-label="Search"
          className="SearchBoxSubmitButton"
          disabled={!methods}
          onBlur={handleSearchBoxBlur}
          onClick={handleSearchBoxSubmit}
          onFocus={handleSearchBoxFocus}
          onKeyDown={handleSearchBoxKeyDown}
        >
          <span>⌕</span>
        </button>
      </div>

      {isExpanded && (
        <div
          id="search-box-suggestions"
          ref={suggestionsRef}
          style={{
            border: '2px groove  rgb(239, 239, 239)',
            paddingBlock: '0.35em 0.625em',
            paddingInline: '0.75em',
          }}
        >
          {recentQueriesState.queries.length > 0 && state.value === '' && (
            <RecentQueries />
          )}
          {state.suggestions.length > 0 && state.value !== '' && (
            <div>
              <label htmlFor="query-suggestions">
                <span>
                  <b>Query suggestions</b>
                </span>
              </label>
              <ul id="query-suggestions" role="listbox">
                {state.suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <button
                      dangerouslySetInnerHTML={{
                        __html: suggestion.highlightedValue,
                      }}
                      id={`query-suggestion-${suggestion.rawValue}`}
                      onClick={() => onSuggestionClick(suggestion)}
                      onMouseOut={onSuggestionMouseOut}
                      onMouseOver={(e) => onSuggestionMouseOver(e, suggestion)}
                      name={suggestion.rawValue}
                      role="option"
                      tabIndex={-1}
                    ></button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {instantProductsState.products.length > 0 && <InstantProducts />}
        </div>
      )}
    </div>
  );
}
