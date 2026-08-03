import type {
  CategoryFacetSearchResult,
  CategoryFilterSuggestions,
  FilterSuggestions,
  FilterSuggestionsGenerator as HeadlessFilterSuggestionsGenerator,
  InstantProducts as HeadlessInstantProducts,
  StandaloneSearchBox as HeadlessStandaloneSearchBox,
  RegularFacetSearchResult,
  Suggestion,
} from '@coveo/headless/commerce';
import {useEffect, useRef, useState} from 'react';
import FilterSuggestionsGenerator from '../filter-suggestions/filter-suggestions-generator.js';
import InstantProducts from '../instant-products/instant-products.js';

interface IStandaloneSearchBoxProps {
  navigate: (url: string) => void;
  controller: HeadlessStandaloneSearchBox;
  instantProductsController: HeadlessInstantProducts;
  filterSuggestionsGeneratorController: HeadlessFilterSuggestionsGenerator;
}
export default function StandaloneSearchBox(props: IStandaloneSearchBoxProps) {
  const {navigate, controller, instantProductsController, filterSuggestionsGeneratorController} =
    props;

  const [state, setState] = useState(controller.state);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    controller.state.value && controller.clear();
    controller.subscribe(() => setState({...controller.state}));
  }, [controller]);

  useEffect(() => {
    if (state.redirectTo === '/search') {
      navigate(`${state.redirectTo}#q=${state.value}`);
      controller.afterRedirection();
    } else if (state.redirectTo !== '') {
      // This handles query pipeline redirect triggers.
      window.location.replace(state.redirectTo);
    }
  }, [state.redirectTo, navigate, state.value, controller]);

  const fetchFilterSuggestions = (value: string) => {
    for (const filterSuggestions of filterSuggestionsGeneratorController.filterSuggestions) {
      filterSuggestions.updateQuery(value);
    }
  };

  const clearFilterSuggestions = () => {
    for (const filterSuggestions of filterSuggestionsGeneratorController.filterSuggestions) {
      filterSuggestions.clear();
    }
  };

  const focusSearchBoxInput = () => {
    searchInputRef.current!.focus();
  };

  const hideDropdown = () => {
    setIsDropdownVisible(false);
  };

  const showDropdown = () => {
    setIsDropdownVisible(true);
  };

  const onSearchBoxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveSuggestion(-1);
    if (e.target.value === '') {
      hideDropdown();
      controller.clear();
      return;
    }

    controller.updateText(e.target.value);
    controller.showSuggestions();
    instantProductsController.updateQuery(e.target.value);
    fetchFilterSuggestions(e.target.value);
    showDropdown();
  };

  const onSearchBoxInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Escape':
        if (isDropdownVisible) {
          hideDropdown();
          break;
        }
        if (state.value !== '') {
          controller.clear();
          clearFilterSuggestions();
          instantProductsController.updateQuery('');
          break;
        }
        break;
      case 'ArrowDown': {
        if (state.suggestions.length === 0) {
          break;
        }
        e.preventDefault();
        const next = (activeSuggestion + 1) % state.suggestions.length;
        setActiveSuggestion(next);
        onFocusSuggestion(state.suggestions[next]);
        showDropdown();
        break;
      }
      case 'ArrowUp': {
        if (state.suggestions.length === 0) {
          break;
        }
        e.preventDefault();
        const next = (activeSuggestion - 1 + state.suggestions.length) % state.suggestions.length;
        setActiveSuggestion(next);
        onFocusSuggestion(state.suggestions[next]);
        showDropdown();
        break;
      }
      case 'Enter':
        if (activeSuggestion >= 0 && state.suggestions[activeSuggestion]) {
          onSelectSuggestion(state.suggestions[activeSuggestion]);
        } else {
          hideDropdown();
          controller.submit();
        }
        break;
      default:
        break;
    }
  };

  const onClickSearchBoxClear = () => {
    focusSearchBoxInput();
    hideDropdown();
    controller.clear();
    clearFilterSuggestions();
    instantProductsController.updateQuery(state.value);
  };

  const onClickSearchBoxSubmit = () => {
    controller.submit();
    focusSearchBoxInput();
    hideDropdown();
  };

  const onFocusSuggestion = (suggestion: Suggestion) => {
    instantProductsController.updateQuery(suggestion.rawValue);
    fetchFilterSuggestions(suggestion.rawValue);
  };

  const onSelectSuggestion = (suggestion: Suggestion) => {
    controller.selectSuggestion(suggestion.rawValue);
    hideDropdown();
    setActiveSuggestion(-1);
  };

  const renderDropdown = () => {
    return (
      <div className="SearchBoxDropdown row" onMouseDown={(e) => e.preventDefault()}>
        {state.suggestions.length > 0 && (
          <div className="QuerySuggestion column small">
            <p>Query suggestions</p>
            <ul role="listbox">
              {state.suggestions.map((suggestion, i) => (
                <li
                  key={`${suggestion.rawValue}-suggestion`}
                  className="QuerySuggestion"
                  role="presentation"
                >
                  <button
                    type="button"
                    role="option"
                    className={i === activeSuggestion ? 'active' : undefined}
                    aria-selected={i === activeSuggestion}
                    onMouseOver={() => {
                      setActiveSuggestion(i);
                      onFocusSuggestion(suggestion);
                    }}
                    onFocus={() => {
                      setActiveSuggestion(i);
                      onFocusSuggestion(suggestion);
                    }}
                    onClick={() => onSelectSuggestion(suggestion)}
                    dangerouslySetInnerHTML={{
                      __html: suggestion.highlightedValue,
                    }}
                  ></button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="InstantProducts column small">
          <InstantProducts controller={instantProductsController} />
        </div>

        <div className="FilterSuggestions column small">
          <FilterSuggestionsGenerator
            controller={filterSuggestionsGeneratorController}
            onClickFilterSuggestion={(
              controller: FilterSuggestions | CategoryFilterSuggestions,
              value: RegularFacetSearchResult | CategoryFacetSearchResult
            ) => {
              hideDropdown();
              const parameters =
                controller.type === 'hierarchical'
                  ? controller.getSearchParameters(value as CategoryFacetSearchResult)
                  : controller.getSearchParameters(value as RegularFacetSearchResult);
              navigate(`/search#${parameters}`);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="Searchbox">
      <input
        aria-label="Enter query"
        className="SearchBoxInput"
        id="search-box"
        onChange={onSearchBoxInputChange}
        onKeyDown={onSearchBoxInputKeyDown}
        onFocus={() => {
          if (state.value !== '') {
            showDropdown();
          }
        }}
        onBlur={() => hideDropdown()}
        ref={searchInputRef}
        value={state.value}
      />
      <button
        aria-label="Clear query"
        className="SearchBoxClear"
        disabled={state.isLoadingSuggestions || state.isLoading || state.value === ''}
        onClick={onClickSearchBoxClear}
        type="reset"
      >
        X
      </button>
      <button
        arial-label="Submit query"
        className="SearchBoxSubmit"
        disabled={state.isLoading}
        onClick={onClickSearchBoxSubmit}
        title="Submit query"
        type="submit"
      >
        Search
      </button>
      {isDropdownVisible && renderDropdown()}
    </div>
  );
}
