import {
  buildCategoryFacet,
  buildDateFacet,
  buildDateRange,
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
import {CategoryFacet} from './components/category-facet';
import {DateFacet} from './components/date-facet';
import {Facet} from './components/facet';
import {Pager} from './components/pager';
import {QuerySummary} from './components/query-summary';
import {ResultList} from './components/result-list';
import {Sort, type SortOption} from './components/sort';
import {SearchBox} from './components/search-box';
import {buildEngine} from './engine';

const dateRanges = [
  buildDateRange({
    start: {period: 'past', unit: 'week', amount: 1},
    end: {period: 'now'},
  }),
  buildDateRange({
    start: {period: 'past', unit: 'month', amount: 1},
    end: {period: 'now'},
  }),
  buildDateRange({
    start: {period: 'past', unit: 'quarter', amount: 1},
    end: {period: 'now'},
  }),
  buildDateRange({
    start: {period: 'past', unit: 'year', amount: 1},
    end: {period: 'now'},
  }),
];

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
        category: buildCategoryFacet(engine, {
          options: {field: 'ec_category', delimitingCharacter: '|'},
        }),
        articleType: buildFacet(engine, {options: {field: 'article_type'}}),
        robotSeries: buildFacet(engine, {options: {field: 'robot_series'}}),
        difficulty: buildFacet(engine, {options: {field: 'difficulty_level'}}),
        date: buildDateFacet(engine, {
          options: {
            field: 'date',
            currentValues: dateRanges,
            generateAutomaticRanges: false,
          },
        }),
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
          <DateFacet controller={controllers.facets.date} title="Date" />
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
