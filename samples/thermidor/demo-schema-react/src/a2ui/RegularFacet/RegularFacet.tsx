import {useCallback} from 'react';
import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import {SearchIcon} from '../icons/index.js';
import {useOptimisticFacetSearch} from '../use-optimistic-facet-search.js';
import type {RegularFacetProps} from '@coveo/thermidor-schema';
import styles from './RegularFacet.module.css';

export function RegularFacetRenderer({props}: {props: RegularFacetProps}) {
  const stateSource = useStateSource();
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);

  const dispatchSearch = useCallback(
    (query: string) => controller.dispatch('search', {query}),
    [controller]
  );
  const search = useOptimisticFacetSearch(
    controller.state?.facetSearch.query ?? '',
    dispatchSearch
  );

  if (!controller.state) {
    return null;
  }

  const {displayName, values, hasActiveValues, canShowMoreValues, canShowLessValues, facetSearch} =
    controller.state;
  const showResults = facetSearch.query.length > 0 || facetSearch.results.length > 0;

  const handleToggleSelect = (value: string) => {
    controller.dispatch('toggleSelect', {value});
  };

  const handleClearSearch = () => {
    search.reset();
    controller.dispatch('clearSearch', {});
  };

  const handleShowMoreSearchResults = () => {
    controller.dispatch('showMoreSearchResults', {});
  };

  const handleShowMoreValues = () => {
    controller.dispatch('showMoreValues', {});
  };

  const handleShowLessValues = () => {
    controller.dispatch('showLessValues', {});
  };

  const handleClearAll = () => {
    controller.dispatch('clearAllActiveValues', {});
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
    <section className={styles.container} data-testid={props.componentId} aria-label={displayName}>
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
            data-testid={`facet-search-input-${props.componentId}`}
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
            {facetSearch.results.map((result) =>
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
              data-testid={`facet-show-less-${props.componentId}`}
              onClick={handleShowLessValues}
            >
              - Show less
            </button>
          )}
          {canShowMoreValues && (
            <button
              type="button"
              className={styles.showValuesButton}
              data-testid={`facet-show-more-${props.componentId}`}
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
