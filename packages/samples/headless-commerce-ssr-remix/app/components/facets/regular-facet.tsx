import {
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

  const getNumberOfFilters = (): number => {
    return state.values.filter((value) => value.state !== 'idle').length;
  };

  const focusFacetSearchInput = (): void => {
    facetSearchInputRef.current?.focus();
  };

  const onChangeFacetSearchInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (!controller) {
      return;
    }

    if (e.target.value === '') {
      controller.facetSearch.clear();
      setShowFacetSearchResults(false);
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

  const onClickFacetSearchResult = (value: BaseFacetSearchResult): void => {
    controller?.facetSearch.select(value);
    controller?.facetSearch.clear();
    setShowFacetSearchResults(false);
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
        <input
          className="FacetSearchInput"
          aria-label={`Search in facet '${state.displayName ?? state.facetId}'`}
          type="search"
          placeholder="Search"
          disabled={!controller}
          id="facetSearchInput"
          onChange={onChangeFacetSearchInput}
          ref={facetSearchInputRef}
          value={state.facetSearch.query}
        ></input>
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
            style={{width: 'fit-content'}}
          >
            <input
              aria-label={`Select facet search result ${value.displayValue}`}
              className="FacetSearchResultCheckbox"
              disabled={!controller || state.isLoading}
              id={value.rawValue}
              type="checkbox"
            ></input>
            <label className="FacetSearchResultLabel" htmlFor={value.rawValue}>
              <span
                className="FacetSearchResultName"
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
    );
  };

  const renderClearFilters = () => {
    const numberOfFilters = getNumberOfFilters();

    if (numberOfFilters === 0) {
      return null;
    }

    return (
      <div>
        <button
          className="FacetClearFilters"
          aria-label="Clear selected facet values"
          disabled={!controller || state.isLoading || !state.hasActiveValues}
          onClick={onClickClearSelectedFacetValues}
          type="reset"
        >
          <span>
            × Clear{' '}
            {numberOfFilters > 1 ? `${numberOfFilters} filters` : 'filter'}
          </span>
        </button>
      </div>
    );
  };

  const renderShowLess = () => {
    if (!state.canShowLessValues) {
      return null;
    }

    return (
      <div>
        <button
          aria-label="Show less facet values"
          disabled={!controller || state.isLoading}
          onClick={controller?.showLessValues}
        >
          <span>- Show less</span>
        </button>
      </div>
    );
  };

  const renderShowMore = () => {
    if (!state.canShowMoreValues) {
      return null;
    }

    return (
      <div>
        <button
          aria-label="Show more facet values"
          disabled={!controller || state.isLoading}
          onClick={controller?.showMoreValues}
        >
          <span>+ Show more</span>
        </button>
      </div>
    );
  };

  return (
    <fieldset className="RegularFacet">
      <legend className="FacetDisplayName">
        <b>{state.displayName ?? state.facetId}</b>
      </legend>
      {renderClearFilters()}
      {renderFacetSearchControls()}
      {showFacetSearchResults
        ? renderFacetSearchResults()
        : renderFacetValues()}

      {renderShowLess()}
      {renderShowMore()}
    </fieldset>
  );
}
