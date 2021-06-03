import {buildTestUrl} from '../utils/setupComponent';

type SearchInterface = HTMLElement & {
  initialize: (opts: {
    accessToken: string;
    organizationId: string;
  }) => Promise<void>;
  executeFirstSearch: () => void;
};

export type TestFeature = (e: TestFixture) => void | Promise<void>;

export type TagProps = Record<string, string>;

export class TestFixture {
  private aliases: TestFeature[] = [];
  private testURL = buildTestUrl();
  private execFirstSearch = true;

  constructor() {
    cy.visit(this.testURL).injectAxe();
    this.intercept();

    cy.document().then((doc) => {
      const searchInterface = doc.createElement(
        'atomic-search-interface'
      ) as SearchInterface;
      doc.body.appendChild(searchInterface);
      cy.get('atomic-search-interface').as(this.elementAliases.SearchInterface);
    });
  }

  public with(feat: TestFeature) {
    feat(this);
    return this;
  }

  public withoutFirstAutomaticSearch() {
    this.execFirstSearch = false;
    return this;
  }

  public withAlias(aliasFn: TestFeature) {
    this.aliases.push(aliasFn);
    return this;
  }

  public init() {
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
      cy.wait(`@${this.interceptAliases.Search}`);
    }

    this.aliases.forEach((alias) => alias(this));

    return this;
  }

  public get interceptAliases() {
    return {
      UA: 'coveoAnalytics',
      QuerySuggestions: 'coveoQuerySuggest',
      Search: 'coveoSearch',
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
    }).as(this.interceptAliases.UA);

    cy.intercept({
      method: 'POST',
      path: '**/rest/search/v2/querySuggest?*',
    }).as(this.interceptAliases.QuerySuggestions);

    cy.intercept({
      method: 'POST',
      url: '**/rest/search/v2?*',
    }).as(this.interceptAliases.Search);
  }
}

export const addElement = (env: TestFixture, e: HTMLElement) => {
  cy.get(`@${env.elementAliases.SearchInterface}`).then(($si) => {
    $si.append(e);
  });
};

export const addTag = (env: TestFixture, tag: string, props: TagProps) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    e.setAttribute(k, v);
  }
  addElement(env, e);
};
