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
  SortOrder,
} from '@coveo/headless';
import {css, html, LitElement} from 'lit';
import {engine} from '../engine.js';
import {baseStyles, layoutStyles} from '../shared-styles.js';
import './breadcrumbs.js';
import './category-facet.js';
import './facet.js';
import './pager.js';
import './query-summary.js';
import './result-list.js';
import './search-box.js';
import './sort-dropdown.js';

/**
 * Application shell: a header bar, a centered search box, a results toolbar
 * (summary + sort), removable breadcrumbs, and a facets/results layout. It owns
 * all the Headless controllers and hands each to a component that subscribes to
 * it; its only runtime job is to trigger the first search.
 */
export class SearchApp extends LitElement {
  static styles = [
    baseStyles,
    layoutStyles,
    css`
      :host {
        min-height: 100vh;
      }

      .Header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1rem 1.5rem;
        padding: 0.9rem 1.5rem;
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
      }

      .HeaderBrand {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .HeaderLogo {
        height: 30px;
      }

      .AppTitle {
        margin: 0;
        font-size: 1.35rem;
      }

      .App {
        max-width: 1240px;
        margin: 0 auto;
        padding: 1.5rem;
      }

      .results-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1.25rem;
      }
    `,
  ];

  constructor() {
    super();
    this.searchBox = buildSearchBox(engine, {
      options: {numberOfSuggestions: 8, id: 'search-box'},
    });
    this.instantResults = buildInstantResults(engine, {
      options: {searchBoxId: 'search-box', maxResultsPerQuery: 5},
    });
    this.querySummary = buildQuerySummary(engine);
    this.breadcrumbManager = buildBreadcrumbManager(engine);
    this.sort = buildSort(engine, {
      initialState: {criterion: buildRelevanceSortCriterion()},
    });
    this.sortOptions = [
      {label: 'Relevance', criterion: buildRelevanceSortCriterion()},
      {
        label: 'Newest',
        criterion: buildDateSortCriterion(SortOrder.Descending),
      },
      {
        label: 'Oldest',
        criterion: buildDateSortCriterion(SortOrder.Ascending),
      },
    ];
    this.resultList = buildResultList(engine);
    this.pager = buildPager(engine, {options: {numberOfPages: 5}});
    this.categoryFacet = buildCategoryFacet(engine, {
      options: {field: 'ec_category', delimitingCharacter: '|'},
    });
    this.articleType = buildFacet(engine, {options: {field: 'article_type'}});
    this.robotSeries = buildFacet(engine, {options: {field: 'robot_series'}});
    this.difficulty = buildFacet(engine, {
      options: {field: 'difficulty_level'},
    });
    this.author = buildFacet(engine, {options: {field: 'author'}});
  }

  // Trigger the first search once the child components have mounted and
  // subscribed, so nothing is missed if the response is fast.
  firstUpdated() {
    engine.executeFirstSearch();
  }

  render() {
    return html`
      <header class="Header">
        <div class="HeaderBrand">
          <img class="HeaderLogo" src="/coveo-logo.svg" alt="Coveo" />
          <h1 class="AppTitle">Headless Search + Vite</h1>
        </div>
      </header>

      <main class="App">
        <search-box
          .controller=${this.searchBox}
          .instantResults=${this.instantResults}
        ></search-box>

        <div class="results-toolbar">
          <search-summary .controller=${this.querySummary}></search-summary>
          <search-sort .controller=${this.sort} .options=${this.sortOptions}></search-sort>
        </div>

        <search-breadcrumbs .controller=${this.breadcrumbManager}></search-breadcrumbs>

        <div class="search-layout">
          <aside class="facets">
            <search-category-facet
              .controller=${this.categoryFacet}
              .heading=${'Category'}
            ></search-category-facet>
            <search-facet .controller=${this.articleType} .heading=${'Article type'}></search-facet>
            <search-facet .controller=${this.robotSeries} .heading=${'Robot series'}></search-facet>
            <search-facet .controller=${this.difficulty} .heading=${'Difficulty'}></search-facet>
            <search-facet .controller=${this.author} .heading=${'Author'}></search-facet>
          </aside>

          <section class="results">
            <search-result-list .controller=${this.resultList}></search-result-list>
            <search-pager .controller=${this.pager}></search-pager>
          </section>
        </div>
      </main>
    `;
  }
}

customElements.define('search-app', SearchApp);
