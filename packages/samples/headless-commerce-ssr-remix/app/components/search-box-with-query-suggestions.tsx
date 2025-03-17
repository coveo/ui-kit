import {useSearchBox} from '@/lib/commerce-engine';
import {Suggestion} from '@coveo/headless-react/ssr-commerce';
import {useRef, useState} from 'react';

export default function SearchBoxWithQuerySuggestions() {
  const {state, methods} = useSearchBox();

  const [inputValue, setInputValue] = useState(state.value);
  const [showingSuggestions, setIsShowingSuggestions] = useState(false);

  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleSearchBoxBlur = (event: React.FocusEvent) => {
    const activeSuggestion = suggestionSelectors.active();
    if (activeSuggestion && event.relatedTarget === activeSuggestion) {
      suggestionSelectors.activeButton()!.click();
    }

    setIsShowingSuggestions(false);
  };

  const handleSearchBoxInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    methods?.updateText(newValue);

    if (!showingSuggestions) {
      showSuggestions();
    }
  };

  const handleSearchBoxKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>
  ) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        handleSearchBoxSubmit();
        break;

      case 'ArrowDown':
        event.preventDefault();
        activateNextSuggestion();
        break;

      case 'ArrowUp':
        event.preventDefault();
        activatePreviousSuggestion();
        break;

      case 'Escape':
        if (inputValue === '') {
          setIsShowingSuggestions(false);
        }
        break;

      default:
        break;
    }
  };

  const handleSearchBoxSubmit = () => {
    setIsShowingSuggestions(false);
    methods?.updateText(inputValue);
    methods?.submit();
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (!methods) {
      return;
    }

    setInputValue(suggestion.rawValue);
    methods.selectSuggestion(suggestion.rawValue);
  };

  const handleSuggestionMouseOut = (event: React.MouseEvent) => {
    event.currentTarget.removeAttribute('aria-selected');
  };

  const handleSuggestionMouseOver = (event: React.MouseEvent) => {
    suggestionSelectors.active()?.removeAttribute('aria-selected');
    event.currentTarget.setAttribute('aria-selected', 'true');
  };

  const activateNextSuggestion = () => {
    const {active, first, next} = suggestionSelectors;

    const activeSuggestion = active();
    activeSuggestion?.removeAttribute('aria-selected');

    const firstSuggestion = first();

    const nextSuggestion = activeSuggestion
      ? (next ?? firstSuggestion)
      : firstSuggestion;

    if (!nextSuggestion) {
      return;
    }

    nextSuggestion.setAttribute('aria-selected', 'true');
    const newInputValue = nextSuggestion.getAttribute('name') ?? '';
    setInputValue(newInputValue);
  };

  const activatePreviousSuggestion = () => {
    const {active, last, previous} = suggestionSelectors;

    const activeSuggestion = active();
    activeSuggestion?.removeAttribute('aria-selected');

    const previousSuggestion = activeSuggestion ? previous : last();

    if (!previousSuggestion) {
      setInputValue('');
      return;
    }

    previousSuggestion.setAttribute('aria-selected', 'true');
    const newInputValue = previousSuggestion.getAttribute('name') ?? '';
    setInputValue(newInputValue);
  };

  const isComboboxExpanded = () => {
    return showingSuggestions && state.suggestions.length > 0;
  };

  const showSuggestions = () => {
    if (!showingSuggestions) {
      methods?.showSuggestions();
      setIsShowingSuggestions(true);
    }
  };

  const suggestionSelectors = {
    active: () => suggestionsRef.current?.querySelector('[aria-selected]'),
    activeButton: () =>
      suggestionsRef.current
        ?.querySelector('[aria-selected]')
        ?.querySelector('button'),
    first: () =>
      suggestionsRef.current
        ?.querySelector('ul')
        ?.firstElementChild?.querySelector('button'),
    last: () =>
      suggestionsRef.current?.firstElementChild
        ?.querySelector('ul')
        ?.lastElementChild?.querySelector('button'),
    next: suggestionsRef.current
      ?.querySelector('[aria-selected]')
      ?.parentElement?.nextElementSibling?.querySelector('button'),
    previous: suggestionsRef.current
      ?.querySelector('[aria-selected]')
      ?.parentElement?.previousElementSibling?.querySelector('button'),
  };

  return (
    <>
      <div className="SearchBoxInputWrapper" style={{whiteSpace: 'nowrap'}}>
        <input
          {...(suggestionSelectors.active() && {
            'aria-activedescendant': `${suggestionSelectors.active()!.id}`,
          })}
          aria-autocomplete="list"
          aria-controls="search-box-suggestions"
          {...(isComboboxExpanded() && {'aria-expanded': true})}
          autoFocus
          className="SearchBoxInput"
          disabled={!methods}
          onBlur={handleSearchBoxBlur}
          onChange={handleSearchBoxInputChange}
          onClick={showSuggestions}
          onFocus={showSuggestions}
          onKeyDown={handleSearchBoxKeyDown}
          placeholder="Search"
          role="combobox"
          type="search"
          value={inputValue}
        />

        <button
          aria-controls="search-box-suggestions"
          {...(isComboboxExpanded() && {'aria-expanded': true})}
          aria-label="Search"
          className="SearchBoxSubmitButton"
          disabled={!methods}
          onClick={handleSearchBoxSubmit}
          onKeyDown={handleSearchBoxKeyDown}
          onFocus={showSuggestions}
          onBlur={handleSearchBoxBlur}
        >
          <span>⌕</span>
        </button>
      </div>
      {isComboboxExpanded() && (
        <>
          <style>
            {`
          [aria-selected] {
            border-color: rgb(0, 95, 204);
        }
          `}
          </style>
          <div
            id="search-box-suggestions"
            ref={suggestionsRef}
            style={{
              border: '2px groove  rgb(239, 239, 239)',
              paddingBlock: '0.35em 0.625em',
              paddingInline: '0.75em',
              display: 'flex',
              flexDirection: 'row',
              position: 'absolute',
              backgroundColor: 'white',
            }}
          >
            <div>
              <label htmlFor="query-suggestions">
                <span>
                  <b>Query suggestions</b>
                </span>
              </label>
              <ul id="query-suggestions" role="listbox">
                {state.suggestions.map((suggestion, index) => (
                  <li key={`${suggestion.rawValue}-${index}`}>
                    <button
                      dangerouslySetInnerHTML={{
                        __html: suggestion.highlightedValue,
                      }}
                      id={`query-suggestion-${suggestion.rawValue}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseOut={handleSuggestionMouseOut}
                      onMouseOver={handleSuggestionMouseOver}
                      name={suggestion.rawValue}
                      role="option"
                      tabIndex={-1}
                    ></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}
