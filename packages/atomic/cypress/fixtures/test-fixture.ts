import {SearchBoxSelectors} from '../integration/search-box-selectors';

type SearchInterface = HTMLElement & {
  initialize: (opts: {
    accessToken: string;
    organizationId: string;
  }) => Promise<void>;
  executeFirstSearch: () => void;
};

export type FeatureEnvironment = {
  searchInterface: SearchInterface;
};

export type TestFeature = (e: FeatureEnvironment) => void | Promise<void>;

export class TestFixture {
  private searchInterface: SearchInterface;
  private urlParams: {key: string; value: string}[] = [];
  private testURL = 'http://localhost:3333/pages/test.html';
  private execFirstSearch = true;

  constructor() {
    cy.visit(this.testURL);
    this.searchInterface = document.createElement(
      'atomic-search-interface'
    ) as SearchInterface;

    document.body.appendChild(this.searchInterface);
  }

  public with(feat: TestFeature) {
    feat(this.testEnvironment);
    return this;
  }

  public withURLParam(key: string, value: string) {
    this.urlParams.push({key, value});
    return this;
  }

  public withoutFirstAutomaticSearch() {
    this.execFirstSearch = false;
    return this;
  }

  public async init() {
    document.location.hash = `#${this.urlParams.reduce(
      (hash, param, i) =>
        `${hash}${i === 0 ? '' : '&'}${param.key}=${encodeURIComponent(
          param.value
        )}`,
      ''
    )}`;

    await customElements.whenDefined('atomic-search-interface');
    await this.searchInterface.initialize({
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
      organizationId: 'searchuisamples',
    });

    if (this.execFirstSearch) {
      this.searchInterface.executeFirstSearch();
    }

    return this;
  }

  private get testEnvironment(): FeatureEnvironment {
    return {
      searchInterface: this.searchInterface,
    };
  }
}

const addElement = (env: FeatureEnvironment, e: HTMLElement) => {
  env.searchInterface.appendChild(e);
};

const addTag = (env: FeatureEnvironment, tag: string) => {
  addElement(env, document.createElement(tag));
};

export const searchBox = () => (env: FeatureEnvironment) =>
  addTag(env, 'atomic-search-box');

export const searchBoxAlias = (alias = 'searchBoxFirstDiv') => (
  env: FeatureEnvironment
) => {
  cy.get(SearchBoxSelectors.component).shadow().find('div').first().as(alias);
};
