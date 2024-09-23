import {
  CategoryFacetSearchResult,
  CategoryFacetValue,
  CategoryFacet as HeadlessCategoryFacet,
} from '@coveo/headless/commerce';
import {useEffect, useRef, useState} from 'react';

interface ICategoryFacetProps {
  controller: HeadlessCategoryFacet;
}

export default function CategoryFacet(props: ICategoryFacetProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);
  const [showFacetSearchResults, setShowFacetSearchResults] = useState(false);

  const facetSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  const focusFacetSearchInput = (): void => {
    facetSearchInputRef.current!.focus();
  };

  const onChangeFacetSearchInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (e.target.value === '') {
      setShowFacetSearchResults(false);
      controller.facetSearch.clear();
      return;
    }

    controller.facetSearch.updateText(e.target.value);
    controller.facetSearch.search();
    setShowFacetSearchResults(true);
  };

  const onClickClearFacetSearch = (): void => {
    setShowFacetSearchResults(false);
    controller.facetSearch.clear();
    focusFacetSearchInput();
  };

  const highlightFacetSearchResult = (displayValue: string): string => {
    const query = state.facetSearch.query;
    const regex = new RegExp(query, 'gi');
    return displayValue.replace(regex, (match) => `<mark>${match}</mark>`);
  };

  const onClickFacetSearchResult = (value: CategoryFacetSearchResult): void => {
    controller.facetSearch.select(value);
    controller.facetSearch.clear();
    setShowFacetSearchResults(false);
    focusFacetSearchInput();
  };

  const onClickClearSelectedFacetValue = (): void => {
    controller.deselectAll();
    focusFacetSearchInput();
  };

  const toggleSelectFacetValue = (value: CategoryFacetValue) => {
    if (controller.isValueSelected(value)) {
      controller.deselectAll();
    }
    controller.toggleSelect(value);
  };

  const renderFacetSearchControls = () => {
    const id = `${state.facetId}-search-input`;
    return (
      <div className="FacetSearch">
        <label className="FacetSearchLabel" htmlFor={id}>
          Search:{' '}
        </label>
        <input
          aria-label={`Search in facet '${state.displayName ?? state.facetId}'`}
          className="FacetSearchInput"
          disabled={state.isLoading}
          id={id}
          onChange={onChangeFacetSearchInput}
          ref={facetSearchInputRef}
          value={state.facetSearch.query}
        ></input>
        <button
          aria-label="Clear facet search query"
          className="FacetSearchClear"
          disabled={state.isLoading || state.facetSearch.query === ''}
          onClick={onClickClearFacetSearch}
          type="reset"
        >
          X
        </button>
        {state.facetSearch.isLoading && (
          <span className="FacetSearchLoading">
            {' '}
            Facet search is loading...
          </span>
        )}
      </div>
    );
  };

  const renderFacetSearchResults = () => {
    return state.facetSearch.values.length === 0 ? (
      <span className="FacetSearchNoResults">
        No results for <strong>{state.facetSearch.query}</strong>
      </span>
    ) : (
      <ul className="FacetSearchResults">
        {state.facetSearch.values.map((value) => {
          const id = `${state.facetId}-search-result-${value.rawValue}`;
          return (
            <li
              className="FacetSearchResult"
              key={id}
              onClick={() => onClickFacetSearchResult(value)}
              style={{width: 'fit-content'}}
            >
              <input
                aria-label={`Select facet search result '${value.displayValue}' in category '${value.path.join(' / ')}'`}
                className="FacetSearchResultCheckbox"
                disabled={state.isLoading}
                id={id}
                type="checkbox"
              ></input>
              <label className="FacetSearchResultLabel" htmlFor={id}>
                <span
                  className="FacetSearchResultName"
                  dangerouslySetInnerHTML={{
                    __html: highlightFacetSearchResult(value.displayValue),
                  }}
                ></span>
                {value.path.length > 0 && (
                  <span className="FacetSearchResultCategory">
                    {' '}
                    <small>in {value.path.join(' > ')}</small>
                  </span>
                )}
              </label>
              <span className="FacetSearchResultNumberOfProducts">
                {' '}
                ({value.count})
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderActiveFacetValueTree = () => {
    if (!state.hasActiveValues) {
      return null;
    }

    const ancestry = state.selectedValueAncestry!;
    const activeValueChildren = ancestry[ancestry.length - 1]?.children ?? [];

    return (
      <ul className="ActiveFacetValueTree">
        {ancestry.map((ancestryValue) => {
          const id = `ancestry-facet-value-${ancestryValue.value}`;
          return (
            <li
              className="AncestryFacetValue"
              key={`${ancestryValue.value}-ancestry`}
            >
              <input
                checked={controller.isValueSelected(ancestryValue)}
                className="FacetValueCheckbox"
                disabled={state.isLoading}
                id={id}
                onChange={() => toggleSelectFacetValue(ancestryValue)}
                type="checkbox"
              ></input>
              <label className="FacetValueLabel" htmlFor={id}>
                <span className="FacetValueName">{ancestryValue.value}</span>
                <span className="FacetValueNumberOfProducts">
                  {' '}
                  ({ancestryValue.numberOfResults})
                </span>
              </label>
            </li>
          );
        })}
        {activeValueChildren.length > 0 && (
          <ul className="ActiveFacetValueChildren">
            {activeValueChildren.map((child) => {
              const checkboxId = `facetValueChildCheckbox-${child.value}`;
              return (
                <li className="FacetValueChild" key={`${child.value}-child`}>
                  <input
                    checked={false}
                    className="FacetValueCheckbox"
                    disabled={state.isLoading}
                    id={checkboxId}
                    type="checkbox"
                    onChange={() => toggleSelectFacetValue(child)}
                  ></input>
                  <label className="FacetValueLabel" htmlFor={checkboxId}>
                    <span className="FacetValueName">{child.value}</span>
                    <span className="FacetValueNumberOfProducts">
                      {' '}
                      ({child.numberOfResults})
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </ul>
    );
  };

  const renderRootValues = () => {
    if (state.hasActiveValues) {
      return null;
    }

    return (
      <ul className="RootFacetValues">
        {state.values.map((root) => {
          const id = `${root.value}-root`;
          return (
            <li className="FacetValue" key={id}>
              <input
                checked={false}
                className="FacetValueCheckbox"
                disabled={state.isLoading}
                id={id}
                onChange={() => toggleSelectFacetValue(root)}
                type="checkbox"
              ></input>
              <label className="FacetValueName" htmlFor={id}>
                {root.value}
              </label>
              <span className="FacetValueNumberOfResults">
                {' '}
                ({root.numberOfResults})
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderFacetValues = () => {
    return (
      <div className="FacetValues">
        <button
          aria-label="Clear selected facet value"
          className="FacetClear"
          disabled={state.isLoading || !state.hasActiveValues}
          onClick={onClickClearSelectedFacetValue}
          type="reset"
        >
          X
        </button>
        {renderRootValues()}
        {renderActiveFacetValueTree()}
        <button
          aria-label="Show more facet values"
          className="FacetShowMore"
          disabled={state.isLoading || !state.canShowMoreValues}
          onClick={controller.showMoreValues}
        >
          +
        </button>
        <button
          aria-label="Show less facet values"
          className="FacetShowLess"
          disabled={state.isLoading || !state.canShowLessValues}
          onClick={controller.showLessValues}
        >
          -
        </button>
      </div>
    );
  };

  return (
    <fieldset className="CategoryFacet">
      <legend className="FacetDisplayName">
        {state.displayName ?? state.facetId}
      </legend>
      {renderFacetSearchControls()}
      {showFacetSearchResults
        ? renderFacetSearchResults()
        : renderFacetValues()}
    </fieldset>
  );
}
