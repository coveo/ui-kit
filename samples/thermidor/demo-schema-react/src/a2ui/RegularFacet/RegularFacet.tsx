import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {type RegularFacetAction, RegularFacetPropsSchema} from '@coveo/thermidor-schema/zod3';
import {FacetSearchMoreMatches} from '../FacetSearchMoreMatches/FacetSearchMoreMatches.js';
import {SearchIcon} from '../icons/index.js';
import {useOptimisticFacetSearch} from '../use-optimistic-facet-search.js';
import {useOptimisticRegularFacet} from './use-optimistic-regular-facet.js';
import styles from './RegularFacet.module.css';

/**
 * A2-UI component for the `regular-facet` (multi-select). The generic binder resolves the facet
 * state from `RegularFacetPropsSchema`. The two gestures that carry an optimistic value live in
 * `useOptimisticRegularFacet`, the search input in `useOptimisticFacetSearch`; the show-more pair
 * has no client-side projection and is dispatched from here.
 *
 * The facet-search gestures (search/clearSearch/showMoreSearchResults) and the show-more/less
 * value pair declare NOTHING: the producer answers them by rebuilding the facet value list alone,
 * not the result set the grid and summary read, so they dispatch plainly and mark no stale region.
 */
export const RegularFacet = createReactComponent(
  {
    name: 'RegularFacet',
    schema: RegularFacetPropsSchema,
  },
  ({props, context}) => {
    const dispatch = (action: RegularFacetAction) => {
      context.dispatchAction(action);
    };
    const dispatchSearch = (query: string) => {
      dispatch({event: {name: 'search', context: {query}}});
    };
    const search = useOptimisticFacetSearch(props.facetSearch?.query ?? '', dispatchSearch);
    const handleClearSearch = () => {
      search.reset();
      dispatch({event: {name: 'clearSearch', context: {}}});
    };
    const optimisticFacet = useOptimisticRegularFacet(props, dispatch);

    const {displayName, hasActiveValues, canShowMoreValues, canShowLessValues} = props;
    const facetSearch = props.facetSearch ?? {query: '', results: [], canShowMoreResults: false};
    const searchResults = facetSearch.results ?? [];
    const showResults = (facetSearch.query ?? '').length > 0 || searchResults.length > 0;

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
            onChange={() => optimisticFacet.toggleSelect(value)}
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
              onClick={optimisticFacet.clearAll}
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
              <FacetSearchMoreMatches
                query={facetSearch.query ?? ''}
                testId={`facet-search-show-more-${props.field}`}
                onShowMore={() => dispatch({event: {name: 'showMoreSearchResults', context: {}}})}
              />
            )}
          </>
        ) : (
          <>
            <ul className={styles.valueList}>
              {optimisticFacet.values.map((facetValue) =>
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
                onClick={() => dispatch({event: {name: 'showLessValues', context: {}}})}
              >
                - Show less
              </button>
            )}
            {canShowMoreValues && (
              <button
                type="button"
                className={styles.showValuesButton}
                data-testid={`facet-show-more-${props.field}`}
                onClick={() => dispatch({event: {name: 'showMoreValues', context: {}}})}
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
