import {
  buildDateSortCriterion,
  buildFacet,
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
      searchBox: buildSearchBox(engine, {options: {numberOfSuggestions: 8}}),
      querySummary: buildQuerySummary(engine),
      sort: buildSort(engine, {
        initialState: {criterion: buildRelevanceSortCriterion()},
      }),
      resultList: buildResultList(engine),
      pager: buildPager(engine, {options: {numberOfPages: 5}}),
      facets: {
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
    <main className="App">
      <header className="app-header">
        <img className="app-header__logo" src="/coveo-logo.svg" alt="Coveo" />
        <div className="app-header__text">
          <h1 className="app-header__title">Headless React</h1>
          <p className="app-header__subtitle">BarcaKnowledge sample</p>
        </div>
      </header>

      <SearchBox controller={controllers.searchBox} />

      <div className="results-toolbar">
        <QuerySummary controller={controllers.querySummary} />
        <Sort controller={controllers.sort} options={sortOptions} />
      </div>

      <div className="search-layout">
        <aside className="facets">
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
          <ResultList controller={controllers.resultList} />
          <Pager controller={controllers.pager} />
        </section>
      </div>
    </main>
  );
}

export default App;
