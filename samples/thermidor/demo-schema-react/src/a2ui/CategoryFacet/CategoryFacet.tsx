import {useCallback, useId} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {CategoryFacetAction} from '@coveo/thermidor-schema';
import {CategoryFacetPropsSchema} from '@coveo/thermidor-schema/zod3';
import {ChevronLeftIcon, SearchIcon} from '../icons/index.js';
import {useOptimisticFacetSearch} from '../use-optimistic-facet-search.js';
import styles from './CategoryFacet.module.css';

const ALL_CATEGORIES_LABEL = 'All Categories';
const PATH_SEPARATOR = '/';
const PATH_ELLIPSIS = '...';
const PATH_MAX_LENGTH = 3;

/**
 * Shortens a path to at most `PATH_MAX_LENGTH` segments by keeping the first segment and the last
 * ones, with an ellipsis in between (mirrors Atomic's `hierarchicalPath` directive).
 */
const ellipsePath = (path: string[]): string[] =>
  path.length <= PATH_MAX_LENGTH
    ? path
    : [path[0], PATH_ELLIPSIS, ...path.slice(-(PATH_MAX_LENGTH - 1))];

/**
 * A2-UI component for the `category-facet` (hierarchical). The generic binder resolves the facet
 * state from `CategoryFacetPropsSchema`; path selection / clear / show more / search dispatch
 * their actions through `context.dispatchAction`.
 */
export const CategoryFacet = createReactComponent(
  {
    name: 'CategoryFacet',
    schema: CategoryFacetPropsSchema,
  },
  ({props, context}) => {
    const labelId = useId();
    const searchInputId = useId();

    const dispatchSearch = useCallback(
      (query: string) => {
        const searchAction: CategoryFacetAction = {event: {name: 'search', context: {query}}};
        context.dispatchAction(searchAction);
      },
      [context]
    );
    const search = useOptimisticFacetSearch(props.facetSearch?.query ?? '', dispatchSearch);

    const {displayName, values, facetSearch, canShowMoreValues, canShowLessValues} = props;
    const {ancestry = [], selected, children = []} = values ?? {};

    const handleSelectPath = (path: string[]) => {
      const selectPathAction: CategoryFacetAction = {event: {name: 'selectPath', context: {path}}};
      context.dispatchAction(selectPathAction);
    };

    const handleClearSelectedPath = () => {
      const clearSelectedPathAction: CategoryFacetAction = {
        event: {name: 'clearSelectedPath', context: {}},
      };
      context.dispatchAction(clearSelectedPathAction);
    };

    const handleShowMoreValues = () => {
      const showMoreValuesAction: CategoryFacetAction = {
        event: {name: 'showMoreValues', context: {}},
      };
      context.dispatchAction(showMoreValuesAction);
    };

    const handleShowLessValues = () => {
      const showLessValuesAction: CategoryFacetAction = {
        event: {name: 'showLessValues', context: {}},
      };
      context.dispatchAction(showLessValuesAction);
    };

    const handleShowMoreSearchResults = () => {
      const showMoreSearchResultsAction: CategoryFacetAction = {
        event: {name: 'showMoreSearchResults', context: {}},
      };
      context.dispatchAction(showMoreSearchResultsAction);
    };

    const handleClearSearch = () => {
      search.reset();
      const clearSearchAction: CategoryFacetAction = {event: {name: 'clearSearch', context: {}}};
      context.dispatchAction(clearSearchAction);
    };

    const searchQuery = facetSearch?.query ?? '';
    const searchResults = facetSearch?.results ?? [];
    const isSearchActive = searchQuery.length > 0 || searchResults.length > 0;

    const parents = selected ? ancestry.slice(0, -1) : [];

    const indentStyle = (level: number) => ({paddingLeft: `calc(${level} * var(--space-4))`});

    return (
      <section
        className={styles.container}
        data-testid={`facet-${props.field}`}
        aria-labelledby={labelId}
      >
        <div className={styles.header}>
          <h3 id={labelId} className={styles.title}>
            {displayName}
          </h3>
        </div>

        <div className={styles.search} role="search">
          <SearchIcon className={styles.searchIcon} />
          <input
            id={searchInputId}
            type="text"
            className={styles.searchInput}
            data-testid={`facet-search-input-${props.field}`}
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
              {searchResults.map((result) => {
                const parentPath = result.path.slice(0, -1);
                const displayedPath = parentPath.length
                  ? ellipsePath(parentPath)
                  : [ALL_CATEGORIES_LABEL];
                const parentLabel = parentPath.length
                  ? parentPath.join(', ')
                  : ALL_CATEGORIES_LABEL;
                return (
                  <li key={result.path.join('/')}>
                    <button
                      type="button"
                      className={`${styles.value} ${styles.searchResult}`}
                      data-testid={`facet-search-result-${result.path.join('/')}`}
                      aria-label={`${result.value} (${result.numberOfResults}) under ${parentLabel}`}
                      onClick={() => handleSelectPath(result.path)}
                    >
                      <span className={styles.searchResultValue}>
                        <span className={styles.valueLabel}>{result.value}</span>
                        <span className={styles.count}>({result.numberOfResults})</span>
                      </span>
                      <span
                        className={styles.searchResultPath}
                        data-testid={`facet-search-result-path-${result.path.join('/')}`}
                      >
                        <span>in</span>
                        {displayedPath.map((segment, index) => (
                          <span
                            key={`${index}-${segment}`}
                            className={styles.searchResultPathSegment}
                          >
                            {index > 0 && <span aria-hidden="true">{PATH_SEPARATOR}</span>}
                            <span className={styles.valueLabel}>{segment}</span>
                          </span>
                        ))}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {facetSearch?.canShowMoreResults && (
              <button
                type="button"
                className={styles.showMore}
                onClick={handleShowMoreSearchResults}
              >
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
                    <span className={styles.valueLabel}>{ALL_CATEGORIES_LABEL}</span>
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
                    data-testid={`facet-category-selected-${props.field}`}
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
