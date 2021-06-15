import {buildTestUrl} from '../utils/setupComponent';

type SearchInterface = HTMLElement & {
  initialize: (opts: {
    accessToken: string;
    organizationId: string;
  }) => Promise<void>;
  executeFirstSearch: () => void;
};

export type TestFeature = (e: TestFixture) => void | Promise<void>;

export type TagProps = Record<string, string | number>;

export class TestFixture {
  private aliases: TestFeature[] = [];
  private execFirstSearch = true;
  private searchInterface = document.createElement(
    'atomic-search-interface'
  ) as SearchInterface;
  private hash = '';

  public with(feat: TestFeature) {
    feat(this);
    return this;
  }

  public withoutFirstAutomaticSearch() {
    this.execFirstSearch = false;
    return this;
  }

  public withHash(hash: string) {
    this.hash = hash;
    return this;
  }

  public withElement(e: HTMLElement) {
    this.searchInterface.append(e);
    return this;
  }

  public withAlias(aliasFn: TestFeature) {
    this.aliases.push(aliasFn);
    return this;
  }

  public init() {
    cy.visit(buildTestUrl(this.hash)).injectAxe();
    this.intercept();

    cy.document().then((doc) => {
      doc.body.appendChild(this.searchInterface);
      cy.get('atomic-search-interface').as(this.elementAliases.SearchInterface);
    });

    cy.get(`@${this.elementAliases.SearchInterface}`).then(($si) => {
      const searchInterfaceComponent = $si.get()[0] as SearchInterface;

      searchInterfaceComponent
        .initialize({
          accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
          organizationId: 'searchuisamples',
        })
        .then(() => {
          if (this.execFirstSearch) {
            searchInterfaceComponent.executeFirstSearch();
          }
        });
    });

    if (this.execFirstSearch) {
      cy.wait(TestFixture.interceptAliases.Search);
      cy.wait(TestFixture.interceptAliases.UA);
    }

    this.aliases.forEach((alias) => alias(this));

    return this;
  }

  public static get interceptAliases() {
    return {
      UA: '@coveoAnalytics',
      QuerySuggestions: '@coveoQuerySuggest',
      Search: '@coveoSearch',
    };
  }

  public get elementAliases() {
    return {
      SearchInterface: 'searchInterface',
    };
  }

  private intercept() {
    cy.intercept({
      method: 'POST',
      path: '**/rest/ua/v15/analytics/*',
    }).as(TestFixture.interceptAliases.UA.substring(1));

    cy.intercept({
      method: 'POST',
      path: '**/rest/search/v2/querySuggest?*',
    }).as(TestFixture.interceptAliases.QuerySuggestions.substring(1));

    cy.intercept({
      method: 'POST',
      url: '**/rest/search/v2?*',
    }).as(TestFixture.interceptAliases.Search.substring(1));
  }
}

export const addTag = (env: TestFixture, tag: string, props: TagProps) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    e.setAttribute(k, v.toString());
  }
  env.withElement(e);
};
