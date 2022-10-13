import {Result} from '@coveo/headless';
import {i18n} from 'i18next';
import {SearchResponseSuccess} from '../../../headless/dist/definitions/api/search/search/search-response';
import {AnalyticsTracker, AnyEventRequest} from '../utils/analyticsUtils';
import {buildTestUrl} from '../utils/setupComponent';
import {
  ConsoleAliases,
  getUABody,
  getUACustomData,
  RouteAlias,
  setupIntercept,
  stubConsole,
  UrlParts,
} from './fixture-common';

interface ResultWithFolding extends Result {
  parentResult: ResultWithFolding | null;
  childResults: ResultWithFolding[];
}

export type SearchFoldedResponseSuccess = Omit<
  SearchResponseSuccess,
  'results'
> & {
  results: ResultWithFolding[];
};

export type SearchResponseModifierPredicate = (
  response: SearchResponseSuccess
) => SearchResponseSuccess | void;

export interface SearchResponseModifier {
  predicate: SearchResponseModifierPredicate;
  times: number;
}

export type SearchInterface = HTMLElement & {
  initialize: (opts: {
    accessToken: string;
    organizationId: string;
  }) => Promise<void>;
  executeFirstSearch: () => void;
  i18n: i18n;
};

export type TestFeature<T> = (e: T) => void | Promise<void>;

export type TagProps = Record<string, string | number>;

export class TestFixture {
  private aliases: TestFeature<TestFixture>[] = [];
  private execFirstSearch = true;
  private firstIntercept = true;
  private initializeInterface = true;
  private searchInterface = document.createElement(
    'atomic-search-interface'
  ) as SearchInterface;
  private hash = '';
  private style = document.createElement('style');
  private language?: string;
  private disabledAnalytics = false;
  private fieldCaptions: {field: string; captions: Record<string, string>}[] =
    [];
  private translations: Record<string, string> = {};
  private responseModifiers: SearchResponseModifier[] = [];
  private returnError = false;
  private reflectStateInUrl = true;
  private redirected = false;

  public static interceptAliases = RouteAlias;
  public static urlParts = UrlParts;
  public static consoleAliases = ConsoleAliases;
  public static getUABody = getUABody;
  public static getUACustomData = getUACustomData;

  public with(feat: TestFeature<TestFixture>) {
    feat(this);
    return this;
  }

  public withoutInterfaceInitialization() {
    this.withoutFirstAutomaticSearch();
    this.initializeInterface = false;
    return this;
  }

  public withoutFirstAutomaticSearch() {
    this.execFirstSearch = false;
    return this;
  }

  public withoutFirstIntercept() {
    this.firstIntercept = false;
    return this;
  }

  public withoutStateInUrl() {
    this.reflectStateInUrl = false;
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

  public withAlias(aliasFn: TestFeature<TestFixture>) {
    this.aliases.push(aliasFn);
    return this;
  }

  public withStyle(e: string) {
    this.style.append(e);
    return this;
  }

  public withLanguage(lang: string) {
    this.language = lang;
    return this;
  }

  public withoutAnalytics() {
    this.disabledAnalytics = true;
    return this;
  }

  public withRedirection() {
    this.redirected = true;
    return this;
  }

  public withFieldCaptions(field: string, captions: Record<string, string>) {
    this.fieldCaptions.push({field, captions});
    return this;
  }

  public withTranslation(translations: Record<string, string>) {
    this.translations = {
      ...this.translations,
      ...translations,
    };
    return this;
  }

  public withCustomResponse(
    predicate: SearchResponseModifierPredicate,
    times = 9999
  ) {
    this.responseModifiers.push({predicate, times});
    return this;
  }

  public withNoResults() {
    return this.withCustomResponse((r) => {
      r.results = [];
      r.totalCountFiltered = 0;
      return r;
    });
  }

  public withError() {
    this.returnError = true;
    return this;
  }

  public withViewport(viewport: Cypress.ViewportPreset) {
    cy.viewport(viewport);
    return this;
  }

  public withMobileViewport() {
    return this.withViewport('iphone-x');
  }

  public init() {
    !this.redirected && cy.visit(buildTestUrl(this.hash));
    cy.injectAxe();
    setupIntercept();
    stubConsole();

    cy.document().then((doc) => {
      doc.head.appendChild(this.style);
      doc.body.appendChild(this.searchInterface);
      cy.get('atomic-search-interface').as(this.elementAliases.SearchInterface);
    });

    cy.get(`@${this.elementAliases.SearchInterface}`).then(($si) => {
      const searchInterfaceComponent = $si.get()[0] as SearchInterface;
      searchInterfaceComponent.setAttribute(
        'reflect-state-in-url',
        `${this.reflectStateInUrl}`
      );

      if (this.language) {
        searchInterfaceComponent.setAttribute('language', this.language);
      }

      if (this.disabledAnalytics) {
        searchInterfaceComponent.setAttribute('analytics', 'false');
      } else {
        AnalyticsTracker.reset();
        cy.intercept(
          {
            method: 'POST',
            url: '**/rest/ua/v15/analytics/*',
          },
          (request) => AnalyticsTracker.push(request.body as AnyEventRequest)
        );
      }

      if (this.responseModifiers.length) {
        interceptSearchResponse((response) => {
          let combinedResponse = response;
          this.responseModifiers.forEach((modifier) => {
            if (modifier.times <= 0) {
              return;
            }
            combinedResponse =
              modifier.predicate(combinedResponse) || combinedResponse;
            modifier.times--;
          });
          return combinedResponse;
        });
      }

      if (this.returnError) {
        cy.intercept(
          {
            method: 'POST',
            url: '**/rest/search/v2?*',
          },
          (request) =>
            request.reply((response) =>
              response.send(418, {
                exception: {code: 'Something very weird just happened'},
              })
            )
        ).as(TestFixture.interceptAliases.Search.substring(1));
      }

      if (!this.initializeInterface) {
        return;
      }

      searchInterfaceComponent
        .initialize({
          accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
          organizationId: 'searchuisamples',
        })
        .then(() => {
          this.fieldCaptions.forEach(({field, captions}) =>
            searchInterfaceComponent.i18n.addResourceBundle(
              'en',
              `caption-${field}`,
              captions
            )
          );
          searchInterfaceComponent.i18n.addResourceBundle(
            'en',
            'translation',
            this.translations
          );
          if (this.execFirstSearch) {
            searchInterfaceComponent.executeFirstSearch();
          }
        });
    });

    if (this.execFirstSearch && this.firstIntercept) {
      cy.wait(TestFixture.interceptAliases.Search);
      if (!this.disabledAnalytics) {
        cy.wait(TestFixture.interceptAliases.UA);
      }
    }

    this.aliases.forEach((alias) => alias(this));

    return this;
  }

  public get elementAliases() {
    return {
      SearchInterface: 'searchInterface',
    };
  }
}

export const addTag = (env: TestFixture, tag: string, props: TagProps) => {
  const e = generateComponentHTML(tag, props);
  env.withElement(e);
};

export const generateComponentHTML = (tag: string, props: TagProps = {}) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    e.setAttribute(k, v.toString());
  }
  return e;
};

export function interceptSearchResponse(
  modifier: SearchResponseModifierPredicate,
  times = 9999
) {
  cy.intercept(
    {
      method: 'POST',
      url: '**/rest/search/v2?*',
      times,
    },
    (request) => {
      request.reply((response) => {
        let newResponse = response.body;
        const returnedResponse = modifier(newResponse);
        if (returnedResponse) {
          newResponse = returnedResponse;
        }
        response.send(200, newResponse);
      });
    }
  ).as(TestFixture.interceptAliases.Search.substring(1));
}
