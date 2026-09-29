import {useCallback} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {RegularFacetAction, RegularFacetProps} from '@coveo/thermidor-schema';
import {RegularFacetPropsSchema} from '@coveo/thermidor-schema';
import {toInferableBinderSchema} from '../catalog-props-migration.js';
import {SearchIcon} from '../icons/index.js';
import {useOptimisticFacetSearch} from '../use-optimistic-facet-search.js';
import styles from './RegularFacet.module.css';

/**
 * A2-UI component for the `regular-facet` (multi-select). The generic binder resolves the facet
 * state from `RegularFacetPropsSchema`; every user gesture (toggle, search, clear, show
 * more/less) dispatches its action through `context.dispatchAction`. The optimistic
 * facet-search hook mirrors the query locally while the backend catches up.
 */
export const RegularFacet = createReactComponent(
  {
    name: 'RegularFacet',
    schema: toInferableBinderSchema<RegularFacetProps>(RegularFacetPropsSchema),
  },
  ({props, context}) => {
    const dispatchSearch = useCallback(
      (query: string) => {
        const searchAction: RegularFacetAction = {event: {name: 'search', context: {query}}};
        context.dispatchAction(searchAction);
      },
      [context]
    );
    const search = useOptimisticFacetSearch(props.facetSearch?.query ?? '', dispatchSearch);

    const {displayName, hasActiveValues, canShowMoreValues, canShowLessValues} = props;
    const values = props.values ?? [];
    const facetSearch = props.facetSearch ?? {query: '', results: [], canShowMoreResults: false};
    const searchResults = facetSearch.results ?? [];
    const showResults = (facetSearch.query ?? '').length > 0 || searchResults.length > 0;

    const handleToggleSelect = (value: string) => {
      const toggleSelectAction: RegularFacetAction = {
        event: {name: 'toggleSelect', context: {value}},
      };
      context.dispatchAction(toggleSelectAction);
    };

    const handleClearSearch = () => {
      search.reset();
      const clearSearchAction: RegularFacetAction = {event: {name: 'clearSearch', context: {}}};
      context.dispatchAction(clearSearchAction);
    };

    const handleShowMoreSearchResults = () => {
      const showMoreSearchResultsAction: RegularFacetAction = {
        event: {name: 'showMoreSearchResults', context: {}},
      };
      context.dispatchAction(showMoreSearchResultsAction);
    };

    const handleShowMoreValues = () => {
      const showMoreValuesAction: RegularFacetAction = {
        event: {name: 'showMoreValues', context: {}},
      };
      context.dispatchAction(showMoreValuesAction);
    };

    const handleShowLessValues = () => {
      const showLessValuesAction: RegularFacetAction = {
        event: {name: 'showLessValues', context: {}},
      };
      context.dispatchAction(showLessValuesAction);
    };

    const handleClearAll = () => {
      const clearAllAction: RegularFacetAction = {
        event: {name: 'clearAllActiveValues', context: {}},
      };
      context.dispatchAction(clearAllAction);
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
);
