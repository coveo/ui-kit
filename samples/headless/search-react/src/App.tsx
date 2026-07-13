import {
  buildBreadcrumbManager,
  buildCategoryFacet,
  buildDateSortCriterion,
  buildFacet,
  buildInstantResults,
  buildPager,
  buildQuerySummary,
  buildRelevanceSortCriterion,
  buildResultList,
  buildSearchBox,
  buildSort,
  type SearchEngine,
  SortOrder,
} from '@coveo/headless';
import {useEffect, useMemo} from 'react';
import {Breadcrumbs} from './components/breadcrumbs';
import {CategoryFacet} from './components/category-facet';
import {Facet} from './components/facet';
import {Pager} from './components/pager';
import {QuerySummary} from './components/query-summary';
import {ResultList} from './components/result-list';
import {Sort, type SortOption} from './components/sort';
import {SearchBox} from './components/search-box';
import {buildEngine} from './engine';

interface AppProps {
  /** Inject an engine for testing or SSR; defaults to a BarcaKnowledge engine. */
  engine?: SearchEngine;
}

function App({engine: providedEngine}: AppProps) {
  const engine = useMemo(
    () => providedEngine ?? buildEngine(),
    [providedEngine]
  );

  const controllers = useMemo(() => {
    return {
      searchBox: buildSearchBox(engine, {
        options: {numberOfSuggestions: 8, id: 'search-box'},
      }),
      instantResults: buildInstantResults(engine, {
        options: {searchBoxId: 'search-box', maxResultsPerQuery: 5},
      }),
      querySummary: buildQuerySummary(engine),
      breadcrumbManager: buildBreadcrumbManager(engine),
      sort: buildSort(engine, {
        initialState: {criterion: buildRelevanceSortCriterion()},
      }),
      resultList: buildResultList(engine),
      pager: buildPager(engine, {options: {numberOfPages: 5}}),
      facets: {
        category: buildCategoryFacet(engine, {
          options: {field: 'ec_category', delimitingCharacter: '|'},
        }),
        articleType: buildFacet(engine, {options: {field: 'article_type'}}),
        robotSeries: buildFacet(engine, {options: {field: 'robot_series'}}),
        difficulty: buildFacet(engine, {options: {field: 'difficulty_level'}}),
        author: buildFacet(engine, {options: {field: 'author'}}),
      },
    };
  }, [engine]);

  const sortOptions = useMemo<SortOption[]>(
    () => [
      {label: 'Relevance', criterion: buildRelevanceSortCriterion()},
      {
        label: 'Newest',
        criterion: buildDateSortCriterion(SortOrder.Descending),
      },
      {label: 'Oldest', criterion: buildDateSortCriterion(SortOrder.Ascending)},
    ],
    []
  );

  useEffect(() => {
    engine.executeFirstSearch();
  }, [engine]);

  return (
    <div className="Layout">
      <header className="Header">
        <div className="HeaderBrand">
          <img className="HeaderLogo" src="/coveo-logo.svg" alt="Coveo" />
          <h1 className="AppTitle">Headless Search + React</h1>
        </div>
      </header>

      <main className="App">
        <SearchBox
          engine={engine}
          controller={controllers.searchBox}
          instantResults={controllers.instantResults}
        />

        <div className="results-toolbar">
          <QuerySummary controller={controllers.querySummary} />
          <Sort controller={controllers.sort} options={sortOptions} />
        </div>

        <Breadcrumbs controller={controllers.breadcrumbManager} />

        <div className="search-layout">
          <aside className="facets">
            <CategoryFacet
              controller={controllers.facets.category}
              title="Category"
            />
            <Facet
              controller={controllers.facets.articleType}
              title="Article type"
            />
            <Facet
              controller={controllers.facets.robotSeries}
              title="Robot series"
            />
            <Facet
              controller={controllers.facets.difficulty}
              title="Difficulty"
            />
            <Facet controller={controllers.facets.author} title="Author" />
          </aside>

          <section className="results">
            <ResultList engine={engine} controller={controllers.resultList} />
            <Pager controller={controllers.pager} />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
