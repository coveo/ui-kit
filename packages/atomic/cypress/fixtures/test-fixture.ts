import {Result} from '@coveo/headless';
import {i18n} from 'i18next';
import {SearchResponseSuccess} from '../../../headless/dist/definitions/api/search/search/search-response';
import {i18nCompatibilityVersion} from '../../src/components';
import {buildTestUrl} from '../utils/setupComponent';
import {
  ConsoleAliases,
  getUABody,
  getUACustomData,
  interceptSearchAndReturnError,
  modifySearchResponses,
  RouteAlias,
  sampleConfig,
  SearchResponseModifier,
  SearchResponseModifierPredicate,
  setupIntercept,
  spyConsole,
  UrlParts,
  TestFeature,
  configureI18n,
  interceptAnalytics,
  TagProps as CommonTagProps,
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

export type SearchInterface = HTMLElement & {
  initialize: (opts: {
    accessToken: string;
    organizationId: string;
  }) => Promise<void>;
  executeFirstSearch: () => void;
  i18n: i18n;
};

export type TagProps = CommonTagProps;

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
  private localizationCompatibilityVersion: i18nCompatibilityVersion = 'v4';
  private disabledAnalytics = false;
  private doNotTrack = false;
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

  public withDoNotTrack() {
    this.doNotTrack = true;
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

  public withoutAutomaticFacets() {
    return this.withCustomResponse((r) => {
      r.generateAutomaticFacets = {
        facets: [],
      };
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

  public get elementAliases() {
    return {
      SearchInterface: 'searchInterface',
    };
  }

  public init() {
    !this.redirected && cy.visit('/') && cy.visit(buildTestUrl(this.hash));
    cy.injectAxe();
    setupIntercept();
    spyConsole();

    cy.window().then((win) => {
      Object.defineProperty(win.navigator, 'doNotTrack', {
        get: () => (this.doNotTrack ? '1' : '0'),
        configurable: true,
      });
    });

    cy.document().then((doc) => {
      this.style = doc.importNode(this.style, true);
      doc.head.appendChild(this.style);
      this.searchInterface = doc.importNode(this.searchInterface, true);
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

      if (this.localizationCompatibilityVersion) {
        searchInterfaceComponent.setAttribute(
          'localization-compatibility-version',
          this.localizationCompatibilityVersion
        );
      }

      if (this.disabledAnalytics) {
        searchInterfaceComponent.setAttribute('analytics', 'false');
      } else {
        interceptAnalytics();
      }

      if (this.responseModifiers.length) {
        modifySearchResponses(this.responseModifiers);
      }

      if (this.returnError) {
        interceptSearchAndReturnError();
      }

      if (!this.initializeInterface) {
        return;
      }
      if (!searchInterfaceComponent.classList.contains('hydrated')) {
        searchInterfaceComponent.initialize(sampleConfig).then(() => {
          configureI18n(
            searchInterfaceComponent.i18n,
            this.translations,
            this.fieldCaptions
          );
          if (this.execFirstSearch) {
            searchInterfaceComponent.executeFirstSearch();
          }
        });

        if (this.execFirstSearch && this.firstIntercept) {
          cy.wait(TestFixture.interceptAliases.Search);
          if (!(this.disabledAnalytics || this.doNotTrack)) {
            cy.wait(TestFixture.interceptAliases.UA);
          }
        }
      }
    });

    this.aliases.forEach((alias) => alias(this));

    return this;
  }
  public waitForComponentHydration(componentTag: string) {
    cy.document()
      .find(componentTag, {timeout: 10e3, includeShadowDom: true})
      .should('have.class', 'hydrated');
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

export const generateLongTextAnswer = () => {
  return new Array(200).fill('This is a long answer.').join(' ');
};
