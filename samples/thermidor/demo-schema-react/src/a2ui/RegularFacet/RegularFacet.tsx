import {useCallback} from 'react';
import type {RegularFacetProps, RegularFacetAction} from '@coveo/thermidor-schema/zod3';
import type {TypedRendererProps} from '../renderer-props.js';
import {SearchIcon} from '../icons/index.js';
import {useOptimisticFacetSearch} from '../use-optimistic-facet-search.js';
import styles from './RegularFacet.module.css';

export function RegularFacetRenderer({
  props,
  dispatch,
}: TypedRendererProps<RegularFacetProps, RegularFacetAction>) {
  const dispatchSearch = useCallback(
    (query: string) => dispatch?.({event: {name: 'search', context: {query}}}),
    [dispatch]
  );
  const search = useOptimisticFacetSearch(props.facetSearch?.query ?? '', dispatchSearch);

  const {displayName, hasActiveValues, canShowMoreValues, canShowLessValues} = props;
  const values = props.values ?? [];
  const facetSearch = props.facetSearch ?? {query: '', results: [], canShowMoreResults: false};
  const searchResults = facetSearch.results ?? [];
  const showResults = (facetSearch.query ?? '').length > 0 || searchResults.length > 0;

  const handleToggleSelect = (value: string) => {
    dispatch?.({event: {name: 'toggleSelect', context: {value}}});
  };

  const handleClearSearch = () => {
    search.reset();
    dispatch?.({event: {name: 'clearSearch', context: {}}});
  };

  const handleShowMoreSearchResults = () => {
    dispatch?.({event: {name: 'showMoreSearchResults', context: {}}});
  };

  const handleShowMoreValues = () => {
    dispatch?.({event: {name: 'showMoreValues', context: {}}});
  };

  const handleShowLessValues = () => {
    dispatch?.({event: {name: 'showLessValues', context: {}}});
  };

  const handleClearAll = () => {
    dispatch?.({event: {name: 'clearAllActiveValues', context: {}}});
  };

  const renderCheckbox = (
    value: string,
    numberOfResults: number,
    isSelected: boolean,
    testId: string
  ) => (
    <li key={value} className={styles.valueItem}>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          className={styles.checkbox}
          data-testid={testId}
          checked={isSelected}
          onChange={() => handleToggleSelect(value)}
        />
        <span className={styles.valueLabel}>{value}</span>
        <span className={styles.valueCount}>({numberOfResults})</span>
      </label>
    </li>
  );

  return (
    <section
      className={styles.container}
      data-testid={`facet-${props.field}`}
      aria-label={displayName}
    >
      <header className={styles.header}>
        <h3 className={styles.title}>{displayName}</h3>
        {hasActiveValues && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClearAll}
            aria-label={`Clear ${displayName} selections`}
          >
            Clear
          </button>
        )}
      </header>

      <div className={styles.search}>
        <div className={styles.searchField}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            data-testid={`facet-search-input-${props.field}`}
            value={search.query}
            placeholder="Search"
            aria-label={`Search ${displayName}`}
            onChange={(event) => search.onQueryChange(event.target.value)}
          />
          {showResults && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={handleClearSearch}
              aria-label={`Clear ${displayName} search`}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {showResults ? (
        <>
          <ul className={styles.valueList}>
            {searchResults.map((result) =>
              renderCheckbox(
                result.value,
                result.numberOfResults,
                false,
                `facet-search-result-${result.value}`
              )
            )}
          </ul>
          {facetSearch.canShowMoreResults && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleShowMoreSearchResults}
            >
              Show more
            </button>
          )}
        </>
      ) : (
        <>
          <ul className={styles.valueList}>
            {values.map((facetValue) =>
              renderCheckbox(
                facetValue.value,
                facetValue.numberOfResults,
                facetValue.state === 'selected',
                `facet-value-${facetValue.value}`
              )
            )}
          </ul>

          {canShowLessValues && (
            <button
              type="button"
              className={styles.showValuesButton}
              data-testid={`facet-show-less-${props.field}`}
              onClick={handleShowLessValues}
            >
              - Show less
            </button>
          )}
          {canShowMoreValues && (
            <button
              type="button"
              className={styles.showValuesButton}
              data-testid={`facet-show-more-${props.field}`}
              onClick={handleShowMoreValues}
            >
              + Show more
            </button>
          )}
        </>
      )}
    </section>
  );
}
