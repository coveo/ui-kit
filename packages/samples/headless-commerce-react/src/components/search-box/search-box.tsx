import {
  SearchBox as HeadlessSearchBox,
  InstantProducts as HeadlessInstantProducts,
  Suggestion,
  FilterSuggestionsGenerator as HeadlessFilterSuggestionsGenerator,
  CategoryFilterSuggestions,
  FilterSuggestions,
  RegularFacetSearchResult,
  CategoryFacetSearchResult,
} from '@coveo/headless/commerce';
import {useEffect, useRef, useState} from 'react';
import FilterSuggestionsGenerator from '../filter-suggestions/filter-suggestions-generator.js';
import InstantProducts from '../instant-products/instant-products.js';

interface ISearchBoxProps {
  controller: HeadlessSearchBox;
  instantProductsController: HeadlessInstantProducts;
  filterSuggestionsGeneratorController: HeadlessFilterSuggestionsGenerator;
  navigate: (pathName: string) => void;
}

export default function SearchBox(props: ISearchBoxProps) {
  const {
    controller,
    instantProductsController,
    filterSuggestionsGeneratorController,
    navigate,
  } = props;

  const [state, setState] = useState(controller.state);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    controller.subscribe(() => setState({...controller.state}));
  }, [controller]);

  const fetchFilterSuggestions = (value: string) => {
    for (const filterSuggestions of filterSuggestionsGeneratorController.filterSuggestions) {
      filterSuggestions.fetchSuggestions(value);
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

  const onSearchBoxInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    switch (e.key) {
      case 'Escape':
        if (isDropdownVisible) {
          hideDropdown();
          break;
        }
        if (state.value !== '') {
          controller.clear();
          instantProductsController.updateQuery(state.value);
          clearFilterSuggestions();
          break;
        }
        break;
      case 'Enter':
        hideDropdown();
        controller.submit();
        break;
      default:
        break;
    }
  };

  const onClickSearchBoxClear = () => {
    focusSearchBoxInput();
    hideDropdown();
    controller.clear();
    instantProductsController.updateQuery(state.value);
    clearFilterSuggestions();
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
  };

  const renderDropdown = () => {
    return (
      <div className="SearchBoxDropdown row">
        {state.suggestions.length > 0 && (
          <div className="QuerySuggestion column small">
            <p>Query suggestions</p>
            <ul>
              {state.suggestions.map((suggestion) => (
                <li
                  key={`${suggestion.rawValue}-suggestion`}
                  className="QuerySuggestion"
                >
                  <button
                    onMouseOver={() => onFocusSuggestion(suggestion)}
                    onFocus={() => onFocusSuggestion(suggestion)}
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

        <div className="InstantProducts column">
          <InstantProducts
            controller={instantProductsController}
            navigate={navigate}
          />
        </div>

        <div className="FilterSuggestions column">
          <FilterSuggestionsGenerator
            controller={filterSuggestionsGeneratorController}
            onClickFilterSuggestion={(
              controller: FilterSuggestions | CategoryFilterSuggestions,
              value: RegularFacetSearchResult | CategoryFacetSearchResult
            ) => {
              hideDropdown();
              controller.type === 'hierarchical'
                ? controller.select(value as CategoryFacetSearchResult)
                : controller.select(value as RegularFacetSearchResult);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="Searchbox">
      <input
        className="SearchBoxInput"
        id="search-box"
        onInput={onSearchBoxInputChange}
        onKeyDown={onSearchBoxInputKeyDown}
        ref={searchInputRef}
        value={state.value}
      ></input>
      <button
        aria-label="Clear query"
        className="SearchBoxClear"
        disabled={
          state.isLoadingSuggestions || state.isLoading || state.value === ''
        }
        onClick={onClickSearchBoxClear}
        title="Clear query"
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
