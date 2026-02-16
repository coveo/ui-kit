import type {
  BaseFacetSearchResult,
  RegularFacet as HeadlessRegularFacet,
  RegularFacetState,
  RegularFacetValue,
} from '@coveo/headless-react/ssr-commerce';
import {useEffect, useRef, useState} from 'react';

export default function RegularFacet({
  controller,
  staticState,
}: {
  controller?: HeadlessRegularFacet;
  staticState: RegularFacetState;
}) {
  const [state, setState] = useState(staticState);
  const [showFacetSearchResults, setShowFacetSearchResults] = useState(false);

  const facetSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    controller?.subscribe(() => setState(controller.state));
  }, [controller]);

  const focusFacetSearchInput = (): void => {
    facetSearchInputRef.current?.focus();
  };

  const onChangeFacetSearchInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (e.target.value === '') {
      setShowFacetSearchResults(false);
      controller?.facetSearch.clear();
      return;
    }

    controller?.facetSearch.updateText(e.target.value);
    controller?.facetSearch.search();
    setShowFacetSearchResults(true);
  };

  const highlightFacetSearchResult = (displayValue: string): string => {
    const query = state.facetSearch.query;
    const regex = new RegExp(query, 'gi');
    return displayValue.replace(regex, (match) => `<mark>${match}</mark>`);
  };

  const onClickFacetSearchResult = (value: BaseFacetSearchResult): void => {
    controller?.facetSearch.select(value);
    controller?.facetSearch.clear();
    setShowFacetSearchResults(false);
    focusFacetSearchInput();
  };

  const onClickFacetSearchClear = (): void => {
    setShowFacetSearchResults(false);
    controller?.facetSearch.clear();
    focusFacetSearchInput();
  };

  const onClickClearSelectedFacetValues = (): void => {
    controller?.deselectAll();
    focusFacetSearchInput();
  };

  const onChangeFacetValue = (facetValue: RegularFacetValue): void => {
    controller?.toggleSelect(facetValue);
    focusFacetSearchInput();
  };

  const renderFacetSearchControls = () => {
    return (
      <search className="FacetSearch">
        <label className="FacetSearchLabel" htmlFor="facetSearchInput">
          Search:{' '}
        </label>
        <input
          aria-label={`Search in facet '${state.displayName ?? state.facetId}'`}
          className="FacetSearchInput"
          disabled={!controller}
          id="facetSearchInput"
          onChange={onChangeFacetSearchInput}
          ref={facetSearchInputRef}
          value={state.facetSearch.query}
        ></input>
        <button
          aria-label="Clear facet search query"
          className="FacetSearchClear"
          disabled={
            !controller ||
            state.facetSearch.query === '' ||
            state.facetSearch.isLoading
          }
          onClick={onClickFacetSearchClear}
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
      </search>
    );
  };

  const renderFacetSearchResults = () => {
    return state.facetSearch.values.length === 0 ? (
      <span className="FacetSearchNoResults">
        No results for <strong>{state.facetSearch.query}</strong>
      </span>
    ) : (
      <ul className="FacetSearchResults">
        {state.facetSearch.values.map((value) => (
          <li
            className="FacetSearchResult"
            key={value.rawValue}
            onClick={() => onClickFacetSearchResult(value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onClickFacetSearchResult(value);
              }
            }}
            style={{width: 'fit-content'}}
          >
            <input
              aria-label={`Select facet search result ${value.displayValue}`}
              className="FacetSearchResultCheckbox"
              disabled={!controller}
              id={value.rawValue}
              type="checkbox"
            ></input>
            <label className="FacetSearchResultLabel" htmlFor={value.rawValue}>
              <span
                className="FacetSearchResultName"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: <>
                dangerouslySetInnerHTML={{
                  __html: highlightFacetSearchResult(value.displayValue),
                }}
              ></span>
            </label>
            <span className="FacetSearchResultNumberOfProducts">
              {' '}
              ({value.count})
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const renderFacetValues = () => {
    return (
      <div className="FacetValuesControls">
        <button
          aria-label="Clear selected facet values"
          className="FacetClearSelected"
          disabled={!controller || state.isLoading || !state.hasActiveValues}
          onClick={onClickClearSelectedFacetValues}
          type="reset"
        >
          X
        </button>
        {state.isLoading && (
          <span className="FacetLoading"> Facet is loading...</span>
        )}
        <ul className="FacetValues">
          {state.values.map((value) => (
            <li className="FacetValue" key={value.value}>
              <input
                aria-label={`${value.state === 'idle' ? 'Select' : 'Deselect'} facet value '${value.value}'`}
                checked={value.state !== 'idle'}
                className="FacetValueCheckbox"
                disabled={!controller || state.isLoading}
                id={value.value}
                onChange={() => onChangeFacetValue(value)}
                type="checkbox"
              ></input>
              <label className="FacetValueLabel" htmlFor={value.value}>
                <span className="FacetValueName">{value.value}</span>
                <span className="FacetValueNumberOfProducts">
                  {' '}
                  ({value.numberOfResults})
                </span>
              </label>
            </li>
          ))}
        </ul>
        <button
          type="button"
          aria-label="Show more facet values"
          className="FacetShowMore"
          disabled={!controller || state.isLoading || !state.canShowMoreValues}
          onClick={controller?.showMoreValues}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Show less facet values"
          className="FacetShowLess"
          disabled={!controller || state.isLoading || !state.canShowLessValues}
          onClick={controller?.showLessValues}
        >
          -
        </button>
      </div>
    );
  };

  return (
    <fieldset className="RegularFacet">
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
