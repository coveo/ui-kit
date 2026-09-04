import {useCallback} from 'react';
import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import {ChevronLeftIcon, SearchIcon} from '../icons/index.js';
import {useOptimisticFacetSearch} from '../use-optimistic-facet-search.js';
import type {CategoryFacetProps} from '@coveo/thermidor-schema';
import styles from './CategoryFacet.module.css';

export function CategoryFacetRenderer({props}: {props: CategoryFacetProps}) {
  const stateSource = useStateSource();
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);

  const dispatchSearch = useCallback(
    (query: string) => controller.dispatch('search', {query}),
    [controller]
  );
  const search = useOptimisticFacetSearch(
    controller.state?.facetSearch?.query ?? '',
    dispatchSearch
  );

  if (!controller.state) {
    return null;
  }

  const {displayName, values, facetSearch, canShowMoreValues, canShowLessValues} = controller.state;
  const {ancestry, selected, children} = values;

  const handleSelectPath = (path: string[]) => {
    controller.dispatch('selectPath', {path});
  };

  const handleClearSelectedPath = () => {
    controller.dispatch('clearSelectedPath', {});
  };

  const handleShowMoreValues = () => {
    controller.dispatch('showMoreValues', {});
  };

  const handleShowLessValues = () => {
    controller.dispatch('showLessValues', {});
  };

  const handleShowMoreSearchResults = () => {
    controller.dispatch('showMoreSearchResults', {});
  };

  const handleClearSearch = () => {
    search.reset();
    controller.dispatch('clearSearch', {});
  };

  const groupLabelId = `category-facet-label-${props.componentId}`;
  const searchQuery = facetSearch?.query ?? '';
  const searchResults = facetSearch?.results ?? [];
  const isSearchActive = searchQuery.length > 0 || searchResults.length > 0;
  const searchInputId = `category-facet-search-${props.componentId}`;

  const parents = selected ? ancestry.slice(0, -1) : [];

  const indentStyle = (level: number) => ({paddingLeft: `calc(${level} * var(--space-4))`});

  return (
    <section
      className={styles.container}
      data-testid={props.componentId}
      aria-labelledby={groupLabelId}
    >
      <div className={styles.header}>
        <h3 id={groupLabelId} className={styles.title}>
          {displayName}
        </h3>
      </div>

      <div className={styles.search} role="search">
        <SearchIcon className={styles.searchIcon} />
        <input
          id={searchInputId}
          type="text"
          className={styles.searchInput}
          data-testid={`facet-search-input-${props.componentId}`}
          value={search.query}
          onChange={(event) => search.onQueryChange(event.target.value)}
          placeholder="Search"
          aria-label={`Search ${displayName}`}
        />
        {search.query.length > 0 && (
          <button
            type="button"
            className={styles.searchClear}
            onClick={handleClearSearch}
            aria-label={`Clear ${displayName} search`}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      {isSearchActive ? (
        <>
          <ul className={styles.values}>
            {searchResults.map((result) => (
              <li key={result.path.join('/')}>
                <button
                  type="button"
                  className={styles.value}
                  data-testid={`facet-search-result-${result.value}`}
                  onClick={() => handleSelectPath(result.path)}
                >
                  <span className={styles.valueLabel}>{result.value}</span>
                  <span className={styles.count}>({result.numberOfResults})</span>
                </button>
              </li>
            ))}
          </ul>
          {facetSearch?.canShowMoreResults && (
            <button type="button" className={styles.showMore} onClick={handleShowMoreSearchResults}>
              Show more
            </button>
          )}
        </>
      ) : (
        <>
          <ul className={styles.values}>
            {selected && (
              <li>
                <button
                  type="button"
                  className={styles.backLink}
                  style={indentStyle(0)}
                  onClick={handleClearSelectedPath}
                >
                  <ChevronLeftIcon className={styles.chevron} />
                  <span className={styles.valueLabel}>All Categories</span>
                </button>
              </li>
            )}

            {parents.map((parent) => (
              <li key={parent.path.join('/')}>
                <button
                  type="button"
                  className={styles.backLink}
                  style={indentStyle(0)}
                  onClick={() => handleSelectPath(parent.path)}
                >
                  <ChevronLeftIcon className={styles.chevron} />
                  <span className={styles.valueLabel}>{parent.value}</span>
                </button>
              </li>
            ))}

            {selected && (
              <li>
                <div
                  className={styles.selected}
                  style={indentStyle(1)}
                  aria-current="true"
                  data-testid={`facet-category-selected-${props.componentId}`}
                >
                  <span className={styles.valueLabel}>{selected.value}</span>
                  <span className={styles.count}>({selected.numberOfResults})</span>
                </div>
              </li>
            )}

            {children.map((child) => (
              <li key={child.path.join('/')}>
                <button
                  type="button"
                  className={styles.value}
                  style={indentStyle(selected ? 2 : 0)}
                  onClick={() => handleSelectPath(child.path)}
                >
                  <span className={styles.valueLabel}>{child.value}</span>
                  <span className={styles.count}>({child.numberOfResults})</span>
                </button>
              </li>
            ))}
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
