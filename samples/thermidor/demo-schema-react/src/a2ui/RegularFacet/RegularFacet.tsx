import {useCallback} from 'react';
import type {RegularFacetProps, RegularFacetAction} from '@coveo/thermidor-schema';
import type {TypedRendererProps} from '../renderer-props.js';
import {SearchIcon} from '../icons/index.js';
import {useOptimisticFacetSearch} from '../use-optimistic-facet-search.js';
import styles from './RegularFacet.module.css';

export function RegularFacetRenderer({
  props,
  children,
  dispatch,
}: TypedRendererProps<RegularFacetProps, RegularFacetAction>) {
  // `children` mounts a child by id; for a TEMPLATE ChildList child it also takes the resolved
  // `basePath` so the mounted instance binds under that data-model node. `createCatalog` wires
  // `children` to the binder's `buildChild(id, basePath?)` at runtime, but its public `RendererProps`
  // type declares only `(id)`; we widen it here to the real runtime signature.
  const mountChild = children as (id: string, basePath?: string) => React.ReactNode;
  const dispatchSearch = useCallback(
    (query: string) => dispatch?.({event: {name: 'search', context: {query}}}),
    [dispatch]
  );
  const search = useOptimisticFacetSearch(props.facetSearch?.query ?? '', dispatchSearch);

  const {displayName, hasActiveValues, canShowMoreValues, canShowLessValues} = props;
  // `values` is a ChildList TEMPLATE: the binder resolves it to an array of mounted-child
  // descriptors `{id, basePath}` (STRUCTURAL), one per data-model entry under
  // `/state/<facet>/values`. Each child (RegularFacetValue) is mounted at its basePath so its
  // optimistic `setSelectionState` writes `<basePath>/selectionState`, touching only that value.
  // The generated composition type widens this to `string[]`; the runtime shape is the descriptor
  // list, so we read it through the ChildList descriptor view (the single type/runtime seam here).
  const valueChildren = (props.values ?? []) as unknown as ReadonlyArray<{
    id: string;
    basePath: string;
  }>;
  const facetSearch = props.facetSearch ?? {query: '', results: [], canShowMoreResults: false};
  const searchResults = facetSearch.results ?? [];
  const showResults = (facetSearch.query ?? '').length > 0 || searchResults.length > 0;

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

  // Search results are transient (not part of the facet's value list), so selecting one dispatches
  // toggleSelect directly — the optimistic setSelectionState path applies only to the ChildList
  // value children (RegularFacetValue), not to search-result rows.
  const handleToggleSelect = (value: string) => {
    dispatch?.({event: {name: 'toggleSelect', context: {value}}});
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
            {valueChildren.map((child) => (
              <div key={child.basePath}>{mountChild(child.id, child.basePath)}</div>
            ))}
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
