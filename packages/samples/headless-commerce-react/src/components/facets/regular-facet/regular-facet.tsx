import type {
  RegularFacet as HeadlessRegularFacet,
  RegularFacetSearchResult,
  RegularFacetValue,
} from '@coveo/headless/commerce';
import {useEffect, useRef, useState} from 'react';

interface IRegularFacetProps {
  controller: HeadlessRegularFacet;
}

export default function RegularFacet(props: IRegularFacetProps) {
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

  const highlightFacetSearchResult = (displayValue: string): string => {
    const query = state.facetSearch.query;
    const regex = new RegExp(query, 'gi');
    return displayValue.replace(regex, (match) => `<mark>${match}</mark>`);
  };

  const onClickFacetSearchResult = (value: RegularFacetSearchResult): void => {
    controller.facetSearch.select(value);
    controller.facetSearch.clear();
    setShowFacetSearchResults(false);
    focusFacetSearchInput();
  };

  const onClickFacetSearchClear = (): void => {
    setShowFacetSearchResults(false);
    controller.facetSearch.clear();
    focusFacetSearchInput();
  };

  const onClickClearSelectedFacetValues = (): void => {
    controller.deselectAll();
    focusFacetSearchInput();
  };

  const onClickFacetValue = (facetValue: RegularFacetValue): void => {
    controller.toggleSelect(facetValue);
    focusFacetSearchInput();
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
              disabled={state.isLoading}
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
          disabled={state.isLoading || !state.hasActiveValues}
          onClick={onClickClearSelectedFacetValues}
          type="reset"
        >
          X
        </button>
        {state.isLoading && (
          <span className="FacetLoading"> Facet is loading...</span>
        )}
        <ul className="FacetValues">
          {state.values.map((value) => {
            const id = `${state.facetId}-${value.value}-facet-value`;
            return (
              <li className="FacetValue" key={id}>
                <input
                  aria-label={`${value.state === 'idle' ? 'Select' : 'Deselect'} facet value '${value.value}'`}
                  className="FacetValueCheckbox"
                  disabled={state.isLoading}
                  id={id}
                  checked={value.state !== 'idle'}
                  onChange={() => onClickFacetValue(value)}
                  type="checkbox"
                ></input>
                <label className="FacetValueLabel" htmlFor={id}>
                  <span className="FacetValueName">{value.value}</span>
                  <span className="FacetValueNumberOfProducts">
                    {' '}
                    ({value.numberOfResults})
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          aria-label="Show more facet values"
          className="FacetShowMore"
          disabled={state.isLoading || !state.canShowMoreValues}
          onClick={controller.showMoreValues}
        >
          +
        </button>
        <button
          type="button"
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
