import {useSearchBox} from '@/lib/commerce-engine';
import {Suggestion} from '@coveo/headless-react/ssr-commerce';
import {useRef, useState} from 'react';

export default function SearchBoxWithQuerySuggestions() {
  const {state, methods} = useSearchBox();
  const [inputValue, setInputValue] = useState(state.value);
  const [isExpanded, setIsExpanded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const showSuggestions = () => {
    methods?.showSuggestions();
    setIsExpanded(state.suggestions.length > 0);
  };

  const handleSearchBoxBlur = (event: React.FocusEvent) => {
    console.log('event.relatedTarget', event);
    const activeSuggestion = getActiveSuggestion();
    if (activeSuggestion && event.relatedTarget === activeSuggestion) {
      activeSuggestion.click();
    }

    setIsExpanded(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    methods?.updateText(event.target.value);
    showSuggestions();
  };

  const getActiveSuggestion = (): HTMLButtonElement | null | undefined => {
    return suggestionsRef.current?.querySelector('[aria-selected]');
  };

  const activateNextSuggestion = () => {
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
  };

  const activatePreviousSuggestion = () => {
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
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearchBoxSubmit();
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      inputRef.current?.focus();
      activateNextSuggestion();
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      inputRef.current?.focus();
      activatePreviousSuggestion();
    }
  };

  const handleSearchBoxSubmit = () => {
    setIsExpanded(false);
    methods?.updateText(inputValue);
    methods?.submit();
  };

  const handleSuggestionMouseOver = (event: React.MouseEvent) => {
    getActiveSuggestion()?.removeAttribute('aria-selected');
    event.currentTarget.setAttribute('aria-selected', 'true');
  };

  const handleSuggestionMouseOut = (event: React.MouseEvent) => {
    event.currentTarget.removeAttribute('aria-selected');
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (!methods) {
      return;
    }

    setInputValue(suggestion.rawValue);
    methods.selectSuggestion(suggestion.rawValue);
  };

  return (
    <>
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
          onClick={showSuggestions}
          onFocus={showSuggestions}
          onKeyDown={handleKeyDown}
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
          onFocus={showSuggestions}
          onKeyDown={handleKeyDown}
        >
          <span>⌕</span>
        </button>
      </div>
      {isExpanded && (
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
