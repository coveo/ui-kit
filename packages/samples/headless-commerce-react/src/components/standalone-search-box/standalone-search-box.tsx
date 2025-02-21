import {
  StandaloneSearchBox as HeadlessStandaloneSearchBox,
  InstantProducts as HeadlessInstantProducts,
  Suggestion,
} from '@coveo/headless/commerce';
import {useEffect, useRef, useState} from 'react';
import InstantProducts from '../instant-products/instant-products.js';

interface IStandaloneSearchBoxProps {
  navigate: (url: string) => void;
  controller: HeadlessStandaloneSearchBox;
  instantProductsController: HeadlessInstantProducts;
}

export default function StandaloneSearchBox(props: IStandaloneSearchBoxProps) {
  const {navigate, controller, instantProductsController} = props;

  const [state, setState] = useState(controller.state);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

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
      window.location.href = state.redirectTo;
    }
  }, [state.redirectTo, navigate, state.value, controller]);

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
    instantProductsController.updateQuery(e.target.value);
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
  };

  const onClickSearchBoxSubmit = () => {
    controller.submit();
    focusSearchBoxInput();
    hideDropdown();
  };

  const onFocusSuggestion = (suggestion: Suggestion) => {
    instantProductsController.updateQuery(suggestion.rawValue);
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
        ref={searchInputRef}
        value={state.value}
      />
      <button
        aria-label="Clear query"
        className="SearchBoxClear"
        disabled={
          state.isLoadingSuggestions || state.isLoading || state.value === ''
        }
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
