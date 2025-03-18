import {useInstantProducts, useSearchBox} from '@/lib/commerce-engine';
import {Suggestion} from '@coveo/headless-react/ssr-commerce';
import {useRef, useState} from 'react';
import InstantProducts from '../instant-product';

export default function RichSearchBox() {
  const {state, methods} = useSearchBox();
  const {state: instantProductsState, methods: instantProductsMethods} =
    useInstantProducts();

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
    setIsShowingSuggestions(true);

    if (state.suggestions.length > 0) {
      instantProductsMethods?.updateQuery(
        suggestionSelectors.first()?.getAttribute('name') ?? ''
      );
    }
  };

  const handleSearchBoxKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>
  ) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        isActiveSuggestionInstantProduct()
          ? suggestionSelectors.activeInstantProduct()?.click()
          : handleSearchBoxSubmit();
        break;

      case 'ArrowDown':
        event.preventDefault();
        isActiveSuggestionInstantProduct()
          ? activateNextInstantProduct()
          : activateNextSuggestion();
        break;

      case 'ArrowUp':
        event.preventDefault();
        isActiveSuggestionInstantProduct()
          ? activatePreviousInstantProduct()
          : activatePreviousSuggestion();
        break;

      case 'Escape':
        if (inputValue === '') {
          setIsShowingSuggestions(false);
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        activateFirstInstantProduct();

        break;

      case 'ArrowLeft':
        event.preventDefault();
        activateFirstSuggestion();

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

    instantProductsMethods?.updateQuery('');
  };

  const handleSuggestionMouseOver = (event: React.MouseEvent) => {
    const currentActiveSuggestion = suggestionSelectors.active();
    const newActiveSuggestion = event.currentTarget;
    if (newActiveSuggestion === currentActiveSuggestion) {
      return;
    }

    currentActiveSuggestion?.removeAttribute('aria-selected');
    newActiveSuggestion.setAttribute('aria-selected', 'true');

    instantProductsMethods?.updateQuery(
      newActiveSuggestion.getAttribute('name') ?? ''
    );
  };

  const activateFirstInstantProduct = () => {
    const {active, firstInstantProduct} = suggestionSelectors;

    const activeSuggestion = active();

    const firstSuggestion = firstInstantProduct();

    if (!firstSuggestion) {
      return;
    }

    activeSuggestion?.removeAttribute('aria-selected');
    firstSuggestion.setAttribute('aria-selected', 'true');
  };

  const activateFirstSuggestion = () => {
    const {active, first} = suggestionSelectors;

    const activeSuggestion = active();

    const firstSuggestion = first();

    if (!firstSuggestion) {
      return;
    }

    activeSuggestion?.removeAttribute('aria-selected');
    firstSuggestion.setAttribute('aria-selected', 'true');
  };

  const activateNextInstantProduct = () => {
    const {activeInstantProduct, firstInstantProduct, nextInstantProduct} =
      suggestionSelectors;

    const activeSuggestion = activeInstantProduct();

    const firstSuggestion = firstInstantProduct();

    const nextSuggestion = activeSuggestion
      ? (nextInstantProduct() ?? firstSuggestion)
      : firstSuggestion;

    if (!nextSuggestion) {
      return;
    }

    activeSuggestion?.removeAttribute('aria-selected');
    nextSuggestion.setAttribute('aria-selected', 'true');
  };

  const activateNextSuggestion = () => {
    const {active, first, next} = suggestionSelectors;

    const activeSuggestion = active();

    const firstSuggestion = first();

    const nextSuggestion = activeSuggestion
      ? (next() ?? firstSuggestion)
      : firstSuggestion;

    if (!nextSuggestion) {
      return;
    }

    activeSuggestion?.removeAttribute('aria-selected');
    nextSuggestion.setAttribute('aria-selected', 'true');
    const newInputValue = nextSuggestion.getAttribute('name') ?? '';
    setInputValue(newInputValue);
    instantProductsMethods?.updateQuery(newInputValue);
  };

  const activatePreviousInstantProduct = () => {
    const {activeInstantProduct, lastInstantProduct, previousInstantProduct} =
      suggestionSelectors;

    const activeSuggestion = activeInstantProduct();

    const lastSuggestion = lastInstantProduct();

    const previousSuggestion = activeSuggestion
      ? (previousInstantProduct() ?? lastSuggestion)
      : lastSuggestion;

    if (!previousSuggestion) {
      return;
    }

    activeSuggestion?.removeAttribute('aria-selected');
    previousSuggestion.setAttribute('aria-selected', 'true');
  };

  const activatePreviousSuggestion = () => {
    const {active, last, previous} = suggestionSelectors;

    const activeSuggestion = active();

    const previousSuggestion = activeSuggestion ? previous() : last();

    activeSuggestion?.removeAttribute('aria-selected');

    if (!previousSuggestion) {
      setInputValue('');
      instantProductsMethods?.updateQuery('');
      return;
    }

    previousSuggestion.setAttribute('aria-selected', 'true');
    const newInputValue = previousSuggestion.getAttribute('name') ?? '';
    setInputValue(newInputValue);
    instantProductsMethods?.updateQuery(newInputValue);
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

  const isActiveSuggestionInstantProduct = () => {
    return (
      suggestionSelectors.active()?.parentElement?.parentElement?.id ===
      'instant-products'
    );
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
    next: () =>
      suggestionsRef.current?.querySelector('[aria-selected]')?.parentElement
        ?.nextElementSibling?.firstElementChild,
    previous: () =>
      suggestionsRef.current?.querySelector('[aria-selected]')?.parentElement
        ?.previousElementSibling?.firstElementChild,
    lastInstantProduct: () =>
      suggestionsRef.current
        ?.querySelector('#instant-products')
        ?.lastElementChild?.querySelector('button'),
    firstInstantProduct: () =>
      suggestionsRef.current
        ?.querySelector('#instant-products')
        ?.firstElementChild?.querySelector('button'),
    previousInstantProduct: () =>
      suggestionsRef.current?.querySelector('[aria-selected]')?.parentElement
        ?.previousElementSibling?.firstElementChild,
    nextInstantProduct: () =>
      suggestionsRef.current?.querySelector('[aria-selected]')?.parentElement
        ?.nextElementSibling?.firstElementChild,
    activeInstantProduct: (): HTMLButtonElement | null | undefined =>
      suggestionsRef.current
        ?.querySelector('#instant-products')
        ?.querySelector('button[aria-selected]'),
  };

  return (
    <div className="SearchBox">
      <div className="SearchBoxWrapper" style={{whiteSpace: 'nowrap'}}>
        <input
          {...(suggestionSelectors.active() && {
            'aria-activedescendant': `${suggestionSelectors.active()!.id}`,
          })}
          aria-autocomplete="list"
          aria-controls="search-box-suggestions"
          {...(isComboboxExpanded() && {'aria-expanded': true})}
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
          className="SearchBoxSubmit"
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
            className="SearchBoxSuggestionsWrapper"
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
            <div className="QuerySuggestionsWrapper">
              <label htmlFor="query-suggestions">
                <span>
                  <b>Query suggestions</b>
                </span>
              </label>
              <ul
                className="QuerySuggestions"
                id="query-suggestions"
                role="listbox"
              >
                {state.suggestions.map((suggestion, index) => (
                  <li
                    className="QuerySuggestion"
                    key={`${suggestion.rawValue}-${index}`}
                  >
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
            {isComboboxExpanded() &&
              instantProductsState.products.length > 0 && <InstantProducts />}
          </div>
        </>
      )}
    </div>
  );
}
